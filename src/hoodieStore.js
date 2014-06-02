hoodieModule.service('hoodieStore', function($rootScope, $q, hoodie) {
  var service = this;

  function wrapMethod(methodName) {
    service[methodName] = function() {
      return $q.when(hoodie.store[methodName].apply(hoodie.store, arguments));
    };
  }

  service.STORE_PROMISE_METHODS = [
    'add', 'update', 'find', 'findAll', 'remove', 'removeAll'
  ];
  service.STORE_PROMISE_METHODS.forEach(wrapMethod);

  service.findAll()
  .then(function (data) {
    data.forEach(function (item) {
      var type = item.type;
      service[type] = service[type] || [];
      service[type].push(item);
    });
  });

  // write custom wrapper here, it's more complicated
  // Events
  hoodie.store.on('change', function (event, changedObject) {
    $rootScope.$evalAsync(function() {
      var type = changedObject.type;
      var id = changedObject.id;

      //Copy the change over to the service
      service.findAll(type).then(function (data) {
        service[type] = data;

        //TODO change somehow?
        $rootScope.$emit(event, changedObject);
        $rootScope.$emit('change', event, changedObject);
        $rootScope.$emit(event + ':' + type, changedObject);
        $rootScope.$emit('change' + ':' + type, event, changedObject);
        $rootScope.$emit(event + ':' + type + ':' + id, changedObject);
        $rootScope.$emit('change' + ':' + type + ':' + id, event, changedObject);
      });
    });
  });
});
