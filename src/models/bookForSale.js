const mongoose = require("mongoose");

const bookForSaleSchema = new mongoose.Schema(
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
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    pictures: [
      {
        type: String,
        trim: true,
      },
    ],
    condition: {
      type: String,
      enum: ["NEW", "USED"],
      default: "USED",
      required: true,
      trim: true,
    },
    course_name: {
      type: String,
      trim: true,
    },
    course_code: {
      type: String,
      trim: true,
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

const BookForSale = mongoose.model("BookForSale", bookForSaleSchema);

module.exports = BookForSale;
