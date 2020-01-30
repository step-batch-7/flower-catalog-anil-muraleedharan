const fs = require('fs');
const { App } = require('./app');
const querystring = require('querystring');
const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATES_FOLDER = `${__dirname}/templates`;
const COMMENTS_FILE_PATH = `${__dirname}/data/comments.json`;
const CONTENT_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'image/jpg'
};
const formats = {
  person: '&#128100;',
  message: '&#128233;',
  newline:
    '<br>&ThickSpace;&ThickSpace;&ThickSpace;&ThickSpace;&ThickSpace;&ThinSpace;'
};

const statusCodes = { badRequest: 400, notFound: 404, redirecting: 303 };

const notFound = function(req, res) {
  res.writeHead(statusCodes.notFound);
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(statusCodes.badRequest);
  res.end();
};

const getPreviousComments = COMMENTS_FILE_PATH =>
  fs.existsSync(COMMENTS_FILE_PATH) ? require(COMMENTS_FILE_PATH) : [];

const updateComments = commentSet => {
  let { name, comment } = querystring.parse(commentSet);
  let previousComments = getPreviousComments(COMMENTS_FILE_PATH);
  const timeStamp = new Date().getTime();
  previousComments.unshift({ name, comment, timeStamp });
  fs.writeFileSync(COMMENTS_FILE_PATH, JSON.stringify(previousComments));
};

const commentSetFormatter = function({ name, comment, timeStamp }) {
  comment = comment.replace(/\r\n/g, `${formats.newline}`);
  name = name.replace(/ /g, ' &nbsp');
  comment = comment.replace(/ /g, '&nbsp;');
  date = new Date(timeStamp).toUTCString();
  return `
  <Strong>${formats.person}${name}</Strong> @ ${date}<br/>
  ${formats.message}
  ${comment}`;
};

const getGuestPage = function(url) {
  let comments = getPreviousComments(COMMENTS_FILE_PATH);
  let guestPageHtml = fs.readFileSync(`${TEMPLATES_FOLDER}/${url}`, 'utf8');
  const formattedComments = comments.map(commentSetFormatter);
  const commentsLog = formattedComments.join('<br/><br/>');
  guestPageHtml = guestPageHtml.replace(`__comments__`, commentsLog);
  return guestPageHtml;
};

const serveGuestPage = function(req, res) {
  let html = getGuestPage(req.url);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  if (req.method === 'GET') {
    return res.end(html);
  }
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    updateComments(req.body);
  }
  html = getGuestPage(req.url);
  res.writeHead(statusCodes.redirecting, { location: 'guestBook.html' });
  res.end(html);
};

const isPathValid = path => {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

isHomePath = path => path === '/';

const serveStaticFile = (req, res, next) => {
  if (isHomePath(req.url)) req.url = '/index.html';
  const path = `${STATIC_FOLDER}${req.url}`;
  if (isPathValid(path)) return next();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(path));
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const app = new App();
app.use(readBody);
app.get('', serveStaticFile);
app.post('/guestBook.html', serveGuestPage);
app.get('/guestBook.html', serveGuestPage);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
