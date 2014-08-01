angular.module('hoodie')
  .factory('hoodieObject',
  function (hoodieStore, $rootScope) {

    var service = {};

    function updateObject(des, src) {
      angular.forEach(des, function(value, key) {
        if(!src.hasOwnProperty(key)) {
          delete des[key];
        }
      });
      angular.extend(des, src);
      return des;
    }

    service.bind = function (store, hoodieId) {
      if(angular.isUndefined(store)) {
        throw new Error('[hoodie-angular-plugin(HoodieObjects.bind)]: A store must be given');
      }

      var angularItem = {};

      var promise;

      if(angular.isUndefined(hoodieId)) {
        promise = hoodieStore.add(store, angularItem)
          .then(function(createdHoodieItem) {
            hoodieId = createdHoodieItem.id;
            updateObject(angularItem, createdHoodieItem);
          });
      } else {
        promise = hoodieStore.find(store, hoodieId)
          .then(function(hoodieItem) {
            angular.extend(angularItem, hoodieItem);
          });
      }

      $rootScope.$watch(function(){
        return angularItem;
      }, function(changedAngularItem) {
        hoodieStore.update(store, hoodieId, changedAngularItem);
      }, true);

      promise.then(function() {
        $rootScope.$on('change:' + hoodieId + ':' + store, function(event, changedHoodieItem) {
          updateObject(angularItem, changedHoodieItem);
        });
      });

      return angularItem;
    };


    // Public API
    return {
      bind: service.bind
    };
  });

