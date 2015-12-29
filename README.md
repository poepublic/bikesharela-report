# bikesharela-report
Activity summary


## Installation

You should have [node](https://nodejs.org/en/), [npm](https://www.npmjs.com/), and [bower](http://bower.io/) installed first.

```bash
bower install
```


## Configuration

You need at least one *config.json* file. This file should live in the projet root, alongside *index.html*. The contents of this file should look something like:

```json
{
    "title": "Bikeshare LA Report \u2014 Dec 11-28",

    "dataset_url": "https://shareaboutsapi2.herokuapp.com/api/v2/toole/datasets/bikesharela/",

    "can_use_old": true,

    "cartodb_map": "https://mjumbewu.cartodb.com/api/v2/viz/981fa7fa-aa55-11e5-993d-0ecd1babdde5/viz.json",

    "la_last_week_date": "2015-12-04",
    "la_start_date": "2015-12-11",
    "la_end_date": "2015-12-18",

    "la_week_ends": [
        "2015-11-13",
        "2015-11-20",
        "2015-11-27",
        "2015-12-04",
        "2015-12-11",
        "2015-12-18",
        "2015-12-25",
        "2016-01-01"
    ]
}
```

* **title** is the title of the page.
* **dataset_url** is the root path of the dataset with the map data
* **can_use_old** is a flag that specifies whether the report can use existing dataset snapshots

The rest of the entries are pretty specific to the LA Bikeshare reports. They are used to configure the report map and the chart of responses over time.

Near the bottom of the *index.html* file, there is a line that begins `Shareabouts.Reports.fetchConfig`. This function should take a parameter that matches your config file name.