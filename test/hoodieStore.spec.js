describe('hoodieStore', function () {
  var mockEvent = {},
    mockChangedObject = {},
    hoodie,
    hoodieStore,
    $rootScope,
    $q,
    hoodieApi = (new Hoodie()),
    api = hoodieApi.store;

  beforeEach(module('hoodie', function ($provide) {
    $provide.value('hoodie', hoodieApi);
    spyOn(hoodieApi.store, 'on');
    spyOn(hoodieApi.store, 'findAll').andReturn([
      { type: 'foo', value: '33' },
      { type: 'bar', value: '34' },
      { type: 'foo', value: '35' }
    ]);
  }));
  beforeEach(inject(function (_$rootScope_, _hoodieStore_, _hoodie_, _$q_) {
    $rootScope = _$rootScope_;
    hoodie = _hoodie_;
    hoodieStore = _hoodieStore_;
    $q = _$q_;
  }));

  it('should have hoodieStore', function () {
    expect(hoodieStore).toBeDefined();
  });

  it('should have all hoodie.store functions', function () {
    angular.forEach(api, function (fnName) {
      if (typeof fnName === 'function' && fnName.name.length > 0) {
        expect(hoodieStore[fnName.name]).toBeDefined();
        expect(typeof hoodieStore[fnName.name]).toBe('function');
      }
      else {
        expect(hoodieStore[fnName]).toBe(hoodieApi.store[fnName]);
      }
    });
  });

  describe('on change function', function () {
    it('should register a on change function', function () {
      expect(hoodieApi.store.on).toHaveBeenCalled();
      expect(hoodieApi.store.on).toHaveBeenCalledWith('change', jasmine.any(Function));
    });


    it('should emit events via $evalAsync', function () {
      spyOn($rootScope, '$evalAsync');
      var changeListener = hoodieApi.store.on.calls[0].args[1];
      expect($rootScope.$evalAsync).not.toHaveBeenCalled();
      changeListener();
      expect($rootScope.$evalAsync).toHaveBeenCalled();
    });

    describe('events', function () {
      var evalAsyncFn;
      beforeEach(function () {
        spyOn($rootScope, '$evalAsync');
        spyOn($rootScope, '$emit');
        var changeListener = hoodieApi.store.on.calls[0].args[1];
        changeListener(mockEvent, mockChangedObject);
        evalAsyncFn = $rootScope.$evalAsync.calls[0].args[0];
      });
      describe('emit event', function () {
        it('should emit a basic event', function () {
          evalAsyncFn();
          expect($rootScope.$emit).toHaveBeenCalled();
          expect($rootScope.$emit).toHaveBeenCalledWith(mockEvent, mockChangedObject);
        });

        it('should emit a basic event with type', function () {
          mockChangedObject.type = 'A';
          mockChangedObject.id = '1';
          evalAsyncFn();
          expect($rootScope.$emit).toHaveBeenCalled();
          expect($rootScope.$emit).toHaveBeenCalledWith(mockEvent + ':' + mockChangedObject.type, mockChangedObject);
        });

        it('should emit a basic event with type and id', function () {
          mockChangedObject.type = 'A';
          mockChangedObject.id = '1';
          evalAsyncFn();
          expect($rootScope.$emit).toHaveBeenCalled();
          expect($rootScope.$emit).toHaveBeenCalledWith(mockEvent + ':' + mockChangedObject.type + ':' + mockChangedObject.id, mockChangedObject);
        });
      });


      describe('emit change', function () {
        it('should emit a change event', function () {
          evalAsyncFn();
          expect($rootScope.$emit).toHaveBeenCalled();
          expect($rootScope.$emit).toHaveBeenCalledWith('change', mockEvent, mockChangedObject);
        });

        it('should emit a change event with type', function () {
          mockChangedObject.type = 'A';
          mockChangedObject.id = '1';
          evalAsyncFn();
          expect($rootScope.$emit).toHaveBeenCalled();
          expect($rootScope.$emit).toHaveBeenCalledWith('change' + ':' + mockChangedObject.type, mockEvent, mockChangedObject);
        });

        it('should emit a change event with type and id', function () {
          mockChangedObject.type = 'A';
          mockChangedObject.id = '1';
          evalAsyncFn();
          expect($rootScope.$emit).toHaveBeenCalled();
          expect($rootScope.$emit).toHaveBeenCalledWith('change' + ':' + mockChangedObject.type + ':' + mockChangedObject.id, mockEvent, mockChangedObject);
        });
      });
    });


  });

  describe('initial findAll', function () {

    beforeEach(inject(function (hoodie, $q) {
      //Return some random mock data from findAll to test against

    }));

    it('should set initial data from results', inject(function (hoodieStore, $rootScope) {
      //hoodieStore is now initialized because we just injected it
      //$apply so .then() fires
      $rootScope.$apply();
      expect(hoodieStore.foo).toEqual([
        {type: 'foo', value: '33'},
        {type: 'foo', value: '35'}
      ]);
      expect(hoodieStore.bar).toEqual([
        {type: 'bar', value: '34'}
      ]);
    }));

  });

  describe('events', function () {

    it('should listen for change on start and set service data on change', inject(function (hoodieStore, hoodie, $rootScope, $q) {
      //hoodieStore is now initialized because we just injected it
      expect(hoodie.store.on)
        .toHaveBeenCalledWith('change', jasmine.any(Function));

      var changeFn = hoodie.store.on.mostRecentCall.args[1];
      var newFindAllData = { some: 'data' };
      spyOn(hoodieStore, 'findAll').andReturn($q.when(newFindAllData));
      spyOn($rootScope, '$emit');

      var data = { type: 'add', id: '123' };
      changeFn('event', data);
      $rootScope.$apply(); //make evalAsync happen

      //Should fetch changed data type and set it to service
      expect(hoodieStore.findAll).toHaveBeenCalledWith(data.type);
      $rootScope.$apply();
      expect(hoodieStore[data.type]).toBe(newFindAllData);

      expect($rootScope.$emit).toHaveBeenCalledWith('event', data);
      //Not going to expect every rootScope.$emit, too fragile and
      //one PR mentioned changing them.
    }));
  });


});
