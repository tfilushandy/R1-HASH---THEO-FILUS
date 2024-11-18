const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer();
const io = socketIo(server);

// koneksi ke server
io.on("connection", (socket) => {
    console.log(`Client ${socket.id} connected`);

    socket.on("disconnect", () => {
        console.log(`Client ${socket.id} disconnected`);
    });

    // menerima message dari client 1 atau 2 lalu di send / broadcast ke client 1 atau 2
    socket.on("message", (data) => {
        let{username, message} = data;
        console.log(`Receiving message from ${username}: ${message}`);

        // hack dari server
        message = message + "(modified by server)";

        io.emit("message", {username, message});
    });
});

// server port
const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});