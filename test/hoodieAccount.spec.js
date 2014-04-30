describe('hoodieAccount', function() {

  var hoodieAccount;

  beforeEach(module('hoodie'));
  beforeEach(inject(function(_hoodieAccount_) {
    hoodieAccount = _hoodieAccount_;
  }));

  it('should have hoodieAccount', function() {
    expect(hoodieAccount).toBeDefined();
  });

  it('should have hoodie.accounts functions', function() {
    angular.forEach([
      'signUp', 'signIn', 'signOut', 'changePassword', 'changeUsername', 'resetPassword', 'destroy'
    ], function(fnName) {
      expect(hoodieAccount[fnName]).toBeDefined();
    });
  });

  console.warn('TODO: Testing events are missing');
});
