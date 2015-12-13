function prop(obj, desc) {
  var arr = desc.split(".");
  while(arr.length && (obj = obj[arr.shift()]));
  return obj;
}

Handlebars.registerHelper('groupBy', function(collection, lookup) {
  return _(collection).groupBy(lookup).value();
});