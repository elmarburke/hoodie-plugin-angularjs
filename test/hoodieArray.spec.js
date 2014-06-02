describe('hoodieArray', function () {

  var hoodieArray, $q, $rootScope, hoodieStore,
    mockResponse = [
      {id: 1, data: 'hoodieData'}
    ];
  beforeEach(module('hoodie'));
  beforeEach(inject(function (_hoodieArray_, _$q_, _$rootScope_, _hoodieStore_) {
    hoodieArray = _hoodieArray_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    hoodieStore = _hoodieStore_;
    spyOn(hoodieStore, 'findAll').andReturn($q.when(mockResponse));
    spyOn(hoodieStore, 'remove').andReturn($q.when(mockResponse));
    spyOn(hoodieStore, 'update').andReturn($q.when(mockResponse));
    spyOn(hoodieStore, 'add').andReturn($q.when(mockResponse));
  }));

  describe('Public API', function () {

    it('should provide a bind function', function () {
      expect(hoodieArray.bind).toBeDefined();
      expect(typeof hoodieArray.bind).toBe('function');
    });

  });

  describe('bind function', function () {

    it('should call hoodieStore.findAll and bind result to $scope[key]', function () {
      hoodieArray.bind($rootScope, 'store');
      expect(hoodieStore.findAll).toHaveBeenCalled();
      expect(hoodieStore.findAll).toHaveBeenCalledWith('store');

      // Resolve the promise in sync
      $rootScope.$apply();

      expect($rootScope.store).toBe(mockResponse);
    });

    it('should register a watch on $scope[key]', function () {
      spyOn($rootScope, '$watch');
      hoodieArray.bind($rootScope, 'store');

      expect($rootScope.$watch).toHaveBeenCalled();
      expect($rootScope.$watch).toHaveBeenCalledWith('store', jasmine.any(Function), true);
    });


    it('should trigger an hoodieStore.add on store addition', function () {
      hoodieArray.bind($rootScope, 'store');
      $rootScope.$apply();

      var newObj = {data: 'hoodieData'};
      $rootScope.store.push({data: 'hoodieData'});
      $rootScope.$apply();


      expect(hoodieStore.add).toHaveBeenCalled();
      expect(hoodieStore.add).toHaveBeenCalledWith('store', newObj);
    });

    it('should trigger an hoodieStore.update on store modification', function () {
      hoodieArray.bind($rootScope, 'store');
      $rootScope.$apply();

      $rootScope.store[0].data = $rootScope.store[0].data + '!';
      $rootScope.$apply();


      expect(hoodieStore.update).toHaveBeenCalled();
      expect(hoodieStore.update).toHaveBeenCalledWith('store', $rootScope.store[0].id, $rootScope.store[0]);
    });


    it('should trigger an hoodieStore.remove on store removal', function () {
      hoodieArray.bind($rootScope, 'store');
      $rootScope.$apply();

      $rootScope.store = [];
      $rootScope.$apply();


      expect(hoodieStore.remove).toHaveBeenCalled();
      expect(hoodieStore.remove).toHaveBeenCalledWith('store', 1);
    });
  });

});
