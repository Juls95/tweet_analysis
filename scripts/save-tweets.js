// scripts/save-tweets.js
const fs = require('fs');
const path = require('path');

// Your Twitter API response here
const twitterData = {
    
        "success": true,
        "data": {
          "tweets": [
            {
              "id": "1870215710070259940",
              "text": "RT @WiseCrypto_: 🥳 Wise Crypto Mega #Giveaway 13\n\n🏆 Prize Pool - $900 $USDT\n\nTo Enter\n✅ Like, RT &amp; Tag 3 Friends\n✅ Complete #TaskOn https:/…",
              "created_at": "2024-12-20T21:12:26.000Z",
              "metrics": {
                "retweet_count": 50471,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1870215283375321088",
                "username": "AmeeAriana96437",
                "name": "Amee Ariana",
                "profile_image_url": "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "Giveaway",
                "TaskOn"
              ],
              "mentions": [
                "WiseCrypto_"
              ]
            },
            {
              "id": "1870215705989169640",
              "text": "RT @WiseCrypto_: 🥳 Wise Crypto Mega #Giveaway 13\n\n🏆 Prize Pool - $900 $USDT\n\nTo Enter\n✅ Like, RT &amp; Tag 3 Friends\n✅ Complete #TaskOn https:/…",
              "created_at": "2024-12-20T21:12:25.000Z",
              "metrics": {
                "retweet_count": 50471,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1853966695733637120",
                "username": "OpichkaTha5935",
                "name": "Thanh Opichka",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1853966765686239232/xAc5Ri6h_normal.jpg",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "Giveaway",
                "TaskOn"
              ],
              "mentions": [
                "WiseCrypto_"
              ]
            },
            {
              "id": "1870215698355789916",
              "text": "RT @WiseCrypto_: 🥳 Wise Crypto Mega #Giveaway 13\n\n🏆 Prize Pool - $900 $USDT\n\nTo Enter\n✅ Like, RT &amp; Tag 3 Friends\n✅ Complete #TaskOn https:/…",
              "created_at": "2024-12-20T21:12:24.000Z",
              "metrics": {
                "retweet_count": 50471,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1870215266564755457",
                "username": "AmbroseAud77262",
                "name": "Ambrose Audrey",
                "profile_image_url": "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "Giveaway",
                "TaskOn"
              ],
              "mentions": [
                "WiseCrypto_"
              ]
            },
            {
              "id": "1870215692370239598",
              "text": "@JKoubaisi @Adams_K1 عندما يتعلق الأمر بالتداول، لم أر أبدًا متداولًا ناجحًا مثل @gh_jvn27076، فهو يتمتع بخبرة في التداول، وكل إشاراته مربحة، لقد ربحت أكثر من 200 ألف دولار في غضون أسابيع قليلة، وتحليله لـ #btc #futures مذهل، انضم إلى قناته على Telegram واشكرني لاحقًا",
              "created_at": "2024-12-20T21:12:22.000Z",
              "metrics": {
                "retweet_count": 0,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "2438227950",
                "username": "fisikacl",
                "name": "Hassan",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1853694848559169536/kmDQA6Y5_normal.jpg",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "btc",
                "futures"
              ],
              "mentions": [
                "JKoubaisi",
                "Adams_K1",
                "gh_jvn27076"
              ]
            },
            {
              "id": "1870215686490137068",
              "text": "#Bitcoin sert düşüyorken #Altcoin'lerin çakılmamasının tek bir sebebi var:\n\n#Btc.#Dominans Sert düşüyor. Kanalın dip bölgesine gelmek üzere. Yukarı döndüğü anda sert çekilmelere hazır olun! https://t.co/vDJcze7QDz",
              "created_at": "2024-12-20T21:12:21.000Z",
              "metrics": {
                "retweet_count": 0,
                "reply_count": 0,
                "like_count": 2,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1493655658301902858",
                "username": "Tradermert_",
                "name": "Trader Mert",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1669460014698725384/HyQ14Wuz_normal.jpg",
                "verified": false
              },
              "media": [
                {
                  "media_key": "3_1870215674104053760",
                  "type": "photo",
                  "url": "https://pbs.twimg.com/media/GfRXPyxXAAAM2BT.jpg"
                }
              ],
              "hashtags": [
                "Bitcoin",
                "Altcoin",
                "Btc",
                "Dominans"
              ],
              "mentions": []
            },
            {
              "id": "1870215678172844432",
              "text": "RT @vigolar: El Salvador buys 11 $BTC just one day after securing a $1.4B IMF deal limiting government #Bitcoin activity. 🚨 #BTC",
              "created_at": "2024-12-20T21:12:19.000Z",
              "metrics": {
                "retweet_count": 109,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1782355689521958912",
                "username": "jeywinx",
                "name": "jeywinx",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1867018304927436801/WW9Q3IAT_normal.jpg",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "Bitcoin",
                "BTC"
              ],
              "mentions": [
                "vigolar"
              ]
            },
            {
              "id": "1870215671860408372",
              "text": "RT @Bitcoin__whale: 4 #BTC\n\nA person who retweets, follows me will receive 4 $BTC ( $390,000 ) (yes, for real)\n\n📌 Retweet my pinned post ht…",
              "created_at": "2024-12-20T21:12:17.000Z",
              "metrics": {
                "retweet_count": 368,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1833382037341782016",
                "username": "DAMRUL07",
                "name": "DAMRUL",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1834129424943386624/djoo9R8K_normal.jpg",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "BTC"
              ],
              "mentions": [
                "Bitcoin__whale"
              ]
            },
            {
              "id": "1870215669783957734",
              "text": "@AlexGreatTurbo @dr_crypto_calls @Turbo_CTO @BNBCHAIN @cryptogemz2024 @MonstersCoins @MorphwareAI #Turbo #Turbo_BSC $Turbo #BTC #ETH #SOL \n#Memecoin #Crypto",
              "created_at": "2024-12-20T21:12:17.000Z",
              "metrics": {
                "retweet_count": 0,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1840501090971942912",
                "username": "chloe_adam91157",
                "name": "Chloe Adams",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1846142844131524608/XwoHqCKL_normal.jpg",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "Turbo",
                "Turbo_BSC",
                "BTC",
                "ETH",
                "SOL",
                "Memecoin",
                "Crypto"
              ],
              "mentions": [
                "AlexGreatTurbo",
                "dr_crypto_calls",
                "Turbo_CTO",
                "BNBCHAIN",
                "cryptogemz2024",
                "MonstersCoins",
                "MorphwareAI"
              ]
            },
            {
              "id": "1870215658367246527",
              "text": "Working on exhaustions and lower timeframes today\n\n#bitcoin #btc $btc #crypto #buildinpublic https://t.co/xU82wQMtSR",
              "created_at": "2024-12-20T21:12:14.000Z",
              "metrics": {
                "retweet_count": 0,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 3
              },
              "author": {
                "id": "1808628477664636929",
                "username": "AdamVoulstaker",
                "name": "Adam Voulstaker",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1809026854608908288/snBSbf9B_normal.jpg",
                "verified": false
              },
              "media": [
                {
                  "media_key": "3_1870215330259447809",
                  "type": "photo",
                  "url": "https://pbs.twimg.com/media/GfRW7x2asAE-9OF.jpg"
                },
                {
                  "media_key": "3_1870215478138032128",
                  "type": "photo",
                  "url": "https://pbs.twimg.com/media/GfRXEYva0AArFoG.jpg"
                }
              ],
              "hashtags": [
                "bitcoin",
                "btc",
                "crypto",
                "buildinpublic"
              ],
              "mentions": []
            },
            {
              "id": "1870215657540755585",
              "text": "RT @WiseCrypto_: 🥳 Wise Crypto Mega #Giveaway 13\n\n🏆 Prize Pool - $900 $USDT\n\nTo Enter\n✅ Like, RT &amp; Tag 3 Friends\n✅ Complete #TaskOn https:/…",
              "created_at": "2024-12-20T21:12:14.000Z",
              "metrics": {
                "retweet_count": 50471,
                "reply_count": 0,
                "like_count": 0,
                "quote_count": 0,
                "bookmark_count": 0,
                "impression_count": 0
              },
              "author": {
                "id": "1850498097249722368",
                "username": "MoanJ18122",
                "name": "Moan Jeannine",
                "profile_image_url": "https://pbs.twimg.com/profile_images/1850498165038104576/1ZSiAsX-_normal.jpg",
                "verified": false
              },
              "media": [],
              "hashtags": [
                "Giveaway",
                "TaskOn"
              ],
              "mentions": [
                "WiseCrypto_"
              ]
            }
          ],
          "meta": {
            "newest_id": "1870215710070259940",
            "oldest_id": "1870215657540755585",
            "result_count": 10,
            "next_token": "b26v89c19zqg8o3frr6qnc9d494n8ltysynjnp3bvsewt"
          }
        },
        "stored": [],
        "rateLimits": {
          "remaining": "0",
          "resetsAt": "12/20/2024, 3:27:37 PM"
        }
      
};

const filePath = path.join(__dirname, '..', 'data', 'saved_tweets.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'data'));
}

// Save the data
fs.writeFileSync(filePath, JSON.stringify(twitterData, null, 2));
console.log('Saved tweets to:', filePath);