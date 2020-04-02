const express = require("express");
const { check, validationResult } = require("express-validator");
const { createUser } = require("../config/db");

const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();

router.post(
  "/",
  [
    check("name", "Name is required")
      .isLength({ min: 2 })
      .not()
      .isEmpty(),
    check("password", "Password Required").isLength({ min: 6 }),
    check("email", "Email is required").isEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json({
          errors: errors.array().map(err=>{ return err.msg})
        });
      }
      const newuser = {
        user_name: req.body.name,
        user_email: req.body.email,
        user_password: req.body.password
      };
      const payload = await createUser(newuser);
      if (payload.error) {
        res.status(400).json(payload);
        return payload;
      }
      jwt.sign(
        payload,
        config.get("jwtKey"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server Error" });
    }
  }
);
module.exports = router;
