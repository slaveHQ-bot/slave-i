console.log('Testing better-sqlite3'); const DB = require('better-sqlite3'); console.log('better-sqlite3 ok'); new DB(':memory:'); console.log('DB memory ok');
