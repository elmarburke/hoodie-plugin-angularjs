describe('utils', function() {

  describe('angularDigestFn', function() {

    it('should evalAsync then call a callback with arguments', inject(function($rootScope, $timeout) {
      var spy = jasmine.createSpy();
      var fn = angularDigestFn($rootScope, spy);
      fn('a', 'b', 'c');
      expect(spy).not.toHaveBeenCalled();
      //evalAsync creates a timeout if no digest is in progress already
      $timeout.flush();
      expect(spy).toHaveBeenCalledWith('a','b','c');
    }));

  });

  /*
  Now $q.when is used
  describe('hoodiePromiseFnWrap', function() {

    var myObject, successSpy, errorSpy, myWrappedFn;
    beforeEach(inject(function($q, $rootScope) {
      //We'l just create a fake objcet that returns a really fake mock-promise
      //implementation.
      //If we call myObject.promiseFn with success, it will call success promise
      //If we call it with error, it will do the error promise
      myObject = {
        promiseFn: function(arg) {
          expect(this).toBe(myObject);
          return {
            then: function(success, error) {
              if (arg === 'error') { 
                error(arg);
              } else { 
                success(arg);
              }
            }
          };
        }
      };
      spyOn(myObject, 'promiseFn').andCallThrough();
      successSpy = jasmine.createSpy('success');
      errorSpy = jasmine.createSpy('error');
      myWrappedFn = hoodiePromiseFnWrap(myObject, 'promiseFn', $q, $rootScope);
    }));

    it('should call success promise and digest', inject(function($timeout) {
      myWrappedFn('success').then(successSpy, errorSpy);
      expect(successSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();

      $timeout.flush();
      expect(successSpy).toHaveBeenCalledWith('success');
      expect(errorSpy).not.toHaveBeenCalled();
    }));
    it('should call error promise and digest', inject(function($timeout) {
      myWrappedFn('error').then(successSpy, errorSpy);
      expect(successSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      
      $timeout.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith('error');
    }));

  });*/


  describe('hoodieEventWrap', function() {
    var hoodieInstance, fireHoodieEvent;
    beforeEach(function() {
      hoodieEvents = {};
      hoodieInstance = {
        on: function(eventName, callback) {
          hoodieEvents[eventName] = callback;
        }
      };
      fireHoodieEvent = function(eventName, data1) {
        hoodieEvents[eventName](data1);
      };
    });

    it('should wrap a hoodie event, call cb, and digest', inject(function($rootScope, $timeout) {
      var callbackSpy = jasmine.createSpy('callback');
      spyOn($rootScope, '$emit');

      hoodieEventWrap(hoodieInstance, 'bananaEvent', $rootScope, callbackSpy);
      expect(callbackSpy).not.toHaveBeenCalled();
      expect($rootScope.$emit).not.toHaveBeenCalled();

      fireHoodieEvent('bananaEvent', 'monkey data');
      expect(callbackSpy).not.toHaveBeenCalled();
      expect($rootScope.$emit).not.toHaveBeenCalled();

      $timeout.flush();
      expect(callbackSpy).toHaveBeenCalledWith('monkey data');
      expect($rootScope.$emit).toHaveBeenCalledWith('hoodie:bananaEvent', 'monkey data');

      //see if it works multiple times
      callbackSpy.reset();
      $rootScope.$emit.reset();

      fireHoodieEvent('bananaEvent', 'monkey data');
      expect(callbackSpy).not.toHaveBeenCalled();
      expect($rootScope.$emit).not.toHaveBeenCalled();
      $timeout.flush();
      expect(callbackSpy).toHaveBeenCalledWith('monkey data');
      expect($rootScope.$emit).toHaveBeenCalledWith('hoodie:bananaEvent', 'monkey data');
    }));
  });
});
