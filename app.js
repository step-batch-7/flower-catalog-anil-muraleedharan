const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const formats = {
  person: '&#128100;',
  message: '&#128233;',
  newline:
    '<br>&ThickSpace;&ThickSpace;&ThickSpace;&ThickSpace;&ThickSpace;&ThinSpace;'
};

const STATIC_FOLDER = `${__dirname}/public`;
const commentDatabase = `${__dirname}/data/comments.json`;

const serveStaticFile = (req, path) => {
  if (!path) path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const serveHomePage = req => {
  req.url = '/index.html';
  return serveStaticFile(req);
};

const getPreviousComments = () =>
  fs.existsSync('./data/comments.json')
    ? JSON.parse(fs.readFileSync('./data/comments.json', 'utf8'))
    : [];

const commentFormatter = nameAndComment => `
    <Strong>${formats.person}${nameAndComment.name}</Strong><br/>
    ${formats.message}
    ${nameAndComment.comment.replace(/\n/g, `${formats.newline}`)}`;

const serveGuestBook = req => {
  const res = serveStaticFile(req, `${__dirname}/templates/guestBook.html`);
  let content = res.body.toString();
  let comments = getPreviousComments().reverse();
  const formattedComments = comments.map(commentFormatter);
  const commentsLog = formattedComments.join('<br/><br/>');
  content = content.replace(/__comments__/, commentsLog);
  res.body = content;
  res.setHeader('Content-Length', content.length);
  return res;
};

const handleComment = req => {
  let comments = getPreviousComments();
  let { name, comment } = req.body;
  name = name.replace(/\+/g, ' ');
  comment = comment.replace(/\+/g, ' ');
  comments.push({
    name,
    comment
  });
  fs.writeFileSync(commentDatabase, JSON.stringify(comments));
  const res = serveGuestBook(req);
  res.statusCode = 303;
  res.setHeader('location', './guestBook.html');
  return res;
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET' && req.url === '/guestBook.html')
    return serveGuestBook;
  if (req.method === 'GET') return serveStaticFile;
  if (req.method === 'POST') return handleComment;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
