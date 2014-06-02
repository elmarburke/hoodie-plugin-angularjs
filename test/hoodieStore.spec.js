describe('hoodieStore', function () {
  var mockEvent = {},
    mockChangedObject = {},
    hoodie,
    hoodieStore,
    $rootScope,
    $q,
    hoodieApi = (new Hoodie()),
    api = hoodieApi.store;

  beforeEach(function () {
    spyOn(window, 'hoodiePromiseFnWrap')
      .andReturn(function () {
        return {
          then: function () {
          }
        };
      });
    spyOn(window, 'hoodieEventWrap');
  });
  beforeEach(module('hoodie', function($provide){
    $provide.value('hoodie',hoodieApi);
    spyOn(hoodieApi.store,'on');
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
    angular.forEach([api], function (fnName) {
      if (typeof api[fnName] === 'function') {
        expect(hoodieStore[fnName]).toBeDefined();
        expect(typeof hoodieStore[fnName]).toBe('function');
        expect(window.hoodiePromiseFnWrap).toHaveBeenCalled();
        expect(window.hoodiePromiseFnWrap).toHaveBeenCalledWith(hoodieStore, fnName, $q, $rootScope);
      }
      else{
        expect(hoodieStore[fnName]).toBe(hoodieApi.store[fnName]);
      }
    });
  });

  describe('findAll', function(){
    it('should call ')
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

});
