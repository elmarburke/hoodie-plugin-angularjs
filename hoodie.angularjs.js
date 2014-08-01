angular.module('hoodie', []);
angular.module('hoodie').factory('hoodieAccount', [
  '$rootScope',
  'hoodie',
  '$q',
  function ($rootScope, hoodie, $q) {
    var service = {};
    //Wrap hoodie fns to turn hoodie promises into angular
    angular.forEach(hoodie.account, function (propertyValue, propertyName) {
      if (angular.isFunction(propertyValue)) {
        service[propertyName] = function () {
          return $q.when(hoodie.account[propertyName].apply(hoodie.account, arguments));
        };
      } else {
        // TODO: Problem by value (copied, ref gets lost)
        service[propertyName] = hoodie.account[propertyName];
      }
    });
    // TODO: is there a 'ENUM' in hoodie for such events?
    // listen for account events
    angular.forEach([
      'signup',
      'signin',
      'signout',
      'authenticated',
      'unauthenticated'
    ], function (eventName) {
      hoodie.account.on(eventName, function (username) {
        $rootScope.$apply(function () {
          service.username = username;
        });
        $rootScope.$emit('hoodie:' + eventName, arguments);
      });
    });
    service.username = hoodie.account.username;
    return service;
  }
]);
angular.module('hoodie').factory('hoodieArray', [
  'hoodieStore',
  function (hoodieStore) {
    var service = {};
    service.bind = function ($scope, key, hoodieKey) {
      hoodieKey = hoodieKey || key;
      $scope[key] = $scope[key] || [];
      hoodieStore.findAll(hoodieKey).then(function (data) {
        $scope[key] = data;
      });
      $scope.$watch(key, function (newValue, oldValue) {
        if (newValue === oldValue || !angular.isArray(newValue) || !angular.isArray(oldValue)) {
        } else {
          var delta = getDelta(oldValue, newValue, angular.equals);
          var item;
          var key;
          // first, add new items
          for (key in delta.added) {
            item = delta.added[key];
            hoodieStore.add(hoodieKey, item);
          }
          // then, the changed items
          for (key in delta.changed) {
            item = delta.changed[key];
            hoodieStore.update(hoodieKey, item.id, item);
          }
          // Last, lets delete items
          for (key in delta.deleted) {
            item = delta.deleted[key];
            // Only delete the item if there isn't an id, otherwise when a new
            // item is added, the first call to $watch will add the item and the
            // second call will remove this same item.
            // TODO: Danger! false ID values would be ignored e.g. id = 0
            if (item.id) {
              hoodieStore.remove(hoodieKey, item.id);
            }
          }
        }
      }, true);
      hoodieStore.on('change:' + hoodieKey, function () {
        hoodieStore.findAll(hoodieKey).then(function (data) {
          $scope[key] = data;
        });
      });
    };
    /**
     * Creates a map out of an array be choosing what property to key by
     * @param {object[]} array Array that will be converted into a map
     * @param {string} prop Name of property to key by
     * @return {object} The mapped array. Example:
     *     mapFromArray([{a:1,b:2}, {a:3,b:4}], 'a')
     *     returns {1: {a:1,b:2}, 3: {a:3,b:4}}
     */
    function mapFromArray(array, prop) {
      var map = {};
      for (var i = 0; i < array.length; i++) {
        map[array[i][prop]] = array[i];
      }
      return map;
    }
    /**
     * @param {object[]} o old array of objects
     * @param {object[]} n new array of objects
     * @param {object} An object with changes
     */
    function getDelta(o, n, comparator) {
      var delta = {
          added: [],
          deleted: [],
          changed: []
        };
      var mapO = mapFromArray(o, 'id');
      var mapN = mapFromArray(n, 'id');
      var id;
      for (id in mapO) {
        if (!mapN.hasOwnProperty(id)) {
          delta.deleted.push(mapO[id]);
        } else if (!comparator(mapN[id], mapO[id])) {
          delta.changed.push(mapN[id]);
        }
      }
      // New attributes cannot be mapped by id as the id is undefined and
      // there may be more than 1 new item
      for (var k in n) {
        if (!n[k].id) {
          // new?
          delta.added.push(n[k]);
        }
      }
      return delta;
    }
    // Public API
    return { bind: service.bind };
  }
]);
angular.module('hoodie').factory('hoodieObject', [
  'hoodieStore',
  '$rootScope',
  function (hoodieStore, $rootScope) {
    var service = {};
    function updateObject(des, src) {
      angular.forEach(des, function (value, key) {
        if (!src.hasOwnProperty(key)) {
          delete des[key];
        }
      });
      angular.extend(des, src);
      return des;
    }
    service.bind = function (store, hoodieId) {
      if (angular.isUndefined(store)) {
        throw new Error('[hoodie-angular-plugin(HoodieObjects.bind)]: A store must be given');
      }
      var angularItem = {};
      var promise;
      if (angular.isUndefined(hoodieId)) {
        promise = hoodieStore.add(store, angularItem).then(function (createdHoodieItem) {
          hoodieId = createdHoodieItem.id;
          updateObject(angularItem, createdHoodieItem);
        });
      } else {
        promise = hoodieStore.find(store, hoodieId).then(function (hoodieItem) {
          angular.extend(angularItem, hoodieItem);
        });
      }
      $rootScope.$watch(function () {
        return angularItem;
      }, function (changedAngularItem) {
        hoodieStore.update(store, hoodieId, changedAngularItem);
      }, true);
      promise.then(function () {
        $rootScope.$on('change:' + hoodieId + ':' + store, function (event, changedHoodieItem) {
          updateObject(angularItem, changedHoodieItem);
        });
      });
      return angularItem;
    };
    // Public API
    return { bind: service.bind };
  }
]);
angular.module('hoodie').provider('hoodie', function () {
  var hoodieUrl;
  this.url = function (url) {
    if (arguments.length) {
      hoodieUrl = url;
    }
    return url;
  };
  this.$get = [
    '$location',
    function ($location) {
      if (!hoodieUrl) {
        hoodieUrl = $location.absUrl().replace('/#' + $location.path(), '');
      }
      return new Hoodie(hoodieUrl);
    }
  ];
});
angular.module('hoodie').factory('hoodieStore', [
  '$rootScope',
  '$q',
  'hoodie',
  function ($rootScope, $q, hoodie) {
    var service = {};
    angular.forEach(hoodie.store, function (propertyValue, propertyName) {
      if (angular.isFunction(propertyValue)) {
        service[propertyName] = function () {
          return $q.when(hoodie.store[propertyName].apply(hoodie.store, arguments));
        };
      } else {
        // TODO: Problem by value (copied, ref gets lost)
        service[propertyName] = hoodie.store[propertyName];
      }
    });
    // If I'll create an store named findAll this will crash, ya??
    service.findAll().then(function (data) {
      data.forEach(function (item) {
        var type = item.type;
        service[type] = service[type] || [];
        service[type].push(item);
      });
    });
    // write custom wrapper here, it's more complicated
    // Events
    hoodie.store.on('change', function (event, changedObject) {
      $rootScope.$evalAsync(function () {
        var type = changedObject.type;
        var id = changedObject.id;
        $rootScope.$emit(event, changedObject);
        $rootScope.$emit('change', event, changedObject);
        $rootScope.$emit(event + ':' + type, changedObject);
        $rootScope.$emit('change' + ':' + type, event, changedObject);
        $rootScope.$emit(event + ':' + type + ':' + id, changedObject);
        $rootScope.$emit('change' + ':' + type + ':' + id, event, changedObject);
        service.findAll(type).then(function (data) {
          service[type] = data;
        });
      });
    });
    return service;
  }
]);