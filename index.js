const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { validate, validationError, Joi } = require('express-validation');

const PostStorage = {
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
}

const app = express();
const PORT = process.env.PORT || 8080

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  console.log("start")
  res.send("WELCOME To VOTEING SYSTEM")

})

app.post("/user/create", (req, res) => {

  const id = uuidv4();
  req.body = { ...req.body, id }
  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    result.users = [...result.users, req.body];


    fs.writeFile("./db.json", JSON.stringify(result), { encoding: "utf-8" }, () => {
      res.status(201).send("user created" + id);
    })
  })

})


app.post("/user/login", validate(PostStorage), (req, res) => {

  const token = uuidv4();
  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    result.users.map((el) => {
      if (el.username == req.body.username && el.password == req.body.password) {
        el.token = token;
      }
    })
    result.users = [...result.users];

    fs.writeFile("./db.json", JSON.stringify(result), { encoding: "utf-8" }, () => {
      res.status(201).send("Login successfull");
    })
  })
})

app.use(function (err, req, res, next) {

  if (err instanceof validationError) {
    return res.status(400).send("please provide username and password")
  }
  return res.status(500).json(err)
})

app.post("/user/logout", (req, res) => {

  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    result.users.map((el) => {
      if (el.username == req.body.username && el.password == req.body.password) {
        el.token = "";
      }
    })
    result.users = [...result.users];

    fs.writeFile("./db.json", JSON.stringify(result), { encoding: "utf-8" }, () => {
      res.status(200).send("User logged out successfully");
    })
  })
})

app.get("/votes/voters", (req, res) => {

  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    const filtervoter = result.users.filter(el => el.role == "voter")
    res.send(filtervoter);
  })
})

app.get("/votes/party/:party", (req, res) => {

  const { party } = req.params;
  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    const filterparty = result.users.filter(el => el.party == party)
    res.send(filterparty);
  })

})

app.post("/votes/vote/:name", (req, res) => {

  const { name } = req.params;
  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    result.users.map((el) => {
      if (el.name == name) {
        el.votes = Number(el.votes) + 1;
      }
    })
    result.users = [...result.users];

    fs.writeFile("./db.json", JSON.stringify(result), { encoding: "utf-8" }, () => {
      res.status(200).send("Voted to" + name);
    })
  })
})

app.get("/votes/count/:user", (req, res) => {

  const { user } = req.params;
  fs.readFile("./db.json", "utf-8", (err, data) => {
    const result = JSON.parse(data);
    const Data = result.users.filter(el => el.name == user);
    if (Data.length == 0){
     res.send({ status: "Cannot find user" })

    }else{
      const count = Data[0];
      res.send({ status: count.votes });
    }
  })
})

app.listen(PORT, () => {

  console.log("Server started in port http://localhost:8080/")

})