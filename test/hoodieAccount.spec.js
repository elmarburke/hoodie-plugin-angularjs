describe('hoodieAccount', function () {

  var hoodieAccount, $q, $rootScope;
  var hoodieInstance = (new Hoodie());
  var api = hoodieInstance.account;

  beforeEach(function () {
    spyOn(api, 'on');
  });

  beforeEach(module('hoodie', function ($provide) {
    $provide.value('hoodie', hoodieInstance);
  }));

  beforeEach(inject(function (_hoodieAccount_, _$q_, _$rootScope_) {
    hoodieAccount = _hoodieAccount_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  it('should have hoodieAccount', function () {
    expect(hoodieAccount).toBeDefined();
  });

  it('should have all hoodie.accounts functions', function () {
    angular.forEach([api], function (fnName) {
      if (typeof api[fnName] === 'function') {
        expect(hoodieAccount[fnName]).toBeDefined();
        expect(typeof hoodieAccount[fnName]).toBe('function');
        expect(hoodieAccount[fnName]().then).toBeDefined();
      }
    });
  });

  it('should have all hoodie.accounts functions', function () {
    var events = [
      'signup',
      'signin',
      'signout',
      'authenticated',
      'unauthenticated'
    ];
    expect(api.on).toHaveBeenCalled();
    expect(api.on.calls.length).toBe(events.length);
    angular.forEach(events, function (eventName) {
      expect(api.on).toHaveBeenCalledWith(eventName, jasmine.any(Function));
    });
  });

  it('should set username on signup', function() {
    var username = 'testusername';
    api.trigger('signup', username);
    expect(api.username).toBe(username);
  });

  it('should set username on signin', function() {
    var username = 'testusername';
    api.trigger('signin', username);
    expect(api.username).toBe(username);
  });

  it('should set username on signout', function() {
    var username = 'testusername';
    api.trigger('signin', username);
    expect(api.username).toBe(username);
    api.trigger('signout', username);
    expect(api.username).toBeUndefined();
  });  
});