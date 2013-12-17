var HOODIE_URL_ERROR = "No url for hoodie set! Please set the hoodie url using hoodieProvider. Example: \n  myApp.config(function(hoodieProvider) {\n    hoodieProvider.url('http://myapp.dev/_api'); });  \n  });";
hoodieModule.provider('hoodie', [function() {
  var hoodieUrl;
  this.url = function(url) {
    if (arguments.length) {
      hoodieUrl = url;
    }
    return url;
  };

  this.$get = function() {
    if (!hoodieUrl) {
      throw new Error(HOODIE_URL_ERROR);
    }
    return new Hoodie(hoodieUrl);
  };

}]);
