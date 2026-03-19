const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const dgram = require('dgram');

const udpClient = dgram.createSocket('udp4');

// --- CONFIGURAZIONE ---
const ROBOT_IP = '192.168.1.150'; // L'IP statico del tuo ESP32
const ROBOT_PORT = 4210;
const WEB_PORT = 3000;

// Serve i file statici dalla cartella "public"
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('--- Nuovo telecomando collegato ID:', socket.id);

    socket.on('move', (cmd) => {
        // Log per debug (puoi commentarlo se sono troppi)
        console.log(`Ricevuto comando: ${cmd} - Invio UDP a ${ROBOT_IP}`);

        // Prepariamo il buffer di 5 byte (1 cmd + 4 timestamp)
        const buffer = Buffer.alloc(5);
        buffer.writeUInt8(cmd, 0); 
        buffer.writeInt32LE(Math.floor(Date.now() / 1000), 1);

        // Invio fisico del pacchetto UDP all'ESP32
        udpClient.send(buffer, ROBOT_PORT, ROBOT_IP, (err) => {
            if (err) console.error("Errore invio UDP:", err);
        });
    });

    socket.on('disconnect', () => {
        console.log('--- Telecomando scollegato');
    });
});

// Avvio del server
http.listen(WEB_PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log('🚀 SERVER ROBO-JOEY AVVIATO!');
    console.log(`Porta Web: http://localhost:${WEB_PORT}`);
    console.log(`Target Robot: ${ROBOT_IP}:${ROBOT_PORT}`);
    console.log('=========================================');
});