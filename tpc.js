const net = require('net');
const fs = require('fs');
let users = [];
let numUsers = 0;

function getDate() {
    let date = new Date();
    return ((Number(date.getMonth()) + 1) + '|' + date.getDate() + '|' + date.getFullYear() + '@' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
}

let server = net.createServer(client => {
    numUsers++;
    client.id = users.length;
    client.name = 'Guest' + (numUsers);
    users.push(client);
    console.log(client.name + ' has joined the chat');
    fs.appendFile('./server.log', getDate() + ' ' + client.name + ' has joined the chat\n', () => { });
    client.setEncoding('utf8');
    client.write('[Server]: Welcome to the chat room ' + client.name + '!\n');
    for (let i = 0; i < users.length; i++) {
        users[i].write('[Server]: Welcome ' + client.name + ' to the chat.');
    }
    client.on('data', data => {
        if (data[0] == '/') {
            if (data.split(' ')[0] == '/w') {
                let input = data.split(' ');
                if (input.length < 3) {
                    client.write('[Server]: Invalid arguments');
                } else if (users.length < 2) {
                    client.write('[Server]: No one to whisper to');
                } else if (client.name == input[1]) {
                    client.write("[Server]: You can't whisper to yourself");
                } else {
                    let found = false;
                    for (let i = 0; i < users.length; i++) {
                        if (users[i].name == input[1]) {
                            input.shift();
                            input.shift();
                            users[i].write(`${client.name} whispers '${input.join().replace(/,/g, ' ')}'`);
                            console.log(`${client.name} whispered '${input.join().replace(/,/g, ' ')}' to ${users[i].name}`);
                            fs.appendFile('./server.log', getDate() + ' ' + `${client.name} whispered '${input.join().replace(/,/g, ' ')}' to ${users[i].name}\n`, () => { });
                            found = true;
                        }
                    }
                    if (!found) {
                        client.write('[Server]: User not on server');
                    }
                }
            } else if (data.split(' ')[0] == '/username') {
                let input = data.split(' ');
                input[1] = input[1].replace(/\0/g,'');
                console.log(input);
                if (input.length < 2) {
                    client.write('[Server]: Invalid arguments');
                } else if (input[1] == client.name) {
                    client.write('[Server]: That is already your name');
                } else {
                    let inUse = false;
                    for (let i = 0; i < users.length; i++) {
                        if (users[i] == input[1]) {
                            client.write('[Server]: Name is already in use');
                            inUse = true;
                        }
                    }
                    if (!inUse) {
                        console.log(`${client.name} has changed their name to ${input[1]}`);
                        for (let i = 0; i < users.length; i++) {
                            if (users[i].name != client.name) {
                                users[i].write(`${client.name} has changed their name to ${input[1]}`);
                            }
                        }
                        for (let i = 0; i < users.length; i++) {
                            if(users[i].name == client.name) {
                                client.name = input[1];
                                users[i] = client;
                            }
                        }
                        client.write('[Server]: Name change successful');
                    }
                }
            } else if (data.split(' ')[0] == '/kick') {
                let pass = 'supersecretpw';
                let input = data.split(' ');
                input[2] = input[2].replace(/\0/g,'');
                if(input.length < 3) {
                    client.write('[Server]: Invalid arguments');
                } else if(input[1] == client.name) {
                    client.write("[Server]: You can't kick yourself");
                } else if(input[2] != pass) {
                    client.write('[Server]: Admin password incorrect');
                } else {
                    let found = false;
                    for(let i = 0; i < users.length; i++) {
                        if(users[i].name == input[1]) {
                            users[i].end();
                            found = true;
                        }
                    }
                    if(!found) {
                        client.write('[Server]: User does not exist on server');
                    }
                }
            } else if (data.split(' ')[0].slice(0,-1) == '/clientlist') {
                for(let i = 0; i < users.length; i++) {
                    client.write(users[i].name);
                }
            } else if (data.split(' ')[0] == '/help') {

            } else {
                console.log(data);
                client.write('[Server]: Invalid Command');
            }
        } else {
            console.log(client.name + ': ' + data);
            fs.appendFile('./server.log', getDate() + ' ' + client.name + ': ' + data + '.\n', () => { });
            for (let i = 0; i < users.length; i++) {
                if (users[i].name != client.name) {
                    users[i].write(client.name + ': ' + data);
                }
            }
        }

    })
    client.on('close', () => {
        console.log(client.name + ' has left the chat.');
        fs.appendFile('./server.log', getDate() + ' ' + client.name + ' has left the chat.\n', () => { });
        for (let i = 0; i < users.length; i++) {
            if (client.name == users[i].name) {
                users.splice(i, 1);
            } else {
                users[i].write('[Server]: ' + client.name + ' has left the chat.');
            }
        }
    })
}).listen(5000);

console.log('Listening on port 5000');