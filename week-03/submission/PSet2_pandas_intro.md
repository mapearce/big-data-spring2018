# Problem Set 2: Intro to Pandas

Building off the in-class workshop, this problem set will require you to use some of Python's data wrangling functions and produce a few simple plots with Matplotlib. These plots will help us begin to think about how the aggregated GPS data works, how it might be useful, and how it might fall short.

## What to Submit

Create a duplicate of this file (`PSet2_pandas_intro.md`) in the provided 'submission' folder; your solutions to each problem should be included in the `python` code block sections beneath the 'Solution' heading in each problem section.

Be careful! We have to be able to run your code. This means that if you, for example, change a variable name and neglect to change every appearance of that name in your code, we're going to run into problems.

## Graphic Presentation

Make sure to label all the axes and add legends and units (where appropriate).

## Code Quality

While code performance and optimization won't count, all the code should be highly readable, and reusable. Where possible, create functions, build helper functions where needed, and make sure the code is self-explanatory.

## Preparing the Data

You'll want to make sure that your data is prepared using the procedure we followed in class. The code is reproduced below; you should simply be able to run the code and reproduce the dataset with well-formatted datetime dates and no erroneous hour values.

```python
import pandas as pd
import numpy as np
import matplotlib.pylab as plt

# This line lets us plot on our ipython notebook
%matplotlib inline

# Read in the data

df = pd.read_csv('../data/skyhook_2017-07.csv', sep=',')
# read in for PH
df = pd.read_csv('/Users/phoebe/Dropbox (MIT)/big-data/data/skyhook_2017-07.csv', sep=',')

# Create a new date column formatted as datetimes.
df['date_new'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

# Determine which weekday a given date lands on, and adjust it to account for the fact that '0' in our hours field corresponds to Sunday, but .weekday() returns 0 for Monday.
df['weekday'] = df['date_new'].apply(lambda x: x.weekday() + 1)
df['weekday'].replace(7, 0, inplace = True)

# Remove hour variables outside of the 24-hour window corresponding to the day of the week a given date lands on.
for i in range(0, 168, 24):
  j = range(0,168,1)[i - 5]
  if (j > i):
    df.drop(df[
    (df['weekday'] == (i/24)) &
    (
    ( (df['hour'] < j) & (df['hour'] > i + 18) ) |
    ( (df['hour'] > i + 18 ) & (df['hour'] < j) )
    )
    ].index, inplace = True)
  else:
    df.drop(df[
    (df['weekday'] == (i/24)) &
    (
    (df['hour'] < j) | (df['hour'] > i + 18 )
    )
    ].index, inplace = True)
```

## Problem 1: Create a Bar Chart of Total Pings by Date

Your first task is to create a bar chart (not a line chart!) of the total count of GPS pings, collapsed by date. You'll have to use `.groupby` to collapse your table on the grouping variable and choose how to aggregate the `count` column. Your code should specify a color for the bar chart and your plot should have a title. Check out the [Pandas Visualization documentation](https://pandas.pydata.org/pandas-docs/stable/visualization.html) for some guidance regarding what parameters you can customize and what they do.

### Solution

```python
df2 = df.groupby('date_new')['count'].sum()
df2.plot.bar(title='Pings per Day!', color = 'red')


```

## Problem 2: Modify the Hours Column

Your second task is to further clean the data. While we've successfully cleaned our data in one way (ridding it of values that are outside the 24-hour window that correspond to a given day of the week) it will be helpful to restructure our `hour` column in such a way that hours are listed in a more familiar 24-hour range. To do this, you'll want to more or less copy the structure of the code we used to remove data from hours outside of a given day's 24-hour window. You'll then want to use the [DataFrame's `replace` method](https://pandas.pydata.org/pandas-docs/stable/generated/pandas.DataFrame.replace.html). Note that you can use lists in both `to_replace` and `value`.

After running your code, you should have either a new column in your DataFrame or new values in the 'hour' column. These should range from 0-23. You can test this out in a couple ways; the simplest is probably to `df['hour'].unique()`; if you're interested in seeing sums of total pings by hour, you can run `df.groupby('hour')['count'].sum()`.

### Solution

```python
for i in range(0, 168, 24):
  j = range(0,168,1)[i - 5]
  if (j > i):
    df['hour'].replace(range(i, i + 19, 1), range(5,24,1), inplace = True)
    df['hour'].replace(range(j, j + 5, 1), range(0,5,1), inplace = True)
  else:
    df['hour'].replace(range(j + 5, i + 24, 1), range(0, 24, 1), inplace = True)
#df['hour'].unique()
```

## Problem 3: Create a Timestamp Column

Now that you have both a date and a time (stored in a more familiar 24-hour range), you can combine them to make a single timestamp. Because the columns in a `pandas` DataFrames are vectorized, this is a relatively simple matter of addition, with a single catch: you'll need to use `pd.to_timedelta` to convert your hours columns to a duration.

### Solution

```python

df['time_stamp'] = df['date_new'] + pd.to_timedelta(df['hour'], unit = 'h')
df['time_stamp'].head()
```

## Problem 4: Create Two Line Charts of Activity by Hour

Create two more graphs. The first should be a **line plot** of **total activity** by your new `timestamp` field---in other words a line graph that displays the total number of GPS pings in each hour over the course of the week. The second should be a **bar chart** of **summed counts** by hours of the day---in other words, a bar chart displaying the sum of GPS pings occurring across locations for each of the day's 24 hours.

### Solution

```python
df3 = df.groupby('time_stamp')['count'].sum()
df3.plot.line(title='Pings per Hour for the Month of July!', color = 'blue')

df4 = df.groupby('hour')['count'].sum()
df4.plot.bar(title='Total Pings in a Given Hour Across July', color = 'green')
```

## Problem 5: Create a Scatter Plot of Shaded by Activity

Pick three times (or time ranges) and use the latitude and longitude to produce scatterplots of each. In each of these scatterplots, the size of the dot should correspond to the number of GPS pings. Find the [Scatterplot documentation here](http://pandas.pydata.org/pandas-docs/version/0.19.1/visualization.html#scatter-plot). You may also want to look into how to specify a pandas Timestamp (e.g., pd.Timestamp) so that you can write a mask that will filter your DataFrame appropriately. Start with the [Timestamp documentation](https://pandas.pydata.org/pandas-docs/stable/timeseries.html#timestamps-vs-time-spans)!

```python

#Create new dataframe with these columns
df5 = df[['hour', 'count', 'lat', 'lon', 'date_new']].copy()

#Create a column called 'Occurrences' where it counts up the number of pings to a given lat/long on a given hour of a given day
#Got my df6 definition formula from: https://stackoverflow.com/questions/33271098/python-get-a-frequency-count-based-on-two-columns-variables-in-pandas-datafra
df6 = df5.groupby(['lat', 'lon', 'hour', 'date_new']).size().reset_index(name='Occurrences')
#Check to make sure there are some times there are multiple pings at same lat/lon location:
#df6['Occurrences'][df6['Occurrences'] > 1]

#Restrict the analysis to July 4
df7 = df6[pd.to_datetime(df6['date_new']) == '2017-07-04']
#df7[df7['Occurrences'] > 1]

#Make some new dataframes that allow us to look at 10am, 2pm, and 6pm
df8 = df7[df7['hour'] == 9]
df9 = df7[df7['hour'] == 14]
df10 = df7[df7['hour'] == 18]

#Plot 'em
df8.plot(kind='scatter', x='lon',y='lat', s=df7['Occurrences'], color = 'blue', label = '10am')
df9.plot(kind='scatter', x='lon',y='lat', s=df7['Occurrences'], color = 'green', label = '2pm')
df10.plot(kind='scatter', x='lon',y='lat', s=df7['Occurrences'], color = 'red', label = '6pm')

## Michael, this is a creative approach and would work if the data were structured differently. If each row in the dataset were a single ping, then your method would work. However, remember we have a column called 'count' -- this is because each row is not a unique ping, but counts of pings. Run this code and see that for one row, there are 2,268 pings accounted for in one row of data.
df['count'].unique()
#This is why you are not seeing cumulative pings, as you note below. Given the structure of our data, here is one way to graph what you are trying to show above.

## july 4th at 2pm and 6pm
july4_2pm = df[df['time_stamp'] == pd.Timestamp('2017-07-04 14:00:00')]
july4_2pm.plot.scatter(x = 'lon', y = 'lat', s = july4_2pm['count'] / 10)
july4_6pm = df[df['time_stamp'] == pd.Timestamp('2017-07-04 18:00:00')]
july4_6pm.plot.scatter(x = 'lon', y = 'lat', s = july4_6pm['count'] / 10)

```

## Problem 6: Analyze Your (Very) Preliminary Findings

For three of the visualizations you produced above, write a one or two paragraph analysis that identifies:

1. A phenomenon that the data make visible (for example, how location services are utilized over the course of a day and why this might by).
2. A shortcoming in the completeness of the data that becomes obvious when it is visualized.
3. How this data could help us identify vulnerabilities related to climate change in the greater Boston area.

I chose July 4th in order to see how a major event that concentrates people in one part of the city would show up on a map.  At first glance, the three times chosen reveal the rhythm of the day: at 10am people are probably waking up and getting ready for the day so there is more concentrated activity in specific pockets of the city. At 2pm and 6pm we see people likely pouring into downtown to situate along the river and in the Boston Common to watch the spectacle! It's really interesting to see that Storrow Drive is quite busy in both of these later timeframes but in the 2pm one, more traffic is coming from the northwest and southeast while at 6pm people are coming in from the north and south and there's a lot more concentrated movement in the heart of the city.

I was disappointed that the lat long pairs don't show more cumulative pings in the chosen hours.  On July 4, there appear to be only 8 lat-long-hour pairings (one pairing at 5a, 10a, 1p, 3p, 7p, and 8p and two pairings at 9a) that have more than one ping.  This may reflect that once a tower is pinged in a given hour, it cannot register additional pings in that hour, which is a huge shortcoming.

Regarding climate change, it appears the roads are close to the river so in a major flooding event, evacuation could be quite difficult.
