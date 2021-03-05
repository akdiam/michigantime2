const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const helper = require('./dbHelper');
const schema = require('./schema');

const DB_PATH = ':memory:'

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.log('cannot open db');
        throw err;
    } 

    db.exec(schema, (err) => {
        if (err) {
            console.log('error executing schema');
            throw err;
        }
        fs.createReadStream('db/FA2021.csv')
            .pipe(csv())
            .on('data', (row) => {
                const queryString = helper.createString();
                const queryVals = helper.createRow(row);
                console.log(queryVals);
                if (queryVals) {
                    db.run(queryString, queryVals, (err) => {
                        if (err) {
                            console.log(err.message);
                            throw err;
                        } else {
                            console.log('row inserted');
                        }
                    });
                };
            })
            .on('end', () => {
                console.log('read success');
            });
    });
});

module.exports = db;