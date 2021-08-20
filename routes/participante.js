const express = require("express");
const router = express.Router();
const db = require("../database");
const multer = require("multer");
const bcrypt = require("bcrypt-nodejs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-").split(".")[0] +
        "_" +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
});

const participanteController = require("../controller/participante-controller");

router.post("/cadastro", upload.single("imagem"), async (req, res, next) => {
  console.log(req.file);
  var hash = bcrypt.hashSync(req.body.senha);
  try {
    const rows = await db.raw(
      `INSERT
        INTO participante 
      (nome,
        email, 
        cpf, 
        senha,
        funcionario, 
        cliente, 
        fornecedor, 
        estado, 
        imagem) 
        values 
        (?,?,?,?,?,?,?,?,?)`,
      [
        req.body.nome,
        req.body.email,
        req.body.cpf,
        hash,
        req.body.funcionario,
        req.body.cliente,
        req.body.fornecedor,
        req.body.estado,
        req.file.path,
      ]
    );
    res.status(201).send({
      mensagem: "Cliente criado com sucesso",
      log: {
        nome: req.body.nome,
        email: req.body.email,
        senha: hash,
        imagem: req.file.path,
      },
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const query = `SELECT * FROM participante WHERE email = ?`;
    var results = await db.raw(query, [req.body.email]);

    if (results.length < 1) {
      return res.status(401).send({ message: "Falha na autenticação" });
    }

    if (await bcrypt.compare(req.body.password, results[0].password)) {
      const token = jwt.sign(
        {
          userId: results[0].userId,
          email: results[0].email,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).send({
        message: "Autenticado com sucesso",
        token: token,
      });
    }
    return res.status(401).send({ message: "Falha na autenticação" });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});

router.get("/lista", participanteController.getParticipante);

router.get("/id/:id_participante", async (req, res, next) => {
  const id = req.params.id_participante;
  try {
    const sqlQuery = "SELECT * from participante where id=?";
    const rows = await db.raw(sqlQuery, id);
    res.status(200).send({ rows });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/nome/:nome", async (req, res, next) => {
  const nome = req.params.nome;
  try {
    // const sqlQuery = "SELECT * from participante where nome like ?";
    // const rows = await db.raw(sqlQuery, nome);
    const rows = await db("participante").where("nome", nome);
    res.status(200).send({ rows });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.patch("/atualiza", async (req, res, next) => {
  try {
    const sqlQuery = "UPDATE participante set nome=?, estado=? where id=?";
    const rows = await db.raw(sqlQuery, [
      req.body.nome,
      req.body.estado,
      req.body.id,
    ]);
    res.status(201).send({
      mensagem: "Dados atualizados com sucesso",
      log: rows,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.delete("/deletar", async (req, res, next) => {
  try {
    // const sqlQuery = "Delete from participante where id=?";
    const rows = await db("participante").where("nome", req.body.nome).del();
    res.status(201).send({
      mensagem: "Dados deletados com sucesso",
      log: rows,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
