// models/Event.js
const mongoose = require("mongoose");

const RecurrenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["single", "weekly", "monthly"],
      required: true,
    },
    weekdays: [{ type: Number }], // 0 (Sun) .. 6 (Sat) - used for weekly
    monthDates: [{ type: Number }], // 1..31 - used for monthly
    interval: { type: Number, default: 1 }, // every n weeks/months
    endDate: { type: Date }, // optional end date
    occurrences: { type: Number }, // optional max occurrences
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true }, // canonical anchor (UTC recommended)
  recurrence: { type: RecurrenceSchema, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", EventSchema);
