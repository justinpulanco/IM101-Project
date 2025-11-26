const http = require('http');

const testData = {
    name: 'API Test User',
    email: 'apitest@example.com',
    password: 'password123'
};

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Testing registration API endpoint...');
console.log('Request data:', testData);

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response Body:', data);
        try {
            const jsonResponse = JSON.parse(data);
            console.log('Parsed Response:', jsonResponse);
        } catch (e) {
            console.log('Response is not valid JSON');
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(postData);
req.end();
