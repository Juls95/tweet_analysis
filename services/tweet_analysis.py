# src/services/tweet_analysis.py
import pandas as pd
import numpy as np
from supabase import create_client
from textblob import TextBlob
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, roc_auc_score
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from collections import Counter
import os
import json
from typing import Dict, List, Tuple, Any

class TweetAnalysisService:
    def __init__(self):
        # Initialize Supabase client
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        )
        
        # Download NLTK data
        nltk.download('punkt')
        nltk.download('stopwords')
        nltk.download('wordnet')
        nltk.download('averaged_perceptron_tagger')
        
        # Initialize NLP tools
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )

    def clean_text(self, text: str) -> str:
        """Clean and preprocess text data."""
        # Handle None or non-string input
        if not isinstance(text, str):
            return ""
            
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        # Remove user mentions
        text = re.sub(r'@\w+', '', text)
        # Remove hashtags
        text = re.sub(r'#\w+', '', text)
        # Remove numbers
        text = re.sub(r'\d+', '', text)
        # Remove special characters
        text = re.sub(r'[^\w\s]', '', text)
        # Convert to lowercase and strip whitespace
        text = text.lower().strip()
        
        return text

    def preprocess_text(self, text: str) -> str:
        """Tokenize, remove stopwords, and lemmatize text."""
        # Clean text
        cleaned_text = self.clean_text(text)
        
        # Tokenize
        tokens = word_tokenize(cleaned_text)
        
        # Remove stopwords and lemmatize
        processed_tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token not in self.stop_words and len(token) > 2
        ]
        
        return ' '.join(processed_tokens)

    def detect_bot(self, tweet: Dict[str, Any]) -> bool:
        """Detect if a tweet is likely from a bot."""
        if not tweet or not isinstance(tweet, dict):
            return False
            
        content = tweet.get('content', '')
        metrics = tweet.get('metrics', {})
        
        # Bot detection criteria
        indicators = [
            content.count('@') > 3,  # Excessive mentions
            len(re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', content)) > 2,  # Multiple URLs
            metrics.get('retweet_count', 0) == 0 and metrics.get('reply_count', 0) == 0,  # No engagement
            len(content) >= 280 and content.count('#') > 5,  # Maximum length with many hashtags
            content.lower().count('follow') > 2,  # Spam-like behavior
            bool(re.search(r'(follow|retweet|like).*(follow|retweet|like)', content.lower())),  # Spam patterns
        ]
        
        return sum(indicators) >= 3

    def get_sentiment(self, text: str) -> Tuple[str, float]:
        """Analyze sentiment of text using TextBlob."""
        if not text:
            return ('neutral', 0.0)
            
        # Get sentiment analysis
        analysis = TextBlob(text)
        polarity = analysis.sentiment.polarity
        
        # Classify sentiment
        if polarity > 0.1:
            return ('positive', polarity)
        elif polarity < -0.1:
            return ('negative', polarity)
        else:
            return ('neutral', polarity)

    async def analyze_hashtag(self, hashtag: str) -> Dict[str, Any]:
        """Analyze tweets for a specific hashtag."""
        try:
            # Fetch tweets from Supabase
            response = self.supabase.table('tweets')\
                .select('*')\
                .eq('search_hashtag', hashtag)\
                .execute()
            
            tweets = response.data
            
            if not tweets:
                return {
                    "error": "No tweets found for hashtag",
                    "hashtag": hashtag
                }

            # Process tweets
            processed_tweets = []
            sentiment_scores = []
            bot_count = 0
            word_frequencies = Counter()

            for tweet in tweets:
                # Clean and process text
                processed_text = self.preprocess_text(tweet['content'])
                
                # Get sentiment
                sentiment, score = self.get_sentiment(processed_text)
                sentiment_scores.append(score)
                
                # Check for bot
                is_bot = self.detect_bot(tweet)
                if is_bot:
                    bot_count += 1
                
                # Update word frequencies
                words = processed_text.split()
                word_frequencies.update(words)
                
                # Store processed tweet
                processed_tweets.append({
                    'tweet_id': tweet['tweet_id'],
                    'processed_text': processed_text,
                    'sentiment': sentiment,
                    'sentiment_score': score,
                    'is_bot': is_bot
                })

            # Calculate statistics
            total_tweets = len(tweets)
            avg_sentiment = sum(sentiment_scores) / total_tweets if sentiment_scores else 0
            
            sentiment_counts = {
                'positive': len([s for s in sentiment_scores if s > 0.1]),
                'neutral': len([s for s in sentiment_scores if -0.1 <= s <= 0.1]),
                'negative': len([s for s in sentiment_scores if s < -0.1])
            }

            # Prepare analysis results
            analysis_results = {
                'hashtag': hashtag,
                'total_tweets': total_tweets,
                'sentiment_distribution': sentiment_counts,
                'average_sentiment': avg_sentiment,
                'most_common_words': word_frequencies.most_common(10),
                'bot_statistics': {
                    'bot_count': bot_count,
                    'human_count': total_tweets - bot_count,
                    'bot_percentage': (bot_count / total_tweets * 100) if total_tweets > 0 else 0
                },
                'processed_tweets': processed_tweets
            }

            # Store analysis results in Supabase
            self.supabase.table('tweet_analysis').upsert({
                'hashtag': hashtag,
                'analysis_date': pd.Timestamp.now().isoformat(),
                'results': analysis_results
            }).execute()

            return analysis_results

        except Exception as e:
            return {
                'error': str(e),
                'hashtag': hashtag
            }

    def train_models(self) -> Dict[str, Any]:
        """Train and evaluate sentiment analysis models."""
        try:
            # Fetch all tweets
            response = self.supabase.table('tweets').select('*').execute()
            tweets = response.data

            if not tweets:
                return {"error": "No training data available"}

            # Prepare training data
            texts = [self.preprocess_text(tweet['content']) for tweet in tweets]
            sentiments = [self.get_sentiment(text)[0] for text in texts]

            # Convert sentiments to numerical values
            sentiment_map = {'positive': 2, 'neutral': 1, 'negative': 0}
            y = np.array([sentiment_map[s] for s in sentiments])

            # Vectorize texts
            X = self.vectorizer.fit_transform(texts)

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Train models
            models = {
                'logistic_regression': LogisticRegression(max_iter=1000),
                'naive_bayes': MultinomialNB(),
                'svm': LinearSVC(max_iter=1000)
            }

            results = {}
            best_model = None
            best_accuracy = 0

            for name, model in models.items():
                model.fit(X_train, y_train)
                predictions = model.predict(X_test)
                accuracy = accuracy_score(y_test, predictions)
                
                results[name] = {
                    'accuracy': accuracy,
                    'confusion_matrix': confusion_matrix(y_test, predictions).tolist(),
                    'roc_auc': roc_auc_score(y_test, predictions, multi_class='ovr')
                }
                
                if accuracy > best_accuracy:
                    best_accuracy = accuracy
                    best_model = name

            # Store model evaluation results
            self.supabase.table('model_evaluation').insert({
                'evaluation_date': pd.Timestamp.now().isoformat(),
                'results': results,
                'best_model': best_model,
                'best_accuracy': best_accuracy
            }).execute()

            return {
                'model_results': results,
                'best_model': best_model,
                'best_accuracy': best_accuracy
            }

        except Exception as e:
            return {'error': str(e)}