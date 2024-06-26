const User = require("../models/User");

//@desc     Register user
//@route    POST api/v1/auth/register
//@access   Public

exports.register = async (req, res, next) => {
  // res.status(200).json({success:true});
  try {
    const { name, email, password, role } = req.body;

    //create user to the database
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    sendTokenResponse(user, 200, res);
    // res.status(200).json({success:true , data: req.body});
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

//@desc     Login user
//@route    POST api/v1/auth/login
//@access   Public

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // return res.status(400).json({success : false , msg: 'Invalid credentials (user not found)'});
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Check if password matches

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // return res.status(401).json({success : false , msg: 'Invalid credentials (password incorrect)'});
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({
      success: false,
      msg: "Cannot convert email or password to string",
    });
  }
};

//@desc     Logout user
//@route    GET api/v1/auth/logout
//@access   Private

exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// get token from model, create cookie and send response

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    // res.status(statusCode).json({
    success: true,

    // add for frontend
    _id: user._id,
    name: user.name,
    email: user.email,
    // end for frontend
    token,
  });
  // console.log('from backend',user._id , user.name ,user.email );
  // print('from backend',user._id , user.name ,user.email )
};

//@desc     Get current Logged in user
//@route    Get api/v1/auth/me
//@access   Private

exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};
