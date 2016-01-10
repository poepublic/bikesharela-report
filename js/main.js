var Shareabouts = Shareabouts || {};
Shareabouts.Reports = Shareabouts.Reports || {};

(function(S, R) {
  'use strict';

  // Helper Functions
  // ----------------

  // Get the dirname of the current URL path.
  R.getPageRoot = function() {
    var path = window.location.pathname;
    var lastSlash = path.lastIndexOf('/');
    return path.slice(0, lastSlash + 1);
  };

  // The `attrName` argument is an under_case (lowercase
  // with underscores) attribute name. `getConfigVar` will
  // extract the under_case or camelCase version of the
  // attribute.
  R.getVar = function(config, attrName, undefined) {
    var underAttrName = attrName;
    var camelAttrName = attrName;
    var upos;

    if (config[underAttrName] !== undefined) {
      return config[underAttrName];
    }

    // Replace the underscores in `camelAttrName`.
    // Preserve leading and trailing underscores.
    do {
      upos = camelAttrName.indexOf('_', (upos ? upos + 1 : 1));

      if (upos === -1) { break; }

      if (camelAttrName.length >= upos + 2) {
        camelAttrName = camelAttrName.slice(0, upos) +
                        camelAttrName[upos + 1].toUpperCase() +
                        camelAttrName.slice(upos + 2);
      }
    } while (true);

    return config[camelAttrName];
  };

  // Load the report configuration from an object.
  R.loadConfig = function(config) {
    var datasetUrl = R.getVar(config, 'dataset_url');
    var title = R.getVar(config, 'title');
    var snapshots = {};
    var places, submissions;

    if (!datasetUrl) {
      throw "You must provide a dataset_url in the configuration.";
    }

    if (config.snapshots) {
      R.loadSnapshot(config, datasetUrl + 'places/snapshots/' + R.getVar(config.snapshots, 'places_id'), 'places', snapshots);
      R.loadSnapshot(config, datasetUrl + 'surveys/snapshots/' + R.getVar(config.snapshots, 'surveys_id'), 'submissions', snapshots);
    }
    else {
      places = new S.SnapshotCollection();
      places.url = function() { return datasetUrl + 'places/snapshots'; };

      submissions = new S.SnapshotCollection();
      submissions.url = function() { return datasetUrl + 'surveys/snapshots'; };

      R.prepareData(config, places, 'places', snapshots);
      R.prepareData(config, submissions, 'submissions', snapshots);
    }

    if (title) { document.title = title; }
  };

  R.prepareData = function(config, collection, name, snapshots) {
    var snapshot;
    collection.on('sync', function() {
      if (collection.size() > 0 && R.getVar(config, 'can_use_old')) {
        R.loadSnapshot(config, collection.at(0).get('url'), name, snapshots);
      }
      else {
        snapshot = collection.create({}, {
          success: function() {
            snapshot.waitUntilReady({
              success: function(url) {
                R.loadSnapshot(config, url, name, snapshots);
              }
            });
          }
        });
      }
    });
    collection.fetch();
  };

  R.loadSnapshot = function(config, url, name, snapshots) {
    $.ajax({
      url: url,
      success: function(data) {
        snapshots[name] = data;
        if (snapshots.places && snapshots.submissions) {
          var placemap = {};
          // Only use submissions until the report end
          // date
          snapshots.submissions = _.filter(snapshots.submissions, function (s) { return s.created_datetime < config.la_end_date; });
          // Recalculate the number of submissions on each
          // place based on the number of submissions by
          // the end date.
          _.each(snapshots.places.features, function (p) {
            p.submission_sets = {surveys: {length: 0}};
            placemap[p.id] = p;
          });
          _.each(snapshots.submissions, function (s) {
            placemap[s.place].submission_sets.surveys.length += 1;
          });
          // Render the template.
          R.renderTemplate(_.extend({config: config}, snapshots));
          // Render the map
          $('#map').height($('#map').width());

          cartodb.createVis('map', R.getVar(config, 'cartodb_map'));

          // Render the time chart.
          var countsByDay = {};
          var minDateStr = _.first(config.la_week_ends);
          var maxDateStr = _.last(config.la_week_ends);
          var dateStr = minDateStr;
          var date = new Date(dateStr);
          while (dateStr < maxDateStr) {
            countsByDay[dateStr] = 0;
            date.setDate(date.getDate() + 1);
            dateStr = [(date.getYear() + 1900), _.padLeft(date.getMonth() + 1, 2, '0'), _.padLeft(date.getDate(), 2, '0')].join('-');
          }
          _.each(snapshots.submissions, function (s) {
            var d = s.created_datetime.slice(0, 10);
            if (d < minDateStr) { d = minDateStr; }
            if (d > maxDateStr) { d = maxDateStr; }
            countsByDay[d] += 1;
          });
          var lastVal;
          _.each(_.keys(countsByDay).sort(), function (d) {
            if (d > config.la_end_date) { countsByDay[d] = null; return; }
            if (!countsByDay[d]) { countsByDay[d] = 0; }
            if (!lastVal) { lastVal = countsByDay[d]; return; }
            else { countsByDay[d] += lastVal; lastVal = countsByDay[d]; }
          });
          var chart = c3.generate({
            bindto: '#chart-wrapper',
            size: {
              height: 200
            },
            data: {
              x: 'x',
              xFormat: '%Y-%m-%d',
              rows: [['x', 'count']].concat(_.pairs(countsByDay).sort()),
              type: 'area',
              labels: {
                format: function (v, id, i, j) {
                  if (i % 7 === 6) { return v; }
                }
              }
            },
            axis: {
              x: {
                type: 'timeseries',
                label: 'date of data snapshot'
              },
              y: {
                label: '# of surveys'
              }
            },
            grid: {
              y: {
                show: true
              }
            },
            legend: {
              show: false
            },
            area: {
              zerobased: false
            }
          });
        }
      }
    });
  };

  // Load the report configuration from *config.json*.
  R.fetchConfig = function(config_file) {
    var spinner = new Spinner({color:'#333', lines: 12}).spin();
    $('#report').html(spinner.el);

    $.ajax({
      url: config_file,
      success: R.loadConfig
    });
  };

  R.renderTemplate = function(data) {
    var templateString = $('#report-tpl').html();
    var template = Handlebars.compile(templateString);
    $('#report').html(template(data));
  };

})(Shareabouts, Shareabouts.Reports);
