'use strict';

describe('Service: Params', function () {

  // load the service's module
  beforeEach(module('bossBossApp'));

  // instantiate service
  var Params;
  beforeEach(inject(function (_Params_) {
    Params = _Params_;
  }));

  it('should do something', function () {
    expect(!!Params).toBe(true);
  });

});
