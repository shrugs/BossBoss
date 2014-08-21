'use strict';

describe('Service: Teacher', function () {

  // load the service's module
  beforeEach(module('bossBossApp'));

  // instantiate service
  var Teacher;
  beforeEach(inject(function (_Teacher_) {
    Teacher = _Teacher_;
  }));

  it('should do something', function () {
    expect(!!Teacher).toBe(true);
  });

});
