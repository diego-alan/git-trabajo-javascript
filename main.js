const express = require("express");
const bodyParser = require("body-parser");
const pg = require('pg');
const { response } = require("express");

const  config = {
  user: 'todos_db_tj6o_user',
  database: 'todos_db_tj6o',
  password: 'PECLUBiSPOAr4DvJkzGREtkVOWJtx2rq',
  host: 'dpg-cf1k10p4reb5o42pc8l0-a.oregon-postgres.render.com',
  port: 5432,
  ssl: true

}

const client = new pg.Pool(config)

// Modelo
class UsuarioModel {
  constructor() {
    this.usuarios = [];
  }

  async getUsuarios(){
    const res = await client.query('select * from usuario;')
    console.log(res);
    return res.rows
  }

  async addUsuario(usuarioText) {
    const query = 'INSERT  INTO usuario(task) VALUES ($1) RETURNING *';
    const values = [usuarioText]
    const res = await client.query(query, values) 
    return res;
  }

  addUsuario(usuarioText) {
    const usuario = {
      text: usuarioText,
      completed: false,
    };
    this.usuarios.push(usuario);
  }

  editUsuario(index, usuarioText) {
    this.usuarios[index].text = usuarioText;
  }

  deleteUsuario(index) {
    this.usuarios.splice(index, 1);
  }

  toggleUsuario(index) {
    this.usuarios[index].completed = !this.usuarios[index].completed;
  }
}

// Controlador
class UsuarioController {
  constructor(model) {
    this.model = model;
  }

  async getStatus(){
    return {nameSystem: 'api-users', version: 'version 0.0.1', developer: 'diego alanes pardo', email: 'dalanes1990pardo@gmail.com'};
  }

  async getUsuarios(){
    return await this.model.getUsuarios();
  }

  async addUsuario(usuarioText) {
    await this.model.addUsuario(usuarioText);
  }

  editUsuario(index, usuarioText) {
    this.model.editUsuario(index, usuarioText);
  }

  deleteUsuario(index) {
    this.model.deleteUsuario(index);
  }

  toggleUsuario(index) {
    this.model.toggleUsuario(index);
  }
}

// Vistas (Rutas)
const app = express();
const usuarioModel = new UsuarioModel();
const usuarioController = new UsuarioController(usuarioModel);

app.use(bodyParser.json());

app.get("/status", async (req, res) => {
  const response = await usuarioController.getStatus()
  res.json(response)

});
app.get("/usuario", async (req, res) => {
  const response = await usuarioController.getUsuarios()
  res.json(response)
});

// Vistas (Rutas) (continuación)
app.post("/usuario", (req, res) => {
  const usuarioText = req.body.text;
  console.log(req.body)
  usuarioController.addUsuario(usuarioText);
  res.sendStatus(200);
});

app.put("/usuario/:index", (req, res) => {
  const index = req.params.index;
  const usuarioText = req.body.usuario;
  usuarioController.editUsuario(index, usuarioText);
  res.sendStatus(200);
});

app.delete("/usuario/:index", (req, res) => {
  const index = req.params.index;
  usuarioController.deleteUsuario(index);
  res.sendStatus(200);
});

app.patch("/usuario/:index", (req, res) => {
  const index = req.params.index;
  usuarioController.toggleUsuario(index);
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
