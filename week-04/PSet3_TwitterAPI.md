# Problem Set 3: Scraping and Cleaning Twitter Data

Now that you know how to scrape data from Twitter, let's extend the exercise a little so you can show us what you know. You will set up the scraper, clean the resulting data, and visualize it. Make sure you get your own Twitter key (AND make sure that you don't accidentally push it to GitHub); careful with your `.gitignore`.

## Graphic Presentation

Make sure to label all your axes and add legends and units (where appropriate)! Think of these graphs as though they were appearing in a published report for an audience unfamiliar with the data.

## Don't Work on Incomplete Data!

One of the dangers of cleaning data is that you inadvertently delete data that is pertinent to your analysis. If you find yourself getting strange results, you can always run previous portions of your script again to rewind your data. See the section called 'reloading your Tweets in the workshop.

## Deliverables

### Push to GitHub

1. A Python script that contains your scraper code in the provided submission folder. You can copy much of the provided scraper, but you'll have to customize it. This should include the code to generate two scatterplots, and the code you use to clean your datasets.
2. Extra Credit: A Python script that contains the code you used to scrape Wikipedia with the BeautifulSoup library.

### Submit to Stellar

1. Your final CSV files---one with no search term, one with your chosen search term---appropriately cleaned.
2. Extra Credit: A CSV file produced by your BeautifulSoup scraper.

## Instructions

### Step 1

Using the Twitter REST API, collect at least 2,000 tweets. Do not specify a search term. Use a lat/lng of `42.359416,-71.093993` and a radius of `5mi`. This will take 1-2 minutes to run.

```python
import jsonpickle
import tweepy
import pandas as pd
import os

from twitter_keys import api_key, api_secret
def auth(key, secret):
  auth = tweepy.AppAuthHandler(key, secret)
  api = tweepy.API(auth, wait_on_rate_limit = True, wait_on_rate_limit_notify = True)
  # Print error and exit if there is an authentication error
  if (not api):
      print ("Can't Authenticate")
      sys.exit(-1)
  else:
      return api

api = auth(api_key, api_secret)


def get_tweets(
  geo,
  out_file,
  search_term = '',
  tweet_per_query = 100,
  tweet_max = 2000,
  since_id = None,
  max_id = -1,
  write = False
  ):
  tweet_count = 0
  all_tweets = pd.DataFrame()
  while tweet_count < tweet_max:
    try:
      if (max_id <= 0):
        if (not since_id):
          new_tweets = api.search(q = search_term, rpp = tweet_per_query, geocode = geo)
        else:
          new_tweets = api.search(q = search_term, rpp = tweet_per_query, geocode = geo, since_id = since_id)
      else:
        if (not since_id):
          new_tweets = api.search(q = search_term, rpp = tweet_per_query, geocode = geo, max_id = str(max_id - 1))
        else:
          new_tweets = api.search(q = search_term, rpp = tweet_per_query, geocode = geo, max_id = str(max_id - 1), since_id = since_id)
      if (not new_tweets):
        print("No more tweets found")
        break
      for tweet in new_tweets:
        all_tweets = all_tweets.append(parse_tweet(tweet), ignore_index = True)
        if write == True:
            with open(out_file, 'w') as f:
                f.write(jsonpickle.encode(tweet._json, unpicklable=False) + '\n')
      max_id = new_tweets[-1].id
      tweet_count += len(new_tweets)
    except tweepy.TweepError as e:
      # Just exit if any error
      print("Error : " + str(e))
      break
  print (f"Downloaded {tweet_count} tweets.")
  return all_tweets

def parse_tweet(tweet):
  p = pd.Series()
  if tweet.coordinates != None:
    p['lat'] = tweet.coordinates['coordinates'][0]
    p['lon'] = tweet.coordinates['coordinates'][1]
  else:
    p['lat'] = None
    p['lon'] = None
  p['location'] = tweet.user.location
  p['id'] = tweet.id_str
  p['content'] = tweet.text
  p['user'] = tweet.user.screen_name
  p['user_id'] = tweet.user.id_str
  p['time'] = str(tweet.created_at)
  return p


# Setup a Lat Lon
latlng = '42.359416,-71.093993' # Specified LatLong
# Search distance = 5mi
radius = '5mi'
# See tweepy API reference for format specifications
geocode_query = latlng + ',' + radius
file_name = 'data/PStweets.json'
t_max = 2005

#Run 'em like run 'em run 'em woop
tweets = get_tweets(geo = geocode_query, tweet_max = t_max, write = True, out_file = file_name)

```

### Step 2

Clean up the data so that variations of the same user-provided location name are replaced with a single variation. Once you've cleaned up the locations, create a pie chart of user-provided locations. Your pie chart should strive for legibility! Let the [`matplotlib` documentation](https://matplotlib.org/api/_as_gen/matplotlib.axes.Axes.pie.html) be your guide!

```python
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline

tweets.dtypes
loc_tweets = tweets[tweets['location'] != '']
count_tweets = loc_tweets.groupby('location')['id'].count()
df_count_tweets = count_tweets.to_frame()
df_count_tweets
df_count_tweets.columns
df_count_tweets.columns = ['count']
df_count_tweets

#tweets['location'].unique()
#I had this one tweet whose location, "Boston Ma$$," was throwing me an error so I had to delete it...
tweets = tweets[tweets['location'] != 'Boston Ma$$']

df_count_tweets.sort_values(['count'], ascending = False)


#RegEx for Boston ONLY and everyone else gets categorized as "Elsewhere" (Yes, including Cambridge, Somerville, etc #sorrynotsorry)
s4 = pd.Series(tweets['location'])
#s4.head(30)
#s4.describe()
s4 = s4.str.strip()
s4 = s4.str.lower()
#s4.head(50)
tweets['new_location'] = s4.str.contains('boston',na=False)
tweets.head()
[tweets['new_location'] == True] = 'Boston'
tweets['BostonOrNot'].replace(False,'Elsewhere', inplace = True)
tweets.head(50)
#tweets[tweets['new_location'] == False] = 'Elsewhere'

pieTweet = tweets.groupby('BostonOrNot').count()
#pieTweet.head()

#I've created an extremely legible breakdown of unique locations
plt.pie(pieTweet['new_location'], labels = tweets['BostonOrNot'].unique())
```


### Step 3

Create a scatterplot showing all of the tweets are that are geolocated (i.e., include a latitude and longitude).

```python
#Sorted out all tweets with NaN geolocations based on: https://stackoverflow.com/questions/13413590/how-to-drop-rows-of-pandas-dataframe-whose-value-in-certain-columns-is-nan
geoTweets = tweets[np.isfinite(tweets['lat'])]
geoTweets.plot(kind='scatter', x='lon', y='lat', color='blue')

```

### Step 4

Pick a search term (e.g., "housing", "climate", "flood") and collect tweets containing it. Use the same lat/lon and search radius for Boston as you used above. Use a maximum of 2,000 tweets; depending on the search term, you may find that there are fewer than 2,000 tweets available.

```python
searchfile = 'data/searchTweets.json'
searchTweets = get_tweets(geo = geocode_query, search_term = 'housing', tweet_max = t_max, write = True, out_file = searchfile)

```

### Step 5

Clean the search term data as with the previous data.

```python

#searchTweets.dtypes
sea_tweets = searchTweets[searchTweets['location'] != '']
countSea_tweets = sea_tweets.groupby('location')['id'].count()
df_countSea_tweets = countSea_tweets.to_frame()
df_countSea_tweets
df_countSea_tweets.columns
df_countSea_tweets.columns = ['count']
#df_count_tweets
df_count_tweets1.sort_values(['count'], ascending = False)

```


### Step 6

Create a scatterplot showing all of the tweets that include your search term that are geolocated (i.e., include a latitude and longitude).

```python
#searchTweets.head()
geoSeaTweets = searchTweets[np.isfinite(searchTweets['lat'])]
#geoSeaTweets.head(50)
geoSeaTweets.plot(kind='scatter', x='lon', y='lat', color='blue')
#Only one geotagged tweet! INCONCEIVABLE!

```

### Step 7

Export your scraped Twitter datasets (one with a search term, one without) to two CSV files. We will be checking this CSV file for duplicates and for consistent location names, so make sure you clean carefully!

```python
searchTweets.to_csv('submission/SearchTweets.csv', sep=',')
tweets.to_csv('submission/PSTweets.csv', sep=',')
```

## Extra Credit Opportunity

Build a scraper that downloads and parses the Wikipedia [List of Countries by Greenhouse Gas Emissions page](https://en.wikipedia.org/wiki/List_of_countries_by_greenhouse_gas_emissions) using BeautifulSoup and outputs the table of countries as as a CSV.
