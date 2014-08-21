'use strict';

describe('Service: school', function () {

  // load the service's module
  beforeEach(module('bossBossApp'));

  // instantiate service
  var school;
  beforeEach(inject(function (_school_) {
    school = _school_;
  }));

  it('should do something', function () {
    expect(!!school).toBe(true);
  });

});
