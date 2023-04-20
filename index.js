const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')

const mySQL = require('mysql2')

const db = mySQL.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "databasereact"
})

const app = express()
app.use(express.json())
app.use(cors())

app.post("/cadastro", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name

    db.query("Select * FROM user WHERE email = ?", [email], async (err, result) => {
        if(err){
            res.send(err)
        }
        else if (result.length > 0){
            res.status(400).send('Email já existente')
        }
        else{
            const hashPassword = await bcrypt.hash(password, 10).catch(e => res.send(e))

            db.query("INSERT INTO user (email, name, password) VALUES (?, ?, ?)", [email, name, hashPassword], (err) => {
                if(err){
                    res.send(err)
                }
                else{
                    res.send("Novo usuário cadastrado com sucesso!")
                }
            })
        }
    })
})

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.query("SELECT * FROM user WHERE email = ?", [email], async (err, result) => {
        if(err){
            res.send(err)
        }
        
        if(result.length > 0){
            const passwordCheck = await bcrypt.compare(password, result[0].password)

            if(passwordCheck){
                res.send("Usuário logado com sucesso!")
            }
            else{
                res.send("Senha incorreta.")
            } 
        }
        else{
            res.send("Usuário não encontrado.")
        }
    })
})

app.listen(5000, () => {
    console.log("Running on port 5000")
})