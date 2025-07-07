const db = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to the To-Do Backend');
});

app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/tasks', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Task text is required' });
    }

    db.run('INSERT INTO tasks(text) VALUES(?)', [text], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const newTask = { id: this.lastID, text, done: 0 };
        res.status(201).json(newTask);
    });
});

app.put('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);

    const { text, done } = req.body;

    if (text === undefined && done === undefined) {
        return res.status(400).json({ error: 'Must provide "text" or "done" to update.' });
    };

    db.run(
        `UPDATE tasks
        SET
            text = COALESCE(?, text), -- if first ? is NULL/undefined, keep old text
            done = COALESCE(?, done) -- same for done
        WHERE id = ?`,
        [text, done, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            //This.changes is the number of rows in the table
            if (this.changes === 0) {
                return res.status(404).json({ error: "No task with that id" });
            }

            db.get(
                `SELECT * FROM tasks WHERE id = ?`,
                [id],
                (err2, row) => {
                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }
                    res.json(row);
                }
            )
        }
    )
})

app.delete('/tasks/:id', (req, res) => {
    const id  = Number(req.params.id);

    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if(err) {
            return res.status(500).json({ error: err.message});
        }

        if(this.changes === 0){
            return res.status(404).json({error : 'No task with that id'});
        }

        return res.status(204).end()
    })
});

app.listen(3000, () => {
    console.log('server listening on http://localhost:3000');
})