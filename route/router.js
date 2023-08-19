const express = require("express");
const router = express.Router();
const userCollection = require("../model/userSchema");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secret_key = "hkfkhgk649fkfk3949dfkddkrtttef";

const saltRound = 12;

router.use(cookieParser());
router.get("/", (req, res) => {
  res.send("hello world");
});

router.get("/contact", (req, res) => {
  res.send("this is the contact page");
});

router.post("/signup", async (req, res) => {
  const { username, email, phone, password, cpassword } = req.body;

  if ((!username, !email, !phone, !password, !cpassword)) {
    return res.json({ error: "plz fill fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const userExit = await userCollection.findOne({ email: email });
    if (userExit) {
      return res.json({ error: "email already exits" });
    } else if (password !== cpassword) {
      return res.json({ error: "password are not matching" });
    } else {
      const user = new userCollection({
        username,
        email,
        phone,
        password: hashedPassword,
        cpassword: hashedPassword,
      });
      const userData = await user.save();

      if (userData) {
        res.status(201).json({ message: "data saved" });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    res.json({ error: "plz fill fields" });
  }
  const loginData = await userCollection.findOne({ email: email });

  if (loginData) {
    const passwordMatch = await bcrypt.compare(password, loginData.password);

    if (passwordMatch) {
      const payload = {
        user: {
          id: loginData._id,
          email: loginData.email,
        },
      };

      jwt.sign(payload, secret_key, { expiresIn: "1h" }, (err, token) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ error: "Error while generating token" });
        }

        res.cookie("userToken", token, { maxAge: 3600000, httpOnly: true });
        loginData.token = token;
        loginData.save();

        return res
          .status(200)
          .json({ token: token, message: "User login successful" });
      });
    } else {
      res.json({ message: "invalid password" });
    }
  } else {
    res.json({ error: "invalid email" });
  }
});

const userAuth = async (req,res, next) => {
  try {
    const tokenValue = req.cookies.userToken;

    if (!tokenValue) {
      console.log("no token provided");
    }

    const verify_token = jwt.verify(tokenValue, secret_key);

    const tokenUserdata = await userCollection.findOne({
      _id: verify_token.user.id,
      token: tokenValue,
    });

    if (!tokenUserdata) {
      console.log(`user not found`);
    }

    req.token = tokenValue;

    req.tokenUserdata = tokenUserdata;

    next();
  } catch (err) {
    res.status(401).json({ err: "authentication failed" });
    console.log(err);
  }
};

router.get("/about", userAuth, (req, res) => {
  res.send(req.tokenUserdata);
});
router.get("/getdata", userAuth, (req, res) => {
  res.send(req.tokenUserdata);
});

router.get("/logout",  (req, res) => {
 res.clearCookie('userToken');
 res.status(200).send(`logout success`)
});

module.exports = router;
