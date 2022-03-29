const http = require('http');
const url = require('url');

module.exports = http.createServer((req, res) => {

    var methods = require('./methods.js');
    const reqUrl = url.parse(req.url, true);
    console.log(req.method + ' ' + reqUrl.pathname);

    if (reqUrl.pathname == '/games') {
        if (req.method === 'GET') {
            methods.get(req, res);
        } else if (req.method === 'POST') {
            methods.post(req, res);
        } else if (req.method === 'PUT') {
            methods.put(req, res);
        } else if (req.method === 'DELETE') {
            methods.delete(req, res);
        } else {
            methods.invalidMethod(req, res);
        }
    } else {
        methods.invalidRequest(req, res);
    }
});