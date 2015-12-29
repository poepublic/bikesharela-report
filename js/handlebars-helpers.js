var lodashHelperNames = [
  // Array
  'slice',
  'uniq',

  // Collections
  'at',
  'countBy',
  'every',
  'filter',
  'find',
  'findLast',
  'findWhere',
  'groupBy',
  'includes',
  'indexBy',
  'invoke',
  'map',
  'partition',
  'pluck',
  'reject',
  'sample',
  'shuffle',
  'size',
  'some',
  'sort',
  'sortBy',
  'sortByAll',
  'sortByOrder',
  'where',

  // Date
  'now',

  // Object
  'keys'
];

_.each(lodashHelperNames, function(helperName) {
  Handlebars.registerHelper(helperName, function() {
    return _[helperName].apply(this, _.initial(arguments));
  });
});


// Array Prototype Methods
// -----------------------

var arrayPrototypeHelperNames = [
  'reverse'
];

_.each(arrayPrototypeHelperNames, function(helperName) {
  Handlebars.registerHelper(helperName, function(arr) {
    var _arr = _(arr);
    return _arr[helperName].apply(_arr, _(arguments).initial().rest().value()).value();
  });
});


// Comparisons
// -----------

var unaryComparisons = {
  is: function(val) { return !!val; },
  isnt: function(val) { return !val; },
};
var binaryComparisons = {
  gt: function(val1, val2) { return val1 > val2; },
  lt: function(val1, val2) { return val1 < val2; },
  gte: function(val1, val2) { return val1 >= val2; },
  lte: function(val1, val2) { return val1 <= val2; },
  eq: function(val1, val2) { return val1 == val2; },
  ne: function(val1, val2) { return val1 != val2; },
};

_.each(unaryComparisons, function (comp, compName) {
  Handlebars.registerHelper(compName, function() {
    var args = _.initial(arguments), prop;
    // If there are no arguments, then test the value
    // directly.
    if (args.length === 0) {
      return function (val) {
        return comp(val);
      };
    }
    // If an argument is given, it is the dotted path to
    // the value to test.
    else {
      prop = args[0];
      return function (obj) {
        var val = _.get(obj, prop);
        return comp(val);
      };
    }
  });
});

_.each(binaryComparisons, function (comp, compName) {
  Handlebars.registerHelper(compName, function() {
    var args = _.initial(arguments);
    var val2;
    var prop;
    // If there is only one arguments, then test the value
    // directly against it.
    if (args.length === 1) {
      val2 = args[0];
      return function (val1) {
        return comp(val1, val2);
      };
    }
    // If there are two argumnets, the first is the dotted
    // path to the value to test, and the second is the
    // value to compare against.
    else {
      prop = args[0];
      val2 = args[1];
      return function (obj) {
        var val1 = _.get(obj, prop);
        return comp(val1, val2);
      };
    }
  });
});

Handlebars.registerHelper('btw', function(prop, l, r, linc, rinc) {
  var lfunc, rfunc;
  if (l <= r) {
    lfunc = (linc ? binaryComparisons.lte : binaryComparisons.lt);
    rfunc = (rinc ? binaryComparisons.gte : binaryComparisons.gt);
  } else {
    lfunc = (linc ? binaryComparisons.gte : binaryComparisons.gt);
    rfunc = (rinc ? binaryComparisons.lte : binaryComparisons.lt);
  }
  return function(obj) {
    var m = _.get(obj, prop);
    return lfunc(l, m) && rfunc(r, m);
  };
});


// Arithmetic
// ----------

operations = {
  sum: function(a, b) { return a + b; },
  difference: function(a, b) { return a - b; },
  product: function(a, b) { return a * b; },
  quotient: function(a, b) { return a / b; },
};

_.each(operations, function(op, name) {
  Handlebars.registerHelper(name, function(/* values */) {
    var result = arguments[0];

    if (_.size(arguments) === 1) {
      throw name + " expects at least one argument.";
    }

    _.each(_.rest(_.initial(arguments)), function(val) {
      result = op(result, val);
    });

    return result;
  });
});

Handlebars.registerHelper('aspercent', function(val, precision) {
  precision = precision || 0;
  return (val*100).toFixed(precision) + '%';
});