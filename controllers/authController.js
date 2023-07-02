const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @desc user login system
 * @route POST /login
 * @access PUBLIC
 */
const userRegister = asyncHandler(async (req, res) => {
  // get json data
  const { name, email, password } = req.body;

  // data validate
  if (!name || !email || !password) {
    return res.status(400).json({ message: "all fields are required" });
  }

  // email existance
  const emailCheck = await User.findOne({ email });
  if (emailCheck)
    return res.status(400).json({ message: "Email already exists" });

  // create new user

  // hash password
  const hash = await bcrypt.hash(password, 10);

  // create new user data
  const user = await User.create({ name, email, password: hash });

  // check
  if (user) {
    return res.status(201).json({ message: "User created successful", user });
  } else {
    return res.status(400).json({ message: "Invalid user data" });
  }
});

/**
 * @desc user login system
 * @route POST /login
 * @access PUBLIC
 */
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validate
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check user
  const loginUser = await User.findOne({ email });

  if (!loginUser) {
    return res.status(400).json({ message: "User not found" });
  }

  // password math
  const passCheck = await bcrypt.compare(password, loginUser.password);

  if (!passCheck) {
    return res.status(400).json({ message: "Wrong Password" });
  }

  // access token
  const accessToken = jwt.sign(
    {
      email: loginUser.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );

  // Refresh token
  // const refreshToken = jwt.sign(
  //   {
  //     email: loginUser.email,
  //   },
  //   process.env.REFRESH_TOKEN_SECRET,
  //   {
  //     expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  //   }
  // );

  res.cookie("accessToken", accessToken);

  res.status(200).json({
    token: accessToken,
    user: loginUser,
  });
});

/**
 * @desc refresh token request
 * @route GET /refresh
 * @access PUBLIC
 */
const refreshToken = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.rToken) {
    return res.status(400).json({ message: "Invalid token request" });
  }

  const token = cookies.rToken;

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decode) => {
      if (err) return res.status(400).json({ message: "Invalid Token" });

      const tokenUser = await User.findOne({ email: decode.email });

      if (!tokenUser)
        return res.status(404).json({ message: "Token user not found" });

      // access token
      const accessToken = jwt.sign(
        {
          email: tokenUser.email,
          role: tokenUser.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        }
      );

      res.status(200).json({ token: accessToken });
    })
  );
};

/**
 * @desc refresh token request
 * @route GET /refresh
 * @access PUBLIC
 */
const me = (req, res) => {
  if (!req.me) return res.status(404).json({ message: "User not found" });

  res.json({ user: req.me });
};

/**
 * @desc user Logout
 * @route POST /logout
 * @access PUBLIC
 */

const userLogout = (req, res) => {
  const cookies = req.cookies;

  // if (!cookies?.rToken) {
  //   return res.status(400).json({ message: "Invalid Request" });
  // }

  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
    })
    .json({ message: "Logout okay" });
};

// export
module.exports = { userLogin, refreshToken, userLogout, me, userRegister };
