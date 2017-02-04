const { db } = require('./data_base/index');

db.sync({force: false})
.then(vals => console.log('db has been synced!'))
.catch(err => console.error(err));
