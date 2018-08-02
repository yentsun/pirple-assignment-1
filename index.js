const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder');
const config = require('./config');


const server = http.createServer(async (req, res) => {
    const {method} = req;
    const {pathname} = url.parse(req.url, true);
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');
    res.sendDate = true;
    if (method === 'POST' && trimmedPath === 'hello') {

        // talk the client into sending JSON payload
        const contentType = req.headers['content-type'];
        if (contentType !== 'application/json') {
            res.writeHead(200);
            res.end('Hello there! No JSON, no personal greeting!');
        }

        // get the payload
        const decoder = new StringDecoder('utf-8');
        let buffer = '';
        req.on('data', (data) => {
            buffer += decoder.write(data);
        });

        // use a promise to further use async keyword and
        // move the rest of body parsing out of `end` event handler
        const bodyReady = new Promise(resolve => {
            req.on('end', () => {
                buffer += decoder.end();
                resolve(buffer);
            });
        });
        const body = await bodyReady;

        // try to parse the body and respond
        try {
            const {name='NamelessOne'} = JSON.parse(body);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({message: `Hello, ${name}!`}));
        } catch (error) {
            res.writeHead(400);
            res.end('SyntaxError: ' + error.message);
        }
    } else {
        res.writeHead(404);
        res.end(http.STATUS_CODES[404]);
    }
});

const {port} = config;
server.listen(port, () => {
    console.log('listening on port:', port);
});
