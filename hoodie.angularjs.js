Hoodie.extend(function (hoodie) {
  var hoodieModule = angular.module('hoodieModule', []);

  hoodieModule.service('hoodieAccount', function ($rootScope) {
    var service = this;
    this.signUp = hoodie.account.signUp;
    this.signIn = hoodie.account.signIn;
    this.signOut = hoodie.account.signOut;
    this.changePassword = hoodie.account.changePassword;
    this.changeUsername = hoodie.account.changeUsername;
    this.resetPassword = hoodie.account.resetPassword;
    this.destroy = hoodie.account.destroy;
    $rootScope.username = this.username = hoodie.account.username;

    // listen for account events
    // user has signed up (this also triggers the authenticated event, see below)
    hoodie.account.on('signup', function (user) {
      $rootScope.$apply(function () {
        service.username = user;
        $rootScope.$emit('signup', user);
      });
    });

    // user has signed in (this also triggers the authenticated event, see below)
    hoodie.account.on('signin', function (user) {
      $rootScope.$apply(function () {
        service.username = user;
        $rootScope.$emit('signin', user);
      });
    });

    // user has signed out
    hoodie.account.on('signout', function (user) {
      $rootScope.$apply(function () {
        service.username = user;
        $rootScope.$emit('signout', user);
      });
    });

    // user has re-authenticated after their session timed out (this does _not_ trigger the signin event)
    hoodie.account.on('authenticated', function (user) {
      $rootScope.$apply(function () {
        service.username = user;
        $rootScope.$emit('authenticated', user);
      });
    });

    // user's session has timed out. This means the user is still signed in locally, but Hoodie cannot sync remotely, so the user must sign in again
    hoodie.account.on('unauthenticated', function (user) {
      $rootScope.$apply(function () {
        service.username = user;
        $rootScope.$emit('unauthenticated', user);
      });
    });

  });

  hoodieModule.service('hoodieStore', function ($rootScope, $q) {
    var service = this;

    // add a new object
    this.add = function (type, attributes) {
      var deferred = $q.defer();

      hoodie.store.add(type, attributes)
        .done(function (newObject) {
          deferred.resolve(newObject);
        });

      return deferred.promise;
    };

    // update an existing object
    this.update = function (type, id, update) {
      var deferred = $q.defer();

      hoodie.store.update(type, id, update)
        .done(function (updatedObject) {
          deferred.resolve(updatedObject);
        });

      return deferred.promise;
    };

    // find one object
    this.find = function (type, id) {
      var deferred = $q.defer();

      hoodie.store.find(type, id)
        .done(function (object) {
          deferred.resolve(object);
        });

      return deferred.promise;
    };

    // Load all objects that belong to the current user
    // Load all objects of one type, also belonging to the current user
    // findAll also accepts a function as an argument. If that function returns true for an object in the store, it will be returned. This effectively lets you write complex queries for the store. In this simple example, assume all of our todo tasks have a key "status", and we want to find all unfinished tasks:
    this.findAll = function (search) {
      var deferred = $q.defer();

      hoodie.store.findAll(search)
        .done(function (objects) {
          deferred.resolve(objects);
        });

      return deferred.promise;
    };

    // remove an existing object belonging to the current user
    this.remove = function (type, id) {
      var deferred = $q.defer();

      hoodie.store.remove(type, id)
        .done(function (removedObject) {
          deferred.resolve(removedObject);
        });

      return deferred.promise;
    };

    // Remove all objects of one type, also belonging to the current user
    // removeAll, like findAll, also accepts a function as an argument. If that function returns true for an object in the store, it will be removed. Assuming all of our todo tasks have a key "status", and we want to remove all completed tasks:
    this.removeAll = function (type) {
      var deferred = $q.defer();

      hoodie.store.removeAll(type)
        .done(function (objects) {
          deferred.resolve(objects);
        });

      return deferred.promise;
    };

    // Make an Array

    service.findAll()
      .then(function (data) {
        data.forEach(function (item) {
          var type = item.type;
          service[type] = service[type] || [];
          service[type].push(item);
        });
      });

    // Events

    hoodie.store.on('change', function (event, changedObject) {
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

  hoodieModule.service('hoodieArray', function ($rootScope, hoodieStore) {
    "use strict";

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

          // first, add new items
          for (var addedIdx in delta.added) {
            var item = delta.added[addedIdx];
            hoodieStore.add(hoodieKey, item);
          }

          // then, the changed items
          for (var changedIdx in delta.changed) {
            var item = delta.changed[changedIdx];
            hoodieStore.update(hoodieKey, item.id, item);
          }

          // Last, lets delete items
          for (var deletedIdx in delta.deleted) {
            var item = delta.deleted[deletedIdx];
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
  });

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
    for (var id in mapO) {
      if (!mapN.hasOwnProperty(id)) {
        delta.deleted.push(mapO[id]);
      } else if (!comparator(mapN[id], mapO[id])) {
        delta.changed.push(mapN[id]);
      }
    }

    for (var id in mapN) {
      if (!mapO.hasOwnProperty(id)) {
        delta.added.push(mapN[id])
      }
    }
    return delta;
  }

});