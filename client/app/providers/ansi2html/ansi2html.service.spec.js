'use strict';

describe('Service: ansi2html', function() {
  // load the service's module
  beforeEach(module('webAppApp.ansi2html'));

  // instantiate service
  var ansi2html;
  beforeEach(inject(function(_ansi2html_) {
    ansi2html = _ansi2html_;
  }));

  it('should do something', function() {
    expect(!!ansi2html).to.be.true;
  });
});
