module.exports = function(app) {
  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

  app.get('/home', (req, res) => {
    res.render('index.ejs');
  });
};
