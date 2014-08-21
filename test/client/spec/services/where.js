'use strict';

describe('Service: where', function () {

  // load the service's module
  beforeEach(module('bossBossApp'));

  // instantiate service
  var where;
  beforeEach(inject(function (_where_) {
    where = _where_;
  }));

  it('should do something', function () {
    expect(!!where).toBe(true);
  });

});
