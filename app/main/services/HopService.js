'use strict';
/*global Parse */
angular.module('main').factory('Hop', function ($q) {

  var Hop = Parse.Object.extend('Hop', {
    // Instance methods
  }, {
    // Class methods
    all: function () {

      var defer = $q.defer();

      var query = new Parse.Query(this);
      var subQueryExpiresAt = new Parse.Query(this);
      var subQueryExpiresAtNotSet = new Parse.Query(this);

      subQueryExpiresAt.greaterThan('expiresAt', new Date());
      subQueryExpiresAtNotSet.doesNotExist('expiresAt');

      query = Parse.Query.or(subQueryExpiresAt, subQueryExpiresAtNotSet);
      query.equalTo('isActive', true);

      query.ascending('order');

      query.find({
        success: function (hops) {
          defer.resolve(hops);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    get: function (id) {
      var defer = $q.defer();

      var query = new Parse.Query(this);

      query.get(id, {
        success: function (hop) {
          defer.resolve(hop);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    isCompleted: function (id) {

      var defer = $q.defer();

      Parse.Cloud.run('isHopCompleted', { hopId: id }, {
        success: function (response) {
          defer.resolve(response);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    completeHop: function (id) {

      var defer = $q.defer();
      Parse.Cloud.run('completeHop', { hopId: id }, {
        success: function (response) {
          defer.resolve(response);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },


  });

  Object.defineProperty(Hop.prototype, 'title', {
    get: function () {
      return this.get('title');
    }
  });

  Object.defineProperty(Hop.prototype, 'description', {
    get: function () {
      return this.get('description');
    }
  });

  Object.defineProperty(Hop.prototype, 'image_url', {
    get: function () {
      return this.get('image').url();
    }
  });

  return Hop;
});
