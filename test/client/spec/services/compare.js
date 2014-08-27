'use strict';

describe('Service: Compare', function () {

  // load the service's module
  beforeEach(module('bossBossApp'));

  // instantiate service
  var Compare;
  beforeEach(inject(function (_Compare_) {
    Compare = _Compare_;
  }));

  it('should do something', function () {
    expect(!!Compare).toBe(true);
  });

});
