const express = require("express");

const router = express.Router();


// import the handlers
const { login, signup } = require("../controllers/Auth");
const { auth } = require("../middlewares/auth");


router.post('/signup', signup);

router.post('/login', login);


module.exports = router;