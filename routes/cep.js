const express = require("express");
const router = express.Router();
const db = require("../database");


router.get("/id/:id_cep", async (req, res, next) => {
    const id = req.params.id_cep;
    try {
      const rows = await db.select('DS_LOGRADOURO_NOME as logradouro', 'NO_LOGRADOURO_CEP as cep','bairros.ds_bairro_nome as bairro', 'cidades.ds_cidade_nome as cidade', 'uf.ds_uf_nome as estado' ).from('rua').join('bairros', 'bairros.cd_bairro', 'rua.cd_bairro')
      .join('cidades', 'cidades.cd_cidade', 'bairros.cd_cidade').join('uf', 'uf.cd_uf', 'cidades.cd_uf')
      .where('rua.NO_LOGRADOURO_CEP', id);
      res.status(200).send(rows);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  module.exports = router;