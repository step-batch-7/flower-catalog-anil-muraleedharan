const { app } = require('../lib/handler');
const request = require('supertest');

const statusCodes = {
  ok: 200,
  notFound: 404,
  badRequest: 400,
  redirection: 303
};

describe('GET / - home folder', function() {
  it('should return the home page with code 200', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/html')
      .expect(statusCodes.ok, done);
  });
});

describe('GET /Abeliophyllum.html', function() {
  it('should return the Abeliophyllum page with code 200', function(done) {
    request(app.serve.bind(app))
      .get('/Abeliophyllum.html')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/html')
      .expect(statusCodes.ok, done);
  });
});

describe('GET /Agerantum.html', function() {
  it('should return the Agerantum page with code 200', function(done) {
    request(app.serve.bind(app))
      .get('/Agerantum.html')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/html')
      .expect(statusCodes.ok, done);
  });
});

describe('GET /guestBook.html - comment page', function() {
  it('should return the Agerantum page with code 200', function(done) {
    request(app.serve.bind(app))
      .get('/guestBook.html')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/html')
      .expect(statusCodes.ok, done);
  });
});

describe('GET /bad.html - bad path', function() {
  it('should return not found with code 404', function(done) {
    request(app.serve.bind(app))
      .get('/bad.html')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/plain')
      .expect(statusCodes.notFound, done);
  });
});

describe('PUT /bad.html - bad request', function() {
  it('should return not found with code 404', function(done) {
    request(app.serve.bind(app))
      .put('/bad.html')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/plain')
      .expect(statusCodes.badRequest, done);
  });
});
