'use strict';

describe('Directive: bbRemoveCourse', function () {

  // load the directive's module
  beforeEach(module('bossBossApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<bb-remove-course></bb-remove-course>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the bbRemoveCourse directive');
  }));
});
