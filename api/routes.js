const controllers = require("./controllers.js");
const express = require("express");

const router = express.Router();

router.get("/", controllers.hello);

// write your routes
router.get("/courses", controllers.getCourses);

// read a file
router.get("/courses/:id", controllers.readCourse);

// write a file
router.post("/courses", controllers.writeCourse);

// put a file
router.put("/courses/:id", controllers.putCourse);

// delete a file
router.delete("/courses/:id", controllers.deleteCourse);

module.exports = router;
