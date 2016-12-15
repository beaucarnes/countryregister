'use strict';
angular.module('main')
.controller('PlaceDetailCtrl', function ($scope, $rootScope, $stateParams, $ionicLoading,
  $cordovaInAppBrowser, $ionicModal, $translate, $state, $ionicSlideBoxDelegate,
  Geolocation, Place, Review, Share, GoogleAnalytics, Toast, User, AdMobService, Dialog) {

  GoogleAnalytics.trackView('Place Detail Screen');

  var isLoadingViewShown = false;
  var isPlaceViewShown = false;
  var isErrorViewShown = false;
  var isSubmittingReview = false;

  $scope.images = [];
  $scope.reviews = [];
  $scope.review = {
    place: null,
    rating: 3,
    comment: ''
  };
  $scope.maxRating = 5;
  $scope.readOnly = true;
  $scope.params = {
    location: null,

  }

  var trans;
  $translate(['commentRequiredErrorText', 'commentTooShortErrorText',
    'successSubmitReviewText'])
    .then(function (myTranslations) {
      trans = myTranslations;
    });

  var showLoading = function () {

    isLoadingViewShown = true;

    isPlaceViewShown = false;
    isErrorViewShown = false;

    $ionicLoading.show({
      templateUrl: 'main/templates/loading.html',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      scope: $scope,
      showDelay: 0
    });
  };

  var showPlace = function () {

    isPlaceViewShown = true;

    isLoadingViewShown = false;
    isErrorViewShown = false;

    $ionicLoading.hide();
  };

  var showErrorView = function () {

    isErrorViewShown = true;
    isPlaceViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var setPlace = function (place) {
    $scope.place = place;
    $scope.review.place = place;

    if (place.image) {
      $scope.images.push(place.image);
    }

    if (place.imageTwo) {
      $scope.images.push(place.imageTwo);
    }

    if (place.imageThree) {
      $scope.images.push(place.imageThree);
    }

    if (place.imageFour) {
      $scope.images.push(place.imageFour);
    }
  };

  var loadPlace = function () {

    Place.get($stateParams.placeId).then(function (place) {
      setPlace(place);
      showPlace();
    }, function () {
      showErrorView();
    });

        // load location data
    Geolocation.getCurrentPosition().then(function (position) {
      $scope.params.location = position.coords;
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

  var loadReviews = function () {

    Review.all($stateParams.placeId).then(function (reviews) {
      $scope.reviews = reviews;
    });
  };

  var isPlaceLiked = function () {
    Place.isLiked($stateParams.placeId).then(function (isLiked) {
      $scope.isLiked = isLiked;
    });
  };

  var isPlaceVisited = function () {
    Place.isVisited($stateParams.placeId).then(function (isVisited) {
      $scope.isVisited = isVisited;
    });
  };

  var isPlaceHopVisited = function () {
    Place.isHopVisited($stateParams.placeId).then(function (isHopVisited) {
      $scope.isHopVisited = isHopVisited;
    });
  };

  var isPlaceStarred = function () {
    Place.isStarred($stateParams.placeId).then(function (isStarred) {
      $scope.isStarred = isStarred;
    });
  };

  var resetReviewData = function () {
    $scope.review.rating = 3;
    $scope.review.comment = '';
  };

  $ionicModal.fromTemplateUrl('main/templates/review-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.reviewModal = modal;
  });

  $ionicModal.fromTemplateUrl('main/templates/auth-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.authModal = modal;
  });

  $ionicModal.fromTemplateUrl('main/templates/photos-modal.html', {
    scope: $scope,
    animation: 'slide-in-right'
  }).then(function (modal) {
    $scope.photosModal = modal;
  });

  $scope.openPhotosModal = function (index) {
    $ionicSlideBoxDelegate.$getByHandle('modalPhotosSlideBoxHandle').slide(index);
    $scope.photosModal.show();
  }

  $scope.closePhotosModal = function () {
    $scope.photosModal.hide();
  };

  $scope.openReviewModal = function () {

    if (User.getLoggedUser()) {
      $scope.reviewModal.show();
    } else {
      $scope.authModal.show();
    }
  }

  $scope.closeReviewModal = function () {
    $scope.reviewModal.hide();
  };

  $scope.onSubmitReview = function () {
    if ($scope.review.comment === '') {
      Toast.show(trans.commentRequiredErrorText);
    } else if ($scope.review.comment.length < 30) {
      Toast.show(trans.commentTooShortErrorText);
    } else {

      isSubmittingReview = true;

      User.getPublicData().then(function (userData) {
        $scope.review.userData = userData;
        return Review.create($scope.review);
      }).then(function (review) {
        $scope.reviews.unshift(review);
        Toast.show(trans.successSubmitReviewText);
        resetReviewData();
        isSubmittingReview = false;
        $scope.closeReviewModal();

        $scope.isStarred = true;

        if (AdMobService.canShowInterstitial()) {
          AdMobService.showInterstitial();
        }

      }, function (error) {
        console.error(error.message);
        Toast.show(error.message);
        isSubmittingReview = false;
      });
    }
  };

  $scope.onLikePlace = function () {

    if ($scope.isLiking) {
      return;
    }

    if (User.getLoggedUser()) {

      $scope.isLiking = true;
      Place.like($stateParams.placeId).then(function (response) {
        if (response.action === 'like') {
          $scope.isLiked = true;
        } else {
          $scope.isLiked = false;
        }
        $scope.isLiking = false;

        if (AdMobService.canShowInterstitial()) {
          AdMobService.showInterstitial();
        }
      }, function () {
        $scope.isLiking = false;
      })
    } else {
      $scope.authModal.show();
    }
  }

  $scope.onVisitPlace = function () {

    if ($scope.isVisiting) {
      return;
    }

    if (User.getLoggedUser()) {

      $scope.isVisiting = true;
      Place.visit($stateParams.placeId).then(function (response) {
        if (response.action === 'visit') {
          $scope.isVisited = true;
        } else {
          $scope.isVisited = false;
        }
        $scope.isVisiting = false;

        if (AdMobService.canShowInterstitial()) {
          AdMobService.showInterstitial();
        }
      }, function () {
        $scope.isVisiting = false;
      })
    } else {
      $scope.authModal.show();
    }
  }

  $scope.onHopVisitPlace = function () {

    if ($scope.isHopVisiting) {
      return;
    }

    if (User.getLoggedUser()) {

      $scope.isHopVisiting = true;
      Place.hopVisit($stateParams.placeId).then(function (response) {
        if (response.action === 'hopVisit') {
          $scope.isHopVisited = true;
        } else {
          $scope.isHopVisited = false;
        }
        $scope.isHopVisiting = false;

        if (AdMobService.canShowInterstitial()) {
          AdMobService.showInterstitial();
        }
      }, function () {
        $scope.isHopVisiting = false;
      })
    } else {
      $scope.authModal.show();
    }
  }

  $rootScope.$on('onCloseAuthModal', function () {
    $scope.authModal.hide();
  });

  var onUserLogged = $rootScope.$on('onUserLogged', function () {
    $scope.authModal.hide();
  });

  $scope.$on('$destroy', function () {
    $scope.reviewModal.remove();
    $scope.authModal.remove();
    $scope.photosModal.remove();
    onUserLogged();
  });

  $scope.isSubmittingReview = function () {
    return isSubmittingReview;
  };

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  };

  $scope.showPlace = function () {
    return isPlaceViewShown;
  };

  $scope.showErrorView = function () {
    return isErrorViewShown;
  };

  $scope.onReload = function () {
    showLoading();
    loadPlace();


  };

  $scope.onShare = function () {
    Share.sharePlace($scope.place);
  };

  $scope.openUrl = function (url) {
    $cordovaInAppBrowser.open(url, '_system');
    GoogleAnalytics.trackEvent('Open Website Button', 'Click', url);
  };

  $scope.openGoogleMaps = function (lat, lng) {
    var url = 'http://maps.google.com/?daddr=' + lat + ',' + lng + '';
    $cordovaInAppBrowser.open(url, '_system');
    GoogleAnalytics.trackEvent('Get Directions Button', 'Click', url);
  };

  $scope.existReviews = function () {
    return $scope.reviews.length > 0;
  };

  $scope.existImages = function () {
    return $scope.images.length > 0;
  };

  $scope.$on('$ionicView.enter', function (scopes, states) {
    if (states.direction === 'forward') {
      showLoading();
      loadPlace();
      loadReviews();
      isPlaceLiked();
      isPlaceStarred();
      isPlaceVisited();
      isPlaceHopVisited();
    }
  });
});
