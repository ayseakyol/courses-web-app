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

  putCourse: (req, res) => {
    const course = courses.find(
      (course) => course.id === parseInt(req.body.id)
    );

    if (!course) {
      res.status(404).send("The course with the given Id was not found..");
      return;
    }

    course.name = req.body.name;

    writeToCourses();

    //res.send(courses);
    res.redirect("/");
  },

  deleteCourse: async (req, res, next) => {
    try {
      const course = courses.find(
        (course) => course.id == parseInt(req.body.id)
      );

      const index = courses.indexOf(course);
      courses.splice(index, 1);

      writeToCourses();

      //res.send(courses);
      res.redirect("/");
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
