import express from 'express';

const app = express();
const port = 3030;

app.get('/', function (req, res) {
  res.send('Hello World from AdviceBot!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));