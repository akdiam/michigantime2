const express = require('express');
const app = express();
const db = require('./db/db');
app.set('json spaces', 2)

const asyncResponse = (qString) => {
    return new Promise((resolve, reject) => {
        db.all(qString, [], (err, rows) => {
            if (err) {
                res.status(400).json({ 'error': err.message });
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const getAllSections = async (componentArr, subject, catalognumber) => {
    return new Promise((resolve, reject) => {
        let allSections = {};
        componentArr.forEach(async (component, idx) => {
            qString = `select * from classes where subject = '${subject}' and catalognumber = '${catalognumber}' and component = '${component}'`;
            const rows = await asyncResponse(qString);
            allSections[component] = rows;
            if (idx === componentArr.length - 1) {
                resolve(allSections);
            }
        });
    });
}

const genResponse = (qString, res) => {
    db.all(qString, [], (err, rows) => {
        if (err) {
            res.status(400).json({ 'error': err.message });
            throw err;
        } else {
            res.json({
                'message': 'success',
                'data': rows
            });
        }
    });
};

const getDistinct = (qString, target) => {
    return new Promise((resolve, reject) => {
        let distinctArr = [];
        db.each(qString, [], (err, row) => {
            if (err) {
                res.status(400).json({ 'error': err.message });
                throw err;
            } else {
                distinctArr.push(row[target]);
            }
        }, (err, n) => {
            if (err) {
                reject(err);
            } else { 
                resolve(distinctArr);
            }
        });
    });
};

const getDistinctMultiple = (qString, target) => {
    return new Promise((resolve, reject) => {
        let distinctArr = [];
        db.each(qString, [], (err, row) => {
            if (err) {
                res.status(400).json({ 'error': err.message });
                throw err;
            } else {
                let indivClass = {};
                target.forEach(indivTarget => {
                    indivClass[indivTarget] = row[indivTarget];
                });
                distinctArr.push(indivClass);
            }
        }, (err, n) => {
            if (err) {
                reject(err);
            } else { 
                resolve(distinctArr);
            }
        });
    });
};

/**
 * @returns {array} containing all distinct subjects in the course guide
 */
app.get('/subjects/', async (req, res) => {
    const qString = 'select distinct subject from classes';
    let subjectArr = await getDistinct(qString, 'subject');
    subjectArr = subjectArr.sort();
    res.json({
        'message': 'success',
        'data': subjectArr
    });
});

/**
 * @returns {array} containing all classes in the course guide
 */
app.get('/classes/', (req, res) => {
    const qString = 'select * from classes';
    genResponse(qString, res);
});

/**
 * @param {subject} subject
 */
app.get('/classes/:subject/', (req, res) => {
    const subject = req.params.subject.toUpperCase();
    const qString = `select * from classes where subject = '${subject}'`;
    genResponse(qString, res);
});

/**
 * @param {string} subject subject
 * @param {string} catalognumber catalognumber
 * @returns {object} containing all sections in the course with the given subject/cat number
 * as well as the components, subject, and catalognumber itself 
 */
app.get('/classes/:subject/:catalognumber/', async (req, res) => {
    const subject = req.params.subject.toUpperCase();
    const catalognumber = req.params.catalognumber;

    let qString = `select distinct component from classes where subject = '${subject}' and catalognumber = '${catalognumber}'`;
    const componentArr = await getDistinct(qString, 'component');
    const allSections = await getAllSections(componentArr, subject, catalognumber);

    res.json({
        'message': 'success',
        'sections': allSections,
        'components': componentArr,
        'subject': subject,
        'catalognumber': catalognumber
    });
});

app.get('/catalognumbers/:subject/', async (req, res) => {
    const subject = req.params.subject.toUpperCase();
    const qString = `select distinct catalognumber, coursetitle from classes where subject = '${subject}' order by catalognumber asc`;
    let catalogArr = await getDistinctMultiple(qString, ['catalognumber', 'coursetitle']);
    res.json({ 
        'message': 'success',
        'data': catalogArr
    });
});

app.get('/classes/:subject/:catalognumber/section/:section/', (req, res) => {
    const subject = req.params.subject.toUpperCase();
    const catalognumber = req.params.catalognumber;
    const section = req.params.section;
    const qString = 
        `select * from classes where subject = '${subject}' and catalognumber = '${catalognumber}' and section = '${section}'`;
    genResponse(qString, res);
});

app.get('/classes/:subject/:catalognumber/component/', async (req, res) => {
    const subject = req.params.subject.toUpperCase();
    const catalognumber = req.params.catalognumber;
    const qString = `select distinct component from classes where subject = '${subject}' and catalognumber = '${catalognumber}'`;
    const componentArr = await getDistinct(qString, 'component');
    res.json({
        'message': 'success',
        'data': componentArr
    });
});

app.get('/classes/:subject/:catalognumber/component/:component/', (req, res) => {
    const subject = req.params.subject.toUpperCase();
    const catalognumber = req.params.catalognumber;
    const component = req.params.component.toUpperCase();
    const qString = 
        `select * from classes where subject = '${subject}' and catalognumber = '${catalognumber}' and component = '${component}'`;
    genResponse(qString, res);
});

app.listen(1337, () => console.log('server running on port 1337'));