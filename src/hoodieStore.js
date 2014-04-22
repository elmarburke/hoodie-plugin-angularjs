
hoodieModule.service('hoodieStore',
function($rootScope, $q, hoodie) {
  var service = this;

  angular.forEach(angular.store, function(fn, fnName) {
    service[fnName] = hoodiePromiseFnWrap(hoodie.store, fnName, $q, $rootScope);
  });

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

      $rootScope.$emit(event, changedObject);
      $rootScope.$emit('change', event, changedObject);
      $rootScope.$emit(event + ':' + type, changedObject);
      $rootScope.$emit('change' + ':' + type, event, changedObject);
      $rootScope.$emit(event + ':' + type + ':' + id, changedObject);
      $rootScope.$emit('change' + ':' + type + ':' + id, event, changedObject);

      service.findAll(type)
      .then(function (data) {
        service[type] = data;
      });
    });
  });

});
