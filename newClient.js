const net = require('net');

let client = net.createConnection({ port: 5000 }, () => {
    console.log('Connected');
    client.on('data', data => {
        console.log(data.toString());
    })
    
    process.stdin.on('data', data => {
        data[data.length-1] = "";
        client.write(data);
    })

    client.on('close', () => {
        console.log('Server closed connection');
        process.exit();
    })
})

