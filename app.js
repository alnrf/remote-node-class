const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const rotaParticipante = require("./routes/participante");
const rotaCep = require("./routes/cep.js");

app.use(bodyParser.urlencoded({ extended: false })); // apenas dados simples
app.use(bodyParser.json()); // somente formato json
app.use("/uploads", express.static("uploads"))

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Header",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST,PATCH, DELETE, GET");
    return res.status(200).send({});
  }
  next();
});

app.use("/participante", rotaParticipante);
app.use("/cep", rotaCep);

app.use((req, res, next) => {
  const erro = new Error("Não encontrado");
  erro.status = 404;
  next(erro);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    erro: {
      mensagem: error.message,
    },
  });
});

module.exports = app;
