const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(
    './todos.db',
    (err) => {
        if(err) {
            console.error('Could not connect to database', err);
            process.exit(1);
        }
        console.log("Connected to SQLite database.");
    }
);

db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    )`,
    (err) =>{
        if(err){
            console.error("Could not create tasks table", err);
        }
    }
);

module.exports = db;
