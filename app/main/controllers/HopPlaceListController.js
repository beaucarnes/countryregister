'use strict';
angular.module('main')
.controller('HopPlaceListCtrl', function ($scope, $rootScope, $ionicLoading, $state,
  $localStorage, $stateParams, $translate, $ionicModal, User, Hop, AdMobService, Geolocation, Place,
  GoogleAnalytics, Dialog) {

  GoogleAnalytics.trackView('Place List Screen');

  $scope.maxRating = 5;
  $scope.storage = $localStorage;
  $scope.hopTitle = $stateParams.hopTitle;

  $scope.params = {
    location: null,
    hopId: $stateParams.hopId,
    page: 0,
    search: '',
  }

  var trans;

  $translate(['errorGpsDisabledText',
  'errorLocationMissingText'])
    .then(function (translations) {

      trans = translations;
    });

  $scope.places = [];
  $scope.hopVisit = [];
  $scope.totalVisits = 0;

  var isLoadingViewShown = false;
  var isPlacesViewShown = false;
  var isErrorViewShown = false;
  var isEmptyViewShown = false;

  var isMoreData = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isPlacesViewShown = false;
    isErrorViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.show({
      templateUrl: 'main/templates/loading.html',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      scope: $scope,
      showDelay: 0
    });
  };

  var showPlaces = function () {

    isPlacesViewShown = true;

    isLoadingViewShown = false;
    isErrorViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.hide();
  };

  var showErrorView = function () {

    isErrorViewShown = true;

    isPlacesViewShown = false;
    isLoadingViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.hide();
  };

  var showEmptyView = function () {

    isEmptyViewShown = true;

    isErrorViewShown = false;
    isPlacesViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var ensureMoreData = function (length) {
    isMoreData = false;
    if (length > 0) {
      isMoreData = true;
    }
  };

  var setPlaces = function (places) {
    for (var i = 0;i < places.length;i++) {
      $scope.places.push(places[i]);
    }
  };

  var setCurrentPage = function (page) {
    $scope.params.page = page;
  };

  var isHopCompleted = function () {
    Hop.isCompleted($stateParams.hopId).then(function (isComplete) {
      $scope.isComplete = isComplete;
    });
  };
  /* this takes the places array, the current index, fetches the info regarding that index,
  *  And then does the job, then repeats the process until whole array is finished
  */
  var _bringPlaceAndPush = function (placesArray, currentIndex) {
    var currPlace = placesArray[currentIndex];
    Place.isHopVisited(currPlace.id).then(function (isHopVisited) {
      $scope.hopVisit.push(isHopVisited);
      if (isHopVisited) {
        $scope.totalVisits++;
      }
      if (currentIndex < placesArray.length - 1) {      //repeat the process untill each array item is processed, i.e. each place
        _bringPlaceAndPush(placesArray, ++currentIndex);  //recursion (here's the magic)
      }
    });
  }

  var loadPlaces = function () {

    Place.all($scope.params).then(function (places) {
      ensureMoreData(places.length);
      setCurrentPage($scope.params.page + 1);
      setPlaces(places);

      if ($scope.places.length === 0) {
        showEmptyView();
      } else {
        showPlaces();
        // for (var i = 0; i < places.length; i++) {  //TODO: remove the old code added by Ahsan
        //   Place.isHopVisited(places[i].id).then(function (isHopVisited) {
        //     $scope.hopVisit.push(isHopVisited)
        //     if (isHopVisited) { $scope.totalVisits++;}
        //   });
        // }
        _bringPlaceAndPush(places, 0); //make asynchronous calls, but in a synchronous way
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.refreshComplete');

    }, function () {
      showErrorView();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };


  $scope.onLoadMore = function () {
    loadPlaces();
  };

  $scope.moreDataCanBeLoaded = function () {
    return isMoreData;
  };

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  };

  $scope.showPlaces = function () {
    return isPlacesViewShown;
  };

  $scope.showErrorView = function () {
    return isErrorViewShown;
  };

  $scope.showEmptyView = function () {
    return isEmptyViewShown;
  };

  $scope.onReload = function () {
    showLoading();
    isHopCompleted();

    $scope.params.page = 0;
    $scope.places = [];
    $scope.hopVisit = [];
    $scope.totalVisits = 0;

    Geolocation.getCurrentPosition().then(function (position) {
      $scope.params.location = position.coords;
      loadPlaces();
    }, function (error) {
      $scope.params.location = null;

      var errorMessage;

      if (error.code === 1 || error.code === 3) {
        errorMessage = trans.errorGpsDisabledText;
      } else {
        errorMessage = trans.errorLocationMissingText;
      }
      Dialog.alert(errorMessage);

      showErrorView();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.onCompleteHop = function () {

    if ($scope.isCompleting) {
      return;
    }

    if (User.getLoggedUser()) {

      $scope.isCompleting = true;
      Hop.completeHop($stateParams.hopId).then(function (response) {
        if (response.action === 'complete') {
          $scope.isComplete = true;
        } else {
          $scope.isComplete = false;
        }
        $scope.isCompleting = false;

        if (AdMobService.canShowInterstitial()) {
          AdMobService.showInterstitial();
        }
      }, function () {
        $scope.isCompleting = false;
      })
    } else {
      $scope.authModal.show();
    }
  }

  $scope.navigateToMap = function () {
    $state.go('app.map', {
      hopId: $stateParams.hopId
    });
  };

  $scope.$on('$ionicView.enter', function (scopes, states) {

    if (states.direction === 'forward') {

      showLoading();
      isHopCompleted();

      Geolocation.getCurrentPosition().then(function (position) {
        $scope.params.location = position.coords;
        loadPlaces();
      }, function (error) {
        $scope.params.location = null;

        var errorMessage;

        if (error.code === 1 || error.code === 3) {
          errorMessage = trans.errorGpsDisabledText;
        } else {
          errorMessage = trans.errorLocationMissingText;
        }
        Dialog.alert(errorMessage);

        showErrorView();
      });
    }
  });

})
