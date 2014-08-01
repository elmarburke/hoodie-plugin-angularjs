describe('hoodieObject', function() {
  var hoodieObject, $q, $rootScope, hoodieStore,
  mockResponse = {
    id: 1, data: 'hoodieData'
  };
  beforeEach(module('hoodie'));
  beforeEach(inject(function(_hoodieObject_, _$q_, _$rootScope_, _hoodieStore_) {
    hoodieObject = _hoodieObject_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    hoodieStore = _hoodieStore_;
    spyOn(hoodieStore, 'find').andReturn($q.when(mockResponse));
    spyOn(hoodieStore, 'update').andReturn($q.when(mockResponse));
  }));

  describe('Public API', function() {
    it('should provide a bind function', function() {
      expect(hoodieObject.bind).toBeDefined();
      expect(typeof hoodieObject.bind).toBe('function');
    });
  });

  describe('bind function', function() {
    it('should throw an error if no store is given', function() {
      expect(function() {
        hoodieObject.bind();
      }).toThrow('[hoodie-angular-plugin(HoodieObjects.bind)]: A store must be given');
    });


    it('should call hoodieStore.find', function() {
      hoodieObject.bind('store', 'id');
      expect(hoodieStore.find).toHaveBeenCalled();
      expect(hoodieStore.find).toHaveBeenCalledWith('store', 'id');
    });

    it('should return an object with the item in it', function() {
      var hoodieItem = hoodieObject.bind('store', 'id');
      $rootScope.$apply();

      expect(hoodieItem).toEqual(mockResponse);
    });

    it('should register a watch on the item', function() {
      spyOn($rootScope, '$watch');
      hoodieObject.bind('store', 'id');

      expect($rootScope.$watch).toHaveBeenCalled();
    });

    it('should trigger an hoodieStore.update on update the item', function() {
      var item = hoodieObject.bind('store', 'id');
      $rootScope.$apply();

      item.test = 'hi';
      $rootScope.$apply();

      expect(hoodieStore.update).toHaveBeenCalled();
      expect(hoodieStore.update).toHaveBeenCalledWith('store', 'id', item);
    });

    it('should listen for changes from hoodie', function() {
      spyOn($rootScope, '$on');
      hoodieObject.bind('store', 'id');
      $rootScope.$apply();

      expect($rootScope.$on).toHaveBeenCalled();
      expect($rootScope.$on).toHaveBeenCalledWith('change:id:store', jasmine.any(Function));
    });

    it('should update the angular item after changes from hoodie', function() {
      var item = hoodieObject.bind('store', 'id');
      $rootScope.$apply();
      item.preChange = 'shouldBeRemoved';
      var change = {
        id: 1, data: 'hoodieData', changed: true
      };
      $rootScope.$emit('change:id:store', change);

      $rootScope.$apply();
      expect(item).toEqual(change);
    });

    it('should call hoodieStore.add if no id is given', function() {
      spyOn(hoodieStore, 'add').andReturn($q.when({id: 1}));

      var item = hoodieObject.bind('store');

      expect(hoodieStore.add).toHaveBeenCalled();
      expect(hoodieStore.add).toHaveBeenCalledWith('store', {});

      $rootScope.$apply();

      expect(item.id).toBe(1);
    });
  });
});