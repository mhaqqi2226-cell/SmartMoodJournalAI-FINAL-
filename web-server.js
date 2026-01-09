const fs = require('fs');
const logFile = 'debug_log.txt';

function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

log('Starting server...');

try {
    const express = require('express');
    log('Express loaded');
    const app = express();
    const port = 3001;

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.listen(port, () => {
        log(`Example app listening on port ${port}`);
    });
} catch (e) {
    log('Error: ' + e.message);
    log(e.stack);
}
