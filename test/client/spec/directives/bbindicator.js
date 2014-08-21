'use strict';

describe('Directive: bbIndicator', function () {

  // load the directive's module
  beforeEach(module('bossBossApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<bb-indicator></bb-indicator>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the bbIndicator directive');
  }));
});
