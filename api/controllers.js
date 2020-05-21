"use strict";

const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const util = require("util");
const express = require("express");

const config = require("../config");
const DATA_DIR = path.join(__dirname, "/..", config.DATA_DIR, "/courses.json");

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const deleteFile = util.promisify(fs.unlink);

const controllers = {
  hello: (req, res) => {
    try {
      res.json({ api: "courses!" });
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
  readFile: async (req, res, next) => {
    const data = await readFile(DATA_DIR, "utf-8");
    let courses = JSON.parse(data);
    const course = courses.find((c) => c.id === parseInt(req.params.id));

    if (!course)
      return res.status(404).send("The course with the given id is not found.");

    res.send(course);
  },

  writeFile: (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    } else {
      fs.readFile(DATA_DIR, "utf-8", (err, data) => {
        if (err) {
          res.status(404).send(err);
        } else {
          let parsedObject = JSON.parse(data);
          let course = {
            id: parsedObject.length + 1,
            name: req.body.name,
          };
          parsedObject.push(course);
          let objToString = JSON.stringify(parsedObject, null, 2); // and "null" and 2 as the second and third arguments of the JSON.stringify function for good formatting

          fs.writeFile(DATA_DIR, objToString, (err) => {
            if (err) res.status(404).send(err);
            res.send(course); // replace objToString with "course" to display the new course created
          });
        }
      });
    }
  },
  putFile: (req, res) => {},

  deleteFile: async (req, res, next) => {
    //   const id = req.params.id;
    //   try {
    //     await deleteFile(`${DATA_DIR}`);
    //     // refactor hint:
    //     res.redirect(303, "/api/courses");
    //   } catch (err) {
    //     if (err && err.code === "ENOENT") {
    //       res.status(404).end();
    //       return;
    //     }
    //     if (err) {
    //       next(err);
    //       return;
    //     }
    //   }
  },
};

function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required(),
  };

  return Joi.validate(course, schema);
}

module.exports = controllers;
