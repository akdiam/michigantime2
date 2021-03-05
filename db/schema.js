const schema = `CREATE TABLE classes (
    classnumber INTEGER NOT NULL,
    subject VARCHAR(25),
    catalognumber INTEGER,
    section INTEGER,
    coursetitle VARCHAR(25),
    component VARCHAR(5),
    days VARCHAR(5),
    starthour VARCHAR(10),
    startmin VARCHAR(10),
    endhour VARCHAR(10),
    endmin VARCHAR(10),
    location VARCHAR(25),
    instructor VARCHAR(25),
    units INTEGER
);`

module.exports = schema;