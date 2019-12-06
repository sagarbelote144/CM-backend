const express = require('express'),
app = express(),
server = require('http').createServer(app);
io = require('socket.io')(server);
let timer = null,
sockets = new Set();
var stockdata = require('./data');

app.use(express.static(__dirname + '/dist/client'));

io.on('connection', socket => {
    console.log(`Socket ${socket.id} added`);
    localdata = stockdata.data;
    sockets.add(socket);
    if (!timer) {
        launchTimer();
    }
    socket.on('clientdata', data => {
        console.log(data);
    });
    socket.on('disconnect', () => {
        console.log(`Deleting socket: ${socket.id}`);
        sockets.delete(socket);
        console.log(`Pending sockets: ${sockets.size}`);
    });
});

let launchTimer = () => {
    timer = setInterval(() => {
        if (!sockets.size) {
            clearInterval(timer);
            timer = null;
            console.log(`Timer stopped`);
        }
        stockUpdate();
        for (const soc of sockets) {
            soc.emit('data', { data: localdata });
        }
    }, 1000);
}

let stockUpdate = () => {
    localdata.forEach(
        (data) => {
            data.Price = getRandomData(10, 5000);
            data.Volume = getRandomData(100000000, 700000000);
        });
}

let getRandomData = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

server.listen(8080)