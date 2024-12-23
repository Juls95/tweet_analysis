# analysis_service.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from textblob import TextBlob
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from collections import Counter
import re
import os
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('omw-1.4', quiet=True)
except Exception as e:
    logger.error(f"Error downloading NLTK data: {e}")
    raise

app = FastAPI()

# Configure CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex="http://localhost:.*"
)

# Initialize Supabase client
try:
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials")
        
    supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    logger.error(f"Error initializing Supabase client: {e}")
    raise

class TweetAnalyzer:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
    def clean_text(self, text: str) -> str:
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
        return text.lower().strip()

    def tokenize_and_clean(self, text: str) -> List[str]:
        try:
            cleaned_text = self.clean_text(text)
            tokens = word_tokenize(cleaned_text)
            return [
                self.lemmatizer.lemmatize(token)
                for token in tokens
                if token not in self.stop_words and len(token) > 2
            ]
        except Exception as e:
            logger.error(f"Error in tokenize_and_clean: {e}")
            return []

    def detect_bot(self, tweet: Dict[str, Any]) -> bool:
        try:
            content = str(tweet.get('content', ''))
            metrics = tweet.get('metrics', {}) or {}
            
            indicators = [
                content.count('@') > 3,
                len(re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', content)) > 2,
                metrics.get('retweet_count', 0) == 0 and metrics.get('reply_count', 0) == 0,
                len(content) >= 280 and content.count('#') > 5,
                content.lower().count('follow') > 2
            ]
            
            return sum(indicators) >= 3
        except Exception as e:
            logger.error(f"Error in detect_bot: {e}")
            return False

    def get_sentiment(self, text: str) -> Dict[str, Any]:
        try:
            if not text:
                return {'label': 'neutral', 'score': 0.0}
                
            blob = TextBlob(str(text))
            polarity = blob.sentiment.polarity
            
            if polarity > 0.1:
                label = 'positive'
            elif polarity < -0.1:
                label = 'negative'
            else:
                label = 'neutral'
                
            return {
                'label': label,
                'score': float(polarity)  # Ensure the score is a float
            }
        except Exception as e:
            logger.error(f"Error in get_sentiment: {e}")
            return {'label': 'neutral', 'score': 0.0}

@app.post("/analyze/{hashtag}")
async def analyze_tweets(hashtag: str):
    try:
        logger.info(f"Starting analysis for hashtag: {hashtag}")
        
        # Fetch tweets from Supabase
        response = supabase.table('tweets')\
            .select('*')\
            .eq('search_hashtag', hashtag)\
            .execute()
        
        tweets = response.data
        
        if not tweets:
            logger.warning(f"No tweets found for hashtag: {hashtag}")
            raise HTTPException(status_code=404, detail="No tweets found for analysis")

        analyzer = TweetAnalyzer()
        processed_tweets = []
        word_counter = Counter()
        sentiment_distribution = {'positive': 0, 'negative': 0, 'neutral': 0}
        bot_count = 0
        total_sentiment = 0.0

        # Process each tweet
        for tweet in tweets:
            try:
                cleaned_tokens = analyzer.tokenize_and_clean(tweet.get('content', ''))
                sentiment = analyzer.get_sentiment(tweet.get('content', ''))
                is_bot = analyzer.detect_bot(tweet)
                
                # Update counters
                word_counter.update(cleaned_tokens)
                sentiment_distribution[sentiment['label']] += 1
                total_sentiment += sentiment['score']
                if is_bot:
                    bot_count += 1

                processed_tweets.append({
                    'tweet_id': str(tweet.get('tweet_id', '')),
                    'cleaned_text': ' '.join(cleaned_tokens),
                    'sentiment': sentiment,
                    'is_bot': is_bot
                })
            except Exception as e:
                logger.error(f"Error processing tweet {tweet.get('tweet_id', 'unknown')}: {e}")
                continue

        # Prepare analysis results
        total_tweets = len(tweets)
        analysis_results = {
            'total_tweets': total_tweets,
            'sentiment_distribution': sentiment_distribution,
            'average_sentiment': float(total_sentiment / total_tweets if total_tweets > 0 else 0),
            'bot_statistics': {
                'bot_count': bot_count,
                'human_count': total_tweets - bot_count,
                'bot_percentage': float((bot_count / total_tweets * 100) if total_tweets > 0 else 0)
            },
            'most_common_words': [list(x) for x in word_counter.most_common(10)],  # Convert tuples to lists
            'processed_tweets': processed_tweets
        }

        # Store analysis results in Supabase
        try:
            supabase.table('tweet_analysis').upsert({
                'hashtag': hashtag,
                'analysis_date': 'now()',
                'results': analysis_results
            }, on_conflict='hashtag').execute()  # Update to match your constraint name
        except Exception as e:
            print(f"Error storing analysis results: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
            # Continue even if storage fails

        return {
            'success': True,
            'data': analysis_results
        }

    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")