# api/analyze.py
from http.client import responses
from typing import Dict, Any
import json
from textblob import TextBlob
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from collections import Counter
import re
import os
from supabase import create_client

# Download required NLTK data during cold start
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('omw-1.4', quiet=True)
except Exception as e:
    print(f"Error downloading NLTK data: {e}")

class TweetAnalyzer:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
    # Your existing TweetAnalyzer methods here...

def init_supabase():
    """Initialize Supabase client"""
    url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if not url or not key:
        raise ValueError("Missing Supabase credentials")
    return create_client(url, key)

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create a standardized response"""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(body)
    }

def handler(request):
    """Main handler function for Vercel"""
    # Handle OPTIONS request for CORS
    if request.method == "OPTIONS":
        return create_response(200, {"message": "OK"})

    if request.method != "POST":
        return create_response(405, {"error": "Method not allowed"})

    try:
        # Get hashtag from URL path
        path_parts = request.path.split('/')
        if len(path_parts) < 3:
            return create_response(400, {"error": "Hashtag not provided"})
        
        hashtag = path_parts[-1]  # Get last part of path

        # Initialize Supabase
        supabase = init_supabase()

        # Fetch tweets from Supabase
        response = supabase.table('tweets')\
            .select('*')\
            .eq('search_hashtag', hashtag)\
            .execute()
        
        tweets = response.data
        
        if not tweets:
            return create_response(404, {"error": "No tweets found for analysis"})

        # Initialize analyzer
        analyzer = TweetAnalyzer()
        processed_tweets = []
        word_counter = Counter()
        sentiment_distribution = {'positive': 0, 'negative': 0, 'neutral': 0}
        bot_count = 0
        total_sentiment = 0.0

        # Process tweets
        for tweet in tweets:
            cleaned_tokens = analyzer.tokenize_and_clean(tweet.get('content', ''))
            sentiment = analyzer.get_sentiment(tweet.get('content', ''))
            is_bot = analyzer.detect_bot(tweet)
            
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
            'most_common_words': [list(x) for x in word_counter.most_common(10)],
            'processed_tweets': processed_tweets
        }

        # Store analysis results
        try:
            supabase.table('tweet_analysis').upsert({
                'hashtag': hashtag,
                'analysis_date': 'now()',
                'results': analysis_results
            }, on_conflict='hashtag').execute()
        except Exception as e:
            print(f"Error storing analysis results: {str(e)}")
            # Continue even if storage fails

        return create_response(200, {
            'success': True,
            'data': analysis_results
        })

    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return create_response(500, {
            'success': False,
            'error': str(e)
        })

# Requirements for vercel.json:
"""
{
  "version": 2,
  "builds": [
    { "src": "api/analyze.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/analyze/(.*)", "dest": "api/analyze.py" }
  ]
}
"""