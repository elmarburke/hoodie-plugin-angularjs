describe('hoodieProvider', function() {
  beforeEach(module('hoodie'));

  it('should error if no url set', function() {
    window.Hoodie = function(){};
    expect(function() {
      inject(function(hoodie) {
      });
    }).toThrow(HOODIE_URL_ERROR);
  });

  it('should return hoodie if url set',function() {
    module('hoodie', function(hoodieProvider) {
      hoodieProvider.url('myhood.com');
    });
    window.Hoodie = jasmine.createSpy('Hoodie');
    inject(function(hoodie) {
      expect(Hoodie).toHaveBeenCalledWith('myhood.com');
      expect(hoodie instanceof Hoodie).toBe(true);
    });
  });
});
