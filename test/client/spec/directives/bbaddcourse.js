'use strict';

describe('Directive: bbAddCourse', function () {

  // load the directive's module
  beforeEach(module('bossBossApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<bb-add-course></bb-add-course>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the bbAddCourse directive');
  }));
});
