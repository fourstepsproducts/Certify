const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/templates/695902009b1286876157d57c',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        // We can't easily test auth here without a token, but a 401 is better than 404
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
