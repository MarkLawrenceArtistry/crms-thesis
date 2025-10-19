const { Server } = require("socket.io");

let io;

function init(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all origins for simplicity
        }
    });

    io.on('connection', (socket) => {
        console.log('SOCKET.IO: A user connected.');
        socket.on('disconnect', () => {
            console.log('SOCKET.IO: User disconnected.');
        });
    });

    console.log("Socket.IO server initialized.");
    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = {
    init,
    getIO,
};