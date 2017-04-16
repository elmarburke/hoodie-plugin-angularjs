angular.module('hoodie')
  .factory('hoodieAccount',
  function ($rootScope, hoodie, $q) {
    var service = {};

    //Wrap hoodie fns to turn hoodie promises into angular
    angular.forEach(hoodie.account, function (propertyValue, propertyName) {
      if (angular.isFunction(propertyValue)) {
        service[propertyName] = function () {
          return $q.when(hoodie.account[propertyName].apply(hoodie.account, arguments));
        };
      }
      else {
        // TODO: Problem by value (copied, ref gets lost)
        service[propertyName] = hoodie.account[propertyName];
      }
    });

    // TODO: is there a 'ENUM' in hoodie for such events?
    // listen for account events
    angular.forEach([
      // user has signed up (this also triggers the authenticated event, see below)
      'signup',
      // user has signed in (this also triggers the authenticated event, see below)
      'signin',
      // user has re-authenticated after their session timed out
      // (this does _not_ trigger the signin event)
      'authenticated',
      // user's session has timed out. This means the user is still signed in locally,
      // but Hoodie cannot sync remotely, so the user must sign in again
      'unauthenticated'
    ], function (eventName) {

      hoodie.account.on(eventName, function (username) {
        $rootScope.$apply(function () {
	  service.username = eventName === 'signout' ? undefined : username;
        });
        $rootScope.$emit('hoodie:' + eventName, arguments);
      });
    });

    service.username = hoodie.account.username;


    return service;
  });
