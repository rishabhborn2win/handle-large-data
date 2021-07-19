const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Hi I am in Route Folder")
})
module.exports = router