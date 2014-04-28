angular.module('hoodie')
  .provider('hoodie', [function () {
    var hoodieUrl;
    this.url = function (url) {
      if (arguments.length) {
        hoodieUrl = url;
      }
      return url;
    };

    this.$get = function ($location) {
      if (!hoodieUrl) {
        hoodieUrl = $location.absUrl().replace('/#' + $location.path(), '');
      }
      return new Hoodie(hoodieUrl);
    };

  }]);
