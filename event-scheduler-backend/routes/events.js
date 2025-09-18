// routes/events.js
const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const {
  generateWeeklyOccurrences,
  generateMonthlyOccurrences,
} = require("../utils/occurrences");

// Create event
// POST /api/events
// body: { title, description, startDate, recurrence (object|optional) }
router.post("/", async (req, res) => {
  try {
    const { title, description, startDate, recurrence } = req.body;
    if (!title || !startDate)
      return res
        .status(400)
        .json({ error: "title and startDate are required" });

    // Basic validation for recurrence
    if (recurrence) {
      if (!["single", "weekly", "monthly"].includes(recurrence.type)) {
        return res
          .status(400)
          .json({ error: "recurrence.type must be single|weekly|monthly" });
      }
      // weekly needs weekdays
      if (
        recurrence.type === "weekly" &&
        (!recurrence.weekdays || recurrence.weekdays.length === 0)
      ) {
        return res
          .status(400)
          .json({ error: "weekly recurrence requires weekdays array" });
      }
      // monthly needs monthDates
      if (
        recurrence.type === "monthly" &&
        (!recurrence.monthDates || recurrence.monthDates.length === 0)
      ) {
        return res
          .status(400)
          .json({ error: "monthly recurrence requires monthDates array" });
      }
    }

    const ev = new Event({
      title,
      description,
      startDate: new Date(startDate),
      recurrence: recurrence ? recurrence : null,
    });

    await ev.save();
    res.status(201).json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// List events (simple)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: "Event not found" });
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Occurrences for a specific event
// GET /api/events/:id/occurrences?until=2025-06-30&max=50
router.get("/:id/occurrences", async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    const untilQuery = req.query.until ? new Date(req.query.until) : null;
    const maxQuery = req.query.max ? parseInt(req.query.max, 10) : null;

    // single event
    if (!ev.recurrence || ev.recurrence.type === "single") {
      const d = ev.startDate;
      if (untilQuery && d.getTime() > untilQuery.getTime()) return res.json([]);
      return res.json([d.toISOString()]);
    }

    // build generator params
    const rec = ev.recurrence;
    const paramsBase = {
      startDate: ev.startDate,
      interval: rec.interval || 1,
      endDate: rec.endDate || untilQuery,
      maxOccurrences: rec.occurrences || maxQuery || null,
    };

    let occ = [];
    if (rec.type === "weekly") {
      paramsBase.weekdays =
        rec.weekdays && rec.weekdays.length
          ? rec.weekdays
          : [ev.startDate.getUTCDay()];
      occ = generateWeeklyOccurrences(paramsBase);
    } else if (rec.type === "monthly") {
      paramsBase.monthDates =
        rec.monthDates && rec.monthDates.length
          ? rec.monthDates
          : [ev.startDate.getUTCDate()];
      occ = generateMonthlyOccurrences(paramsBase);
    }

    return res.json(occ.map((d) => d.toISOString()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Update event
// PUT /api/events/:id
// body: { title?, description?, startDate?, recurrence? }
router.put("/:id", async (req, res) => {
  try {
    const { title, description, startDate, recurrence } = req.body;

    // find event
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    // update fields if provided
    if (title !== undefined) ev.title = title;
    if (description !== undefined) ev.description = description;
    if (startDate !== undefined) ev.startDate = new Date(startDate);
    if (recurrence !== undefined) ev.recurrence = recurrence;

    await ev.save();
    res.json(ev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Delete event
// DELETE /api/events/:id
router.delete("/:id", async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: "Event not found" });

    await ev.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

module.exports = router;
