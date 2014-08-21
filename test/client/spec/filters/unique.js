'use strict';

describe('Filter: unique', function () {

  // load the filter's module
  beforeEach(module('bossBossApp'));

  // initialize a new instance of the filter before each test
  var unique;
  beforeEach(inject(function ($filter) {
    unique = $filter('unique');
  }));

  it('should return the input prefixed with "unique filter:"', function () {
    var text = 'angularjs';
    expect(unique(text)).toBe('unique filter: ' + text);
  });

});
