const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
        if (!value.includes("go.olemiss.edu")) {
          throw new Error("Must be an Ole Miss email!");
        }
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: String,
      trim: true,
    },
    contact_number: {
      value: { type: String },
      visibility: { type: Boolean, default: false },
    },
    classification: {
      type: String,
      trim: true,
      required: true,
    },
    major: {
      type: String,
      trim: true,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookForSale",
      },
    ],
    reports: [
      {
        reporter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    toJSON: true,

    timestamps: true,
  }
);

// To use virtual fields(Books Sold by this user)
userSchema.virtual("booksForSale", {
  ref: "BookForSale",
  //   Field on this document
  localField: "_id",
  //   Field on the other document
  foreignField: "seller",
  options: { sort: { createdAt: -1 } },
});

// To use virtual fields(Book Requested by this user)
userSchema.virtual("booksRequested", {
  ref: "BookRequested",
  //   Field on this document
  localField: "_id",
  //   Field on the other document
  foreignField: "user",
  // options: { sort: { active: 1, createdAt: -1 } },
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.reports;
  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  await User.updateOne(
    { email: user.email },
    { tokens: user.tokens.concat({ token }) }
  );
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email or password is invalid");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Email or password is invalid");
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
