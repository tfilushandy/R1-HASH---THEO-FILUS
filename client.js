const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto"); // Module untuk hashing

const socket = io("http://localhost:3000");

// untuk client input chat nya
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = ""; // username yang chat

// Fungsi untuk membuat hash dari pesan
const generateHash = (message) => {
    return crypto.createHash('sha256').update(message).digest('hex');
};

// koneksi dari client 1 atau 2 ke server
socket.on("connect", () => {
    console.log("Connected to the server");

    // tanya username yang chat (karna ada 2 orang)
    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        // untuk mengambil message sebelum di enter ("line") untuk disimpan
        rl.on("line", (message) => {
            if (message.trim()) {

                // Buat hash dari pesan asli
                const hash = generateHash(message);

                // Kirim pesan beserta hash-nya ke server
                socket.emit("message", { username, message, hash });
            }
            rl.prompt();
        });
    });
});

// setelah di simpan chat nya sebelum di enter tadi, dikirim ke lawan bicaranya (client 1 / 2)
socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, hash: originalHash } = data;

    // Verifikasi apakah pesan dimodifikasi
    const receivedHash = generateHash(senderMessage.replace("(modified by server)", ""));
    const isTampered = receivedHash !== originalHash;

    if (senderUsername != username) {
        console.log(`${senderUsername}: ${senderMessage}`);
        if (isTampered) {
            console.log("Warning: This message has been modified by the server!");
        }
        rl.prompt();
    }
});

// untuk disconnect dari server (server closed = client closed)
socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

// untuk disconnect dari client (client disconnect = server tetap nyala)
rl.on("SIGINT", () => {
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});