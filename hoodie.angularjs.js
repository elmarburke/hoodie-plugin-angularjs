Hoodie.extend(function(hoodie) {

var hoodieModule = angular.module('hoodie', []);

//Takes a callback that takes a single argument,
//and returns a function that will $evalAsync and call that callack
//$evalAsync will just make sure we don't have any $apply-conflicts
function angularDigestFn($rootScope, callback) {
  return function() {
    var args = arguments;
    $rootScope.$evalAsync(function() {
      callback.apply(null, args);
    });
  };
}

//Takes a hoodie event, and will do the following when it fires in addition 
//to calling the function:
// 1. call $apply
// 2. $emit('hoodie:evnetName') on the $rootScope
function hoodieEventWrap(hoodieInstance, eventName, $rootScope,  fn) {
  hoodieInstance.on(eventName, angularDigestFn($rootScope, function(eventData) {
    fn(eventData);
    $rootScope.$emit('hoodie:' + eventName, eventData);
  }));
}

//Takes a hoodie function that returns a promise, and returns a function
//that will call the hoodie function, then take that hoodie promise and
//instead return a $q-promise and $apply when it returns
function hoodiePromiseFnWrap(context, fnName, $q, $rootScope) {
  return function() {
    var args = arguments;
    var deferred = $q.defer();
    context[fnName].apply(context, args).then(
      angularDigestFn($rootScope, deferred.resolve),
      angularDigestFn($rootScope, deferred.reject)
    );
    return deferred.promise;
  };
}


hoodieModule.service('hoodieAcount', ['$rootScope', 'hoodie', '$q',
function($rootScope, hoodie, $q) {
  var service = this;

  //Wrap hoodie fns to turn hoodie promises into angular
  angular.forEach([
    'signUp',
    'signIn',
    'signOut',
    'changePassword',
    'changeUsername',
    'resetPassword',
    'destroy'
  ], function(fnName) {
    service[fnName] = hoodiePromiseFnWrap(hoodie.account, fnName, $q, $rootScope);
  });

  // listen for account events
  angular.forEach([
    // user has signed up (this also triggers the authenticated event, see below)
    'signup',
    // user has signed in (this also triggers the authenticated event, see below)
    'signin',
    // user has signed out
    'signout',
    // user has re-authenticated after their session timed out 
    // (this does _not_ trigger the signin event)
    'authenticated',
    // user's session has timed out. This means the user is still signed in locally, 
    // but Hoodie cannot sync remotely, so the user must sign in again
    'unauthenticated'
  ], function(eventName) {
    hoodieEventWrap(hoodie.account, eventName, $rootScope, function(username) {
      service.username = username;
    });
  });

  this.username = hoodie.account.username;
}]);

hoodieModule.service('hoodieArray', ['$rootScope', 'hoodieStore',
function($rootScope, hoodieStore) {

  this.bind = function ($scope, key, hoodieKey) {

    hoodieKey = hoodieKey || key;

    $scope.$watch(key, function (newValue, oldValue) {
      if (newValue === oldValue || !angular.isArray(newValue) || !angular.isArray(oldValue)) {
        // Init
        hoodieStore.findAll(hoodieKey)
        .then(function (data) {
          $scope[key] = data;
        });
      } else {

        var delta = getDelta(oldValue, newValue, isEqual);
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
          hoodieStore.remove(hoodieKey, item.id);
        }

      }
    }, true);

    hoodie.store.on('change:' + hoodieKey, function (event, changedObject) {
      hoodieStore.findAll(hoodieKey)
      .then(function (data) {
        $scope[key] = data;
      });
    });


  };
}]);

function arrayObjectIndexOf(myArray, searchTerm, property) {
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}

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
    map[ array[i][prop] ] = array[i];
  }
  return map;
}

function isEqual(a, b) {
  return a.title === b.title && a.type === b.type;
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

  for (id in mapN) {
    if (!mapO.hasOwnProperty(id)) {
      delta.added.push(mapN[id]);
    }
  }
  return delta;
}

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


hoodieModule.service('hoodieStore', ['$rootScope', '$q', 'hoodie', 
function($rootScope, $q, hoodie) {
  var service = this;

  angular.forEach([
    'add',
    'update',
    'find',
    'findAll',
    'remove',
    'removeAll'
  ], function(fnName) {
    service[fnName] = hoodiePromiseFnWrap(hoodie.store, 'add', $q, $rootScope);
  });

  service.findAll()
  .then(function (data) {
    data.forEach(function (item) {
      var type = item.type;
      service[type] = service[type] || [];
      service[type].push(item);
    });
  });

  // write custom wrapper here, it's more complicated
  // Events
  hoodie.store.on('change', function (event, changedObject) {
    $rootScope.$evalAsync(function() {
      var type = changedObject.type;
      var id = changedObject.id;

      $rootScope.$emit(event, changedObject);
      $rootScope.$emit('change', event, changedObject);
      $rootScope.$emit(event + ':' + type, changedObject);
      $rootScope.$emit('change' + ':' + type, event, changedObject);
      $rootScope.$emit(event + ':' + type + ':' + id, changedObject);
      $rootScope.$emit('change' + ':' + type + ':' + id, event, changedObject);

      service.findAll(type)
      .then(function (data) {
        service[type] = data;
      });
    });
  });

}]);

});