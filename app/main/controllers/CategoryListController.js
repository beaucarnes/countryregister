'use strict';
angular.module('main')
.controller('CategoryListCtrl', function ($scope, $ionicLoading, $ionicPlatform,
  $cordovaSplashscreen, Category, GoogleAnalytics, AdMobService, Config) {

  GoogleAnalytics.trackView('Category List Screen');

  var isLoadingViewShown = false;
  var isCategoriesViewShown = false;
  var isErrorView = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isCategoriesViewShown = false;
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

  var setCategories = function (categories) {
    $scope.categories = categories;
  };

  var showCategories = function () {

    isCategoriesViewShown = true;

    isLoadingViewShown = false;
    isErrorView = false;
    $ionicLoading.hide();
  };

  var showErrorView = function () {
    isErrorView = true;

    isCategoriesViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var loadCategories = function () {

    Category.all().then(function (categories) {
      setCategories(categories);
      showCategories();
      $scope.$broadcast('scroll.refreshComplete');
    }, function () {
      showErrorView();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  };

  $scope.showCategories = function () {
    return isCategoriesViewShown;
  };

  $scope.showErrorView = function () {
    return isErrorView;
  };

  $scope.onReload = function () {
    $scope.categories = [];
    showLoading();
    loadCategories();
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
  loadCategories();

})
