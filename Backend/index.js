const { db } = require('./data_base/index');
const app = require('./app');


db.sync({force: false})
.then(vals => {
  app.listen(3000, () => {
    console.log('Server is listening on port 3000!');
  });
});
