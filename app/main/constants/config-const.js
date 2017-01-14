'use strict';
angular.module('main')
.constant('Config', {

  // gulp environment: injects environment vars
  // https://github.com/mwaylabs/generator-m-ionic#gulp-environment
  ENV: {
    /*inject-env*/
    'parse': {
      'appId': 'aSTUzCu7ybqk0gCkbNb7',
      'serverUrl': 'https://countryregister.herokuapp.com/parse'
    },
    'push': {
      'appId': '58997-1C284',
      'googleProjectNumber': '234180679489'
    },
    'admob': {
      'interstitialForAndroid': 'ca-app-pub-3330283737640538/8821079801',
      'interstitialForiOS': 'ca-app-pub-3330283737640538/2774546202',
      'bannerId': 'ca-app-pub-3330283737640538/4251279408'
    },
    'gaTrackingId': 'UA-83943661-1',
    'theme': 'positive',
    'unit': 'mi',
    'mapType': 'normal',
    'statusBarColor': '#1b68ea'
    /*endinject*/
  },

  // gulp build-vars: injects build vars
  // https://github.com/mwaylabs/generator-m-ionic#gulp-build-vars
  BUILD: {
    /*inject-build*/
    /*endinject*/
  }

});
