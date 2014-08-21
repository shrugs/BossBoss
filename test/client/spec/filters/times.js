'use strict';

describe('Filter: times', function () {

  // load the filter's module
  beforeEach(module('bossBossApp'));

  // initialize a new instance of the filter before each test
  var times;
  beforeEach(inject(function ($filter) {
    times = $filter('times');
  }));

  it('should return the input prefixed with "times filter:"', function () {
    var text = 'angularjs';
    expect(times(text)).toBe('times filter: ' + text);
  });

});
