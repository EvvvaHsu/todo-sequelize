const express = require('express')
const router = express.Router()

const db = require('../../models')
const Todo = db.Todo
const User = db.User

router.get('/', (req, res) => {
    return Todo.findAll({
      raw: true,
      nest: true,
      where: { UserId: req.user.id }
    })
      .then((todos) => { 
        // console.log(todos)  
        return res.render('index', { todos: todos }) })
      .catch((error) => { return res.status(422).json(error) })
  })
  
module.exports = router