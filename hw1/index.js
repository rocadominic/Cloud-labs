const http = require('http');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const FormData = require('form-data');

async function logData(request) {
    delete request.config.headers['x-rapidapi-key'];
    data = request.config.method.toUpperCase() + "|" + request.config.url + "|" + request.status + "|" + request.latency + "|" + JSON.stringify(request.config.headers) + "\n";
    await fs.writeFile("logs.txt", data, { flag: 'a+' }, function(error) {
        if (error) { console.log(error); }
    });
}

async function logDataMine(method, url, status, latency, headers) {
    data = method + "|" + url + "|" + status + "|" + latency + "|" + headers + "\n";
    await fs.writeFile("logs.txt", data, { flag: 'a+' }, function(error) {
        if (error) { console.log(error); }
    });
}

function getAPIKey() {
    return fs.readFileSync("config.txt");
}

function errorResponse(response) {
    return response.statusCode == 500;
}

http.createServer(async function(request, response) {

    let currentBatch = [];
    beforeReq = Date.now();
    if (request.url == "/metrics") {
        var lineReader = require('readline').createInterface({
            input: fs.createReadStream('logs.txt')
        });
        linecount = 0;
        //avg latency per api(4 cu tot cu mine)
        //status codes per total cate de fiecare
        //get sau post cate de fiecare
        //gitignore node_module, config.txt, logs.txt, .vscode
        lineReader.on('line', function(line) {
            line = line.trim().split('|');
            linecount += 1;
            console.log(line);
        });
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end("metrics here", 'utf-8');
    } else if (request.url == "/") {
        response.writeHead(200, { 'Content-Type': 'text/html' });

        var ext = "";
        while (!['.png', '.jpg'].includes(ext)) {
            currentBatch = [];
            before = Date.now();
            await axios.get('https://random.dog/woof.json').then(resp => {
                after = Date.now();
                resp.latency = after - before;
                //console.log(resp);
                currentBatch = currentBatch.concat(resp);
                ext = String(path.extname(currentBatch[0].data.url).toLowerCase());
            }).catch(function(err) {
                console.log(err);
                response.writeHead(500, { 'Content-Type': 'text/html' });
            });
        }
        if (errorResponse(response)) return response.end("server error", 'utf-8');

        before = Date.now();
        await axios.get('https://api.chucknorris.io/jokes/random').then(resp => {
            after = Date.now();
            resp.latency = after - before;
            //console.log(resp);
            currentBatch = currentBatch.concat(resp);
        }).catch(function(err) {
            console.log(err);
            response.writeHead(500, { 'Content-Type': 'text/html' });
        });
        if (errorResponse(response)) return response.end("server error", 'utf-8');
        const form = new FormData();
        lg = 0;
        before = Date.now();
        await axios.get(currentBatch[0].data.url, { responseType: 'arraybuffer', }).then(img => {
            after = Date.now();
            img.latency = after - before;
            //console.log(resp);
            currentBatch = currentBatch.concat(img);
            form.append('image', img.data, crypto.createHash('md5').update(String(img.data)).digest('hex') + ext);
            lg = img.data.length;
            //console.log(form);
        }).catch(function(err) {
            console.log(err);
            response.writeHead(500, { 'Content-Type': 'text/html' });
        });
        if (errorResponse(response)) return response.end("server error", 'utf-8');
        const key = getAPIKey();

        before = Date.now();
        await axios.request({
            method: 'POST',
            url: 'https://ronreiter-meme-generator.p.rapidapi.com/images',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Content-Length': String(form.getLengthSync()),
                ...form.getHeaders(),
                'x-rapidapi-host': 'ronreiter-meme-generator.p.rapidapi.com',
                'x-rapidapi-key': key,
                'host': 'ronreiter-meme-generator.p.rapidapi.com'
            },
            data: form
        }).then(resp => {
            after = Date.now();
            resp.latency = after - before;
            //console.log(resp);
            currentBatch = currentBatch.concat(resp);
        }).catch(function(err) {
            console.log(err);
            response.writeHead(500, { 'Content-Type': 'text/html' });
        });
        if (currentBatch.length != 4) {
            response.writeHead(500, { 'Content-Type': 'text/html' });
            return response.end("server error", 'utf-8');
        }
        if (errorResponse(response)) return response.end("server error", 'utf-8');
        before = Date.now();
        await axios.request({
            method: 'GET',
            url: 'https://ronreiter-meme-generator.p.rapidapi.com/meme',
            params: {
                top: '',
                bottom: String(currentBatch[1].data.value),
                meme: String(currentBatch[3].data.name)
            },
            headers: {
                'x-rapidapi-host': 'ronreiter-meme-generator.p.rapidapi.com',
                'x-rapidapi-key': key
            },
            responseType: 'arraybuffer'
        }).then(resp => {
            after = Date.now();
            resp.latency = after - before;
            //console.log(resp);
            currentBatch = currentBatch.concat(resp);
        }).catch(function(err) {
            console.log(err);
            response.writeHead(500, { 'Content-Type': 'text/html' });
        });
        if (errorResponse(response)) return response.end("server error", 'utf-8');
        if (currentBatch.length != 5) {
            response.writeHead(500, { 'Content-Type': 'text/html' });
            return response.end("server error", 'utf-8');
        }
        respBody = "<p>Random dog image: " + currentBatch[0].data.url + "</p>"
        respBody += "<p>Random Chuck Norris joke: " + currentBatch[1].data.value + "</p>"
        respBody += "<p>Generated image: </p>"
        respBody += '<img src="data:image/png;base64, ' + Buffer.from(currentBatch[4].data).toString('base64') + '" />'
        response.end(respBody);
        //console.log(currentBatch);
        for (let i = 0; i < currentBatch.length; i++)
            await logData(currentBatch[i]);
    } else {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end("page not found", 'utf-8');
    }
    latency = Date.now() - beforeReq;
    logDataMine(request.method, request.url, response.statusCode, latency, JSON.stringify(request.headers));

}).listen(5000);
console.log('Server running at http://127.0.0.1:5000/');