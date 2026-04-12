const express = require("express");
const pool = require("./config/db");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Olá redes sociais</h1>");
});

app.get("/posts", async (req, res) => {
  try {
    const getData = await pool.query(`
            SELECT
                tb_user.name AS nome,
                tb_post.title AS titulo,
                tb_post.content AS conteudo,
                tb_post.created_by
            FROM tb_post JOIN tb_user
            ON tb_post.user_id = tb_user.id
            ORDER BY tb_post.created_by
        `);

    res.json(getData.rows);
  } catch (err) {
    res.status(500).json({ erro: "FALHA AO FAZER A REQUISIÇÃO" });
  }
});

app.post("/post", async (req, res) => {
  try {
    const { user_id, title, content } = req.body;
    const sendData = await pool.query(
      `
            INSERT INTO tb_post(user_id, title, content)
            VALUES($1, $2, $3) RETURNING *
        `,
      [user_id, title, content],
    );

    res.status(201).json({
      mensage: "POST enviado com sucesso!!!",
      data: sendData.rows[0],
    });
  } catch (err) {
    res.status(500).json({ err: "Não foi possivel criar o post" });
  }
});

app.get("/user", async (req, res) => {
  try {
    const getUserData = await pool.query(`
            SELECT * FROM tb_user
        `);
    res.status(201).json(getUserData.rows);
  } catch (err) {
    res.status(500).json({ err: "Não foi possivel carregar as informações" });
  }
});

app.put("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedValue = await pool.query(
      `
        UPDATE tb_post SET title=$1, content=$2 
        WHERE id=$3 RETURNING *
        `,
      [title, content, id],
    );

    res.json({
        mensagem: "Post atualizado com sucesso",
        data: updatedValue.rows[0]
    });
  } catch (err) {
    res.status(500).json({ err: "Não foi possivel atualizar as informações" });
  }
});

module.exports = app;
