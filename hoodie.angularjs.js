Hoodie.extend(function(hoodie) {
  var hoodieModule = angular.module('hoodieModule', []);
  
  hoodieModule.service('hoodieAccount', function($rootScope) {
    var service = this;
    this.signUp = hoodie.account.signUp;
    this.signIn = hoodie.account.signIn;
    this.signOut = hoodie.account.signOut;
    this.changePassword = hoodie.account.changePassword;
    this.changeUsername = hoodie.account.changeUsername;
    this.resetPassword = hoodie.account.resetPassword;
    this.destroy = hoodie.account.destroy;
    var username = $rootScope.username =  this.username = hoodie.account.username;
    
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
  
  hoodieModule.service('hoodieStore', function($rootScope, $q) {
    var service = this;
    
    // add a new object
    this.add = function(type, attributes) {
      var deferred = $q.defer();
      
      hoodie.store.add(type, attributes)
        .done(function (newObject) {
          deferred.resolve(newObject);
        });
      
      return deferred.promise;
    };
    
    // update an existing object
    this.update = function(type, id, update) {
      var deferred = $q.defer();
      
      hoodie.store.update(type, id, update)
        .done(function (updatedObject) {
          deferred.resolve(updatedObject);
        });
      
      return deferred.promise;
    };
    
    // find one object
    this.find = function(type, id) {
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
    this.findAll = function(search) {
      var deferred = $q.defer();
      
      hoodie.store.findAll(search)
        .done(function (objects) {
          deferred.resolve(objects);
        });
      
      return deferred.promise;
    };
    
    // remove an existing object belonging to the current user
    this.remove = function(type, id) {
      var deferred = $q.defer();
      
      hoodie.store.remove(type, id)
        .done(function (removedObject) {
          deferred.resolve(removedObject);
        });
      
      return deferred.promise;
    };
    
    // Remove all objects of one type, also belonging to the current user
    // removeAll, like findAll, also accepts a function as an argument. If that function returns true for an object in the store, it will be removed. Assuming all of our todo tasks have a key "status", and we want to remove all completed tasks:
    this.removeAll = function(type) {
      var deferred = $q.defer();
      
      hoodie.store.removeAll(type)
        .done(function (objects) {
          deferred.resolve(objects);
        });
      
      return deferred.promise;
    };
    
    // Make an Array
    
    service.findAll()
      .then(function(data) {
        data.forEach(function(item) {
          var type = item.type;
          service[type] = service[type] || [];
          service[type].push(item);
        });
      });
    
    // Events
    
    hoodie.store.on('change', function (event, changedObject) {
      var type = changedObject.type;
      var id = changedObject.id;
      
      $rootScope.$emit( event  , changedObject);
      $rootScope.$emit('change', event, changedObject);
      $rootScope.$emit( event   + ':' + type, changedObject);
      $rootScope.$emit('change' + ':' + type, event, changedObject);
      $rootScope.$emit( event   + ':' + type + ':' + id, changedObject);
      $rootScope.$emit('change' + ':' + type + ':' + id, event, changedObject);
      
      $rootScope.$apply(function() {
        service.findAll(type)
          .then(function(data) {
            service[type] = data;
          });
      })
    });
    
  });
});