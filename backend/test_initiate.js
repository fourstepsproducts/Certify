const http = require('http');

const data = JSON.stringify({
    name: 'Test',
    email: 'test@example.com',
    phoneNumber: '1234567891',
    webinarId: '69ae1b2c3d4e5f6a7b8c9d01', // Dummy ObjectId
    amount: 100
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payments/initiate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
