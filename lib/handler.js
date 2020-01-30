const { readFileSync, writeFileSync, existsSync, statSync } = require('fs');
const { App } = require('./app');
const querystring = require('querystring');
const CONTENT_TYPES = require('./mimeTypes');

const STATIC_FOLDER = `${__dirname}/../public`;
const TEMPLATES_FOLDER = `${__dirname}/../templates`;
const COMMENTS_FILE_PATH = `${__dirname}/../data/comments.json`;
const spaceLength = 5;
const formats = {
  person: '&#128100;',
  message: '&#128233;',
  newline: `<br>${'&ThickSpace;'.repeat(spaceLength)}&ThinSpace;`
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
  existsSync(COMMENTS_FILE_PATH)
    ? JSON.parse(readFileSync(COMMENTS_FILE_PATH, 'utf8'))
    : [];

const updateComments = commentSet => {
  const { name, comment } = querystring.parse(commentSet);
  const previousComments = getPreviousComments(COMMENTS_FILE_PATH);
  const timeStamp = new Date().getTime();
  previousComments.unshift({ name, comment, timeStamp });
  writeFileSync(COMMENTS_FILE_PATH, JSON.stringify(previousComments));
};

const commentSetFormatter = function({ name, comment, timeStamp }) {
  let formattedComment = comment.replace(/\r\n/g, `${formats.newline}`);
  const formattedName = name.replace(/ /g, ' &nbsp');
  formattedComment = formattedComment.replace(/ /g, '&nbsp;');
  const date = new Date(timeStamp).toUTCString();
  return `
  <Strong>${formats.person}${formattedName}</Strong> @ ${date}<br/>
  ${formats.message}
  ${formattedComment}`;
};

const getGuestPage = function(url) {
  const comments = getPreviousComments(COMMENTS_FILE_PATH);
  let guestPageHtml = readFileSync(`${TEMPLATES_FOLDER}/${url}`, 'utf8');
  const formattedComments = comments.map(commentSetFormatter);
  const commentsLog = formattedComments.join('<br/><br/>');
  guestPageHtml = guestPageHtml.replace('__comments__', commentsLog);
  return guestPageHtml;
};

const serveGuestPage = (req, res) => {
  const guestPageHtml = getGuestPage(req.url);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  return res.end(guestPageHtml);
};

const updateCommentAndRedirect = (req, res) => {
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  updateComments(req.body);
  const guestPageHtml = getGuestPage(req.url);
  res.writeHead(statusCodes.redirecting, { location: 'guestBook.html' });
  res.end(guestPageHtml);
};

const isPathValid = path => {
  const stat = existsSync(path) && statSync(path);
  return !stat || !stat.isFile();
};

const isHomePath = path => path === '/';

const serveStaticFile = (req, res, next) => {
  if (isHomePath(req.url)) {
    req.url = '/index.html';
  }
  const path = `${STATIC_FOLDER}${req.url}`;
  if (isPathValid(path)) {
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(readFileSync(path));
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
app.post('/guestBook.html', updateCommentAndRedirect);
app.get('/guestBook.html', serveGuestPage);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
