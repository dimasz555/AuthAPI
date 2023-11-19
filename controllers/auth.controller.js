const { users } = require("../models"),
  utils = require("../utils/hash"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt"),
  nodemailer = require("nodemailer");

require("dotenv").config();
const secret_key = process.env.JWT_KEY || "no_secret";

module.exports = {
  register: async (req, res) => {
    try {
      // check if the email already exists
      const findUser = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (findUser) {
        return res.status(404).json({
          error: "Your email already registered",
        });
      }

      const data = await users.create({
        data: {
          email: req.body.email,
          password: await utils.cryptPassword(req.body.password),
        },
      });
      // return res.status(201).json({
      //   data,
      // });

      return res.render("success");
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  },

  login: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (!findUser) {
        return res.status(404).json({
          error: "Your email is not registered",
        });
      }

      if (bcrypt.compareSync(req.body.password, findUser.password)) {
        const token = jwt.sign(
          { id: findUser.id, email: findUser.email },
          secret_key,
          { expiresIn: "5h" }
        );
        // return res.status(200).json({
        //   data: {
        //     token,
        //   },
        // });
        const username = findUser.email.split("@")[0];

        return res.render("welcome", { username });
      }
      return res.status(403).json({
        error: "Invalid credentials",
      });
    } catch (error) {
      return res.status(500).json({
        error,
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      const encrypt = await utils.cryptPassword(req.body.email);

      await users.update({
        data: {
          resetPasswordToken: encrypt,
        },
        where: {
          id: findUser.id,
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });

      const mailOptions = {
        from: "system@gmail.com",
        to: req.body.email,
        subject: "Reset Password",
        html: `<p>Reset Password <a href="http://localhost:3000/set-password/${encrypt}">Click Here</a></p>
        `,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          return res.render("error");
        }
        console.log(encrypt);
        return res.render("success");
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },

  setPassword: async (req, res) => {
    try {
      const findUser = await users.findFirst({
        where: {
          resetPasswordToken: req.body.key,
        },
      });

      if (!findUser) {
        return res.render("error");
      }

      await users.update({
        data: {
          password: await utils.cryptPassword(req.body.password),
          resetPasswordToken: null,
        },
        where: {
          id: findUser.id,
        },
      });

      return res.render("success");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
      });
    }
  },
};
