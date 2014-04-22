
hoodieModule.service('hoodieAccount',
function($rootScope, hoodie, $q) {
  var service = this;

  //Wrap hoodie fns to turn hoodie promises into angular
  angular.forEach(hoodie.account, function(propertyValue, propertyName) {
    if(angular.isFunction(propertyValue)){
      service[propertyName] = hoodiePromiseFnWrap(hoodie.account, propertyName, $q, $rootScope);
    }
    else{
      // TODO: Problem by value (copied, ref gets lost)
      service[propertyName] = hoodie.account[propertyName];
    }
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
});
