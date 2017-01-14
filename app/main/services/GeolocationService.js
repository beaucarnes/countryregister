'use strict';
angular.module('main')
.factory('Geolocation', function ($ionicPlatform, $q) {

  function getCurrentPosition () {
    var deferred = $q.defer();

    function onCurrentPositionResolved (position) {
      deferred.resolve(position);
      console.log('success %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
    }

    function onCurrentPositionFailedToResolve (error) {
      deferred.reject(error);
      console.log('error !!!!!!!!!!!!!!!!!!!!!!!!!!!' + error)
    }

    $ionicPlatform.ready(function () {
      var options = { maximumAge: 3000, timeout: 10000 };
      navigator.geolocation.getCurrentPosition(
        onCurrentPositionResolved,
        onCurrentPositionFailedToResolve,
        options);
    });

    return deferred.promise;
  }

  return {
    getCurrentPosition: getCurrentPosition
  };
});
