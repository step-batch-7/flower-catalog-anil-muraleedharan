const fs = require('fs');
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

const getPreviousComments = COMMENTS_FILE_PATH =>
  fs.existsSync(COMMENTS_FILE_PATH) ? require(COMMENTS_FILE_PATH) : [];

const updateComments = ({ name, comment }) => {
  let previousComments = getPreviousComments(COMMENTS_FILE_PATH);
  const timeStamp = new Date().getTime();
  previousComments.push({ name, comment, timeStamp });
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
  const formattedComments = comments.reverse().map(commentSetFormatter);
  const commentsLog = formattedComments.join('<br/><br/>');
  guestPageHtml = guestPageHtml.replace(`__comments__`, commentsLog);
  return guestPageHtml;
};

const serveGuestPage = function(req, res) {
  let guestPageHtml = getGuestPage(req.url);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  if (req.method === 'GET') return res.end(guestPageHtml);
  let data = '';
  req.on('data', text => (data += text));
  req.on('end', () => {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      let { name, comment } = querystring.parse(data);
      let comments = { name, comment };
      updateComments(comments);
    }
    guestPageHtml = getGuestPage(req.url);
    res.setHeader('location', 'guestBook.html');
    res.statusCode = 303;
    res.end(guestPageHtml);
  });
};

const serveStaticFile = (req, res) => {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return res.end('Not Found');
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(path));
};

const serveHomePage = (req, res) => {
  req.url = '/index.html';
  serveStaticFile(req, res);
};

const processRequest = (req, res) => {
  if (req.method === 'GET' && req.url === '/') return serveHomePage(req, res);
  if (req.url === '/guestBook.html') return serveGuestPage(req, res);
  if (req.method === 'GET') return serveStaticFile(req, res);
  return ((req, res) => res.end('Not Found'))(req, res);
};

module.exports = { processRequest };
