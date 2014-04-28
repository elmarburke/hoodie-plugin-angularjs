// TODO: No need of a global variable why pollute global scope?
var hoodieModule = angular.module('hoodie', []);

// TODO: Not sure if we should wrap this
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

// TODO: Should be extracted into a AngularService
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
