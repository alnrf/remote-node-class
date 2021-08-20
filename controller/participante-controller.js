const db = require("../database");

exports.getParticipante = async (req, res, next) => {
    try {
      const rows = await db('participante');
      res.status(200).send({ rows });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }