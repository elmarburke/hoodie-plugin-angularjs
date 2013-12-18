hoodieModule.service('hoodieArray', ['$rootScope', 'hoodieStore',
function($rootScope, hoodieStore) {

  this.bind = function ($scope, key, hoodieKey) {

    hoodieKey = hoodieKey || key;
    $scope[key] = $scope[key] || [];

    hoodieStore.findAll(hoodieKey)
      .then(function (data) {
        $scope[key] = data;
      });

    $scope.$watch(key, function (newValue, oldValue) {
      if (newValue === oldValue || !angular.isArray(newValue) || !angular.isArray(oldValue)) {
        // Init
      } else {

        var delta = getDelta(oldValue, newValue, isEqual);
        var item;
        var key;

        // first, add new items
        for (key in delta.added) {
          item = delta.added[key];
          hoodieStore.add(hoodieKey, item);
        }

        // then, the changed items
        for (key in delta.changed) {
          item = delta.changed[key];
          hoodieStore.update(hoodieKey, item.id, item);
        }

        // Last, lets delete items
        for (key in delta.deleted) {
          item = delta.deleted[key];
          hoodieStore.remove(hoodieKey, item.id);
        }

      }
    }, true);

    hoodie.store.on('change:' + hoodieKey, function (event, changedObject) {
      hoodieStore.findAll(hoodieKey)
      .then(function (data) {
        $scope[key] = data;
      });
    });


  };
}]);

function arrayObjectIndexOf(myArray, searchTerm, property) {
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}

/**
 * Creates a map out of an array be choosing what property to key by
 * @param {object[]} array Array that will be converted into a map
 * @param {string} prop Name of property to key by
 * @return {object} The mapped array. Example:
 *     mapFromArray([{a:1,b:2}, {a:3,b:4}], 'a')
 *     returns {1: {a:1,b:2}, 3: {a:3,b:4}}
 */
function mapFromArray(array, prop) {
  var map = {};
  for (var i = 0; i < array.length; i++) {
    map[ array[i][prop] ] = array[i];
  }
  return map;
}

function isEqual(a, b) {
  return a.title === b.title && a.type === b.type;
}

/**
 * @param {object[]} o old array of objects
 * @param {object[]} n new array of objects
 * @param {object} An object with changes
 */
function getDelta(o, n, comparator) {
  var delta = {
    added: [],
    deleted: [],
    changed: []
  };
  var mapO = mapFromArray(o, 'id');
  var mapN = mapFromArray(n, 'id');
  var id;
  for (id in mapO) {
    if (!mapN.hasOwnProperty(id)) {
      delta.deleted.push(mapO[id]);
    } else if (!comparator(mapN[id], mapO[id])) {
      delta.changed.push(mapN[id]);
    }
  }

  for (id in mapN) {
    if (!mapO.hasOwnProperty(id)) {
      delta.added.push(mapN[id]);
    }
  }
  return delta;
}
