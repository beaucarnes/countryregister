'use strict';
angular.module('main')
.controller('HopListCtrl', function ($scope, $ionicLoading, $ionicPlatform,
  $cordovaSplashscreen, Hop, GoogleAnalytics, AdMobService, Config) {

  GoogleAnalytics.trackView('Hop List Screen');

  var isLoadingViewShown = false;
  var isHopsViewShown = false;
  var isErrorView = false;
  var isEmptyViewShown = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isHopsViewShown = false;
    isErrorView = false;

    $ionicLoading.show({
      templateUrl: 'main/templates/loading.html',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      scope: $scope,
      showDelay: 0
    });
  };

  var setHops = function (hops) {
    $scope.hops = hops;
  };

  var showHops = function () {

    isHopsViewShown = true;

    isEmptyViewShown = false;
    isLoadingViewShown = false;
    isErrorView = false;
    $ionicLoading.hide();
  };

  var showErrorView = function () {
    isErrorView = true;

    isEmptyViewShown = false;
    isHopsViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var showEmptyView = function () {
    isEmptyViewShown = true;

    isErrorView = false;
    isHopsViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var loadHops = function () {

    Hop.all().then(function (hops) {
      setHops(hops);
      if ($scope.hops.length === 0) {
        showEmptyView();
      } else {
        showHops();
      }
      $scope.$broadcast('scroll.refreshComplete');
    }, function () {
      showErrorView();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  };

  $scope.showHops = function () {
    return isHopsViewShown;
  };

  $scope.showErrorView = function () {
    return isErrorView;
  };

  $scope.showEmptyView = function () {
    return isEmptyViewShown;
  };

  $scope.onReload = function () {
    $scope.hops = [];
    showLoading();
    loadHops();
  };


  $scope.$on('$ionicView.loaded', function () {
    $ionicPlatform.ready(function () {
      if (navigator && navigator.splashscreen) {
        $cordovaSplashscreen.hide();
      }
      AdMobService.showBanner(Config.ENV.admob.bannerId);
    });
  });

  showLoading();
  loadHops();

})
