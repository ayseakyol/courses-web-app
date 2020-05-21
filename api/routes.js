const controllers = require("./controllers.js");
const express = require("express");

const router = express.Router();

router.get("/", controllers.hello);

// write your routes
router.get("/courses", controllers.getCourses);

// read a file
router.get("/courses/:id", controllers.readFile);

// write a file
router.post("/courses", controllers.writeFile);

// put a file
router.put("/courses/:id", controllers.putFile);

// delete a file
router.delete("/courses/:id", controllers.deleteFile);

module.exports = router;
