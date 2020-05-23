"use strict";

const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const util = require("util");

const config = require("../config");
const DATA_DIR = path.join(__dirname, "/..", config.DATA_DIR, "/courses.json");

//const idFilter = (req) => (course) => course.id === parseInt(req.params.id);

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const readfile = () => {
  const objToBeParsed = fs.readFileSync(DATA_DIR, "utf-8");

  const dataParsed = JSON.parse(objToBeParsed);

  return dataParsed;
};

const courses = readfile();

const writeToCourses = async () => {
  const writingData = JSON.stringify(courses, null, 2);
  await writeFile(DATA_DIR, writingData);
};

const controllers = {
  hello: (req, res) => {
    res.json({ api: "courses!" });
  },

  getCourses: async (req, res, next) => {
    try {
      const list = await readFile(DATA_DIR, "utf-8");
      res.send(JSON.parse(list));
    } catch (err) {
      if (err && err.code === "ENOENT") {
        res.status(404).end();
        return;
      }
      if (err) {
        next(err);
        return;
      }
    }
  },

  readCourse: async (req, res) => {
    const data = await readFile(DATA_DIR, "utf-8");
    let courses = JSON.parse(data);
    const course = courses.find((c) => c.id === parseInt(req.params.id));

    if (!course)
      return res.status(404).send("The course with the given id is not found.");

    res.send(course);
  },

  writeCourse: (req, res) => {
    const { error } = validateCourse(req.body);

    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }
    const course = {
      id: courses.length + 1,
      name: req.body.name,
    };
    courses.push(course);

    writeToCourses(courses);

    //res.send(courses);
    res.redirect("/");
  },

  putCourse: async (req, res) => {
    const data = fs.readFileSync(DATA_DIR, "utf-8");

    let courses = JSON.parse(data);
    const course = courses.find((c) => c.id === parseInt(req.params.id));

    if (!course) {
      res.status(404).send("The course with the given ID does not exist");
      return;
    }
    const { error } = validateCourse(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let parsedObject = JSON.parse(data);
    course.name = req.body.name;

    courses.push(course);

    let objToString = JSON.stringify(parsedObject, null, 2); // and "null" and 2 as the second and third arguments of the JSON.stringify function for good formatting

    await writeFile(DATA_DIR, objToString);
    courses.push(course);
    res.json(courses); // replace objToString with "course" to display the new course created
  },

  deleteCourse: async (req, res, next) => {
    try {
      const data = await readFile(DATA_DIR, "utf-8");

      let courses = JSON.parse(data);

      const course = courses.find((c) => c.id === parseInt(req.params.id)); //? should it become "req.body.id"?
      //I tried like this but it also did not work.

      const index = courses.indexOf(course);
      courses.splice(index, 1);

      let objToString = JSON.stringify(courses, null, 2);

      await writeFile(DATA_DIR, objToString);
      res.send(courses);
    } catch (err) {
      if (err) {
        next(err);
        return;
      }
    }
  },
};
function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required(),
  };

  return Joi.validate(course, schema);
}

module.exports = controllers;
