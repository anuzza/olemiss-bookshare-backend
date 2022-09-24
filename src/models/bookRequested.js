const mongoose = require("mongoose");

const bookRequestedSchema = new mongoose.Schema(
  {
    book: {
      title: {
        type: String,
        trim: true,
        required: true,
      },

      isbn: {
        type: String,
        trim: true,
        required: true,
        validate(value) {
          if (value.length !== 10 && value.length !== 13) {
            throw new Error("ISBN can only be 10 or 13 numbers long!");
          }
        },
      },
      edition: {
        type: String,
        required: true,
      },

      authors: [
        {
          type: String,
          required: true,
          trim: true,
        },
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_name: {
      type: String,
      trim: true,
    },
    course_code: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
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
    timestamps: true,
  }
);

const BookRequested = mongoose.model("BookRequested", bookRequestedSchema);

module.exports = BookRequested;
