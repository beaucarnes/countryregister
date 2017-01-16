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
      'interstitialForAndroid': 'ca-app-pub-6514628349426003/9751577774',
      'interstitialForiOS': 'ca-app-pub-6514628349426003/3565443379',
      'bannerId': 'ca-app-pub-6514628349426003/9611976971'
    },
    'gaTrackingId': 'UA-90403576-1',
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
