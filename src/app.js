require("dotenv").config();
const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const pool = require("./config/db");
const bcrypt = require("bcrypt");
const cors = require("cors");

const auth = require("./auth/auth");
const validPost = require("./valid/post");
const validUser = require("./valid/user");
app.use(express.json());
app.use(cors());

const formattedDataLocal = (data) => {
  const date = new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  return date;
};

const resFormatted = (dataRows) => {
  return dataRows.map((post) => ({
    ...post,
    created_by: formattedDataLocal(post.created_by),
  }));
};

app.get("/", (req, res) => {
  res.send("<h1>Olá redes sociaigs</h1>");
});
app.get("/user", async (req, res) => {
  try {
    const getUserData = await pool.query(`
            SELECT name, email, created_by FROM tb_user
        `);
    res.status(200).json(resFormatted(getUserData.rows));
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Não foi possivel carregar as informações" });
  }
});
app.get("/posts", async (req, res) => {
  try {
    const getData = await pool.query(`
      SELECT
        tb_post.id,
        tb_user.name AS nome,
        tb_post.title AS titulo,
        tb_post.content AS conteudo,
        tb_post.created_by
      FROM tb_post INNER JOIN tb_user
      ON tb_post.user_id = tb_user.id
      ORDER BY tb_post.created_by
    `);
    console.log(getData.rows);
    res.json(resFormatted(getData.rows));
  } catch (err) {
    console.log(err);
    res.status(500).json({ erro: "FALHA AO FAZER A REQUISIÇÃO" });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await pool.query(`SELECT * FROM tb_user WHERE id=$1`, [id]);

    res.json({
      mensagem: "Post atualizado com sucesso",
      data: post.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Não foi possivel atualizar as informações" });
  }
});

app.post("/user", validUser, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const sendData = await pool.query(
      `
            INSERT INTO tb_user(name, email, password)
            VALUES($1, $2, $3) RETURNING *
        `,
      [name, email, passwordHash],
    );

    res.status(201).json({
      mensage: "POST enviado com sucesso!!!",
      data: resFormatted(sendData.rows),
    });
  } catch (err) {
    res.status(500).json({ err: "Não foi possivel criar o post" });
  }
});
app.post("/post", auth, validPost, async (req, res) => {
  try {
    const { title, content } = req.body;
    const sendData = await pool.query(
      `
            INSERT INTO tb_post(user_id, title, content)
            VALUES($1, $2, $3) RETURNING *
        `,
      [req.user.id, title, content],
    );
    res.status(201).json({
      mensage: "POST enviado com sucesso!!!",
      data: resFormatted(sendData.rows),
    });
  } catch (err) {
    res.status(500).json({ err: "Não foi possivel criar o post" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query(
      `
        SELECT * FROM tb_user WHERE email=$1
    `,
      [email],
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "usuario não encontrado" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ message: "Senha Invalida" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
  }
});
app.put("/post/:id", auth, validPost, async (req, res) => {
  try {
    const { id } = req.params;
    const idPost = req.user.id;
    const { title, content } = req.body;

    const post = await pool.query(`SELECT * FROM tb_post WHERE id=$1`, [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ mgs: "Post não encontrado" });
    }

    if (post.user_id === req.user.id) {
      return res.status(403).json({ msg: "Sem permissão" });
    }

    const updatedValue = await pool.query(
      `
        UPDATE tb_post SET title=$1, content=$2 
        WHERE id=$3 RETURNING *
        `,
      [title, content, id],
    );

    console.log(updatedValue.rows);

    res.json({
      mensagem: "Post atualizado com sucesso",
      data: resFormatted(updatedValue.rows),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Não foi possivel atualizar as informações" });
  }
});
app.delete("/posts/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await pool.query(`SELECT * FROM tb_post WHERE id=$1`, [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ msg: "Post não encontrado" });
    }

    if (post.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ msg: "Sem permissão" });
    }

    const deleteData = await pool.query(
      `DELETE FROM tb_post WHERE id=$1 RETURNING *`,
      [id],
    );

    res.json({
      msg: "Item excluido com sucesso",
      data: resFormatted(deleteData.rows),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "NÃO FOI POSSIVEL DELETAR AS INFORMAÇÕES" });
  }
});

app.delete("/user/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleteData = await pool.query(
      `DELETE FROM tb_user WHERE id=$1 RETURNING *`,
      [id],
    );

    if (deleteData.rows.length === 0) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    res.json({
      msg: "Item excluido com sucesso",
      data: resFormatted(deleteData.rows),
    });
  } catch (err) {
    console.log(err.toString());
    res.status(500).json({ err: "Não foi possivel deletar as informaçõessss", console: err, });
  }
});
module.exports = app;
