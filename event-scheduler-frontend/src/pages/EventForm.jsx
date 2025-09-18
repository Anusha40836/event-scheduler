import React, { useState, useEffect } from "react";
import axios from "axios";

const weekdaysList = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const monthDatesList = Array.from({ length: 31 }, (_, i) => i + 1);

function EventForm({ initialData = {}, onSubmit, submitLabel = "Create" }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    recurrenceType: "single",
    interval: 1,
    weekdays: [],
    monthDates: [],
    endDate: "",
    occurrences: "",
  });

  useEffect(() => {
    if (initialData.title) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        startDate: initialData.startDate?.slice(0, 10) || "",
        recurrenceType: initialData.recurrence?.type || "single",
        interval: initialData.recurrence?.interval || 1,
        weekdays: initialData.recurrence?.weekdays || [],
        monthDates: initialData.recurrence?.monthDates || [],
        endDate: initialData.recurrence?.endDate?.slice(0, 10) || "",
        occurrences: initialData.recurrence?.occurrences || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWeekdayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  const handleMonthDateToggle = (date) => {
    setFormData((prev) => ({
      ...prev,
      monthDates: prev.monthDates.includes(date)
        ? prev.monthDates.filter((d) => d !== date)
        : [...prev.monthDates, date],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recurrence = { type: formData.recurrenceType };
    if (formData.recurrenceType !== "single") {
      recurrence.interval = parseInt(formData.interval, 10) || 1;
      if (formData.recurrenceType === "weekly")
        recurrence.weekdays = formData.weekdays;
      if (formData.recurrenceType === "monthly")
        recurrence.monthDates = formData.monthDates;
      if (formData.endDate) recurrence.endDate = formData.endDate;
      if (formData.occurrences)
        recurrence.occurrences = parseInt(formData.occurrences, 10);
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      recurrence,
    };

    if (onSubmit) {
      onSubmit(payload);
    } else {
      try {
        await axios.post("http://localhost:4000/api/events", payload);
        alert("✅ Event saved!");
        setFormData({
          title: "",
          description: "",
          startDate: "",
          recurrenceType: "single",
          interval: 1,
          weekdays: [],
          monthDates: [],
          endDate: "",
          occurrences: "",
        });
      } catch (err) {
        console.error(err);
        alert("❌ Failed to save event");
      }
    }
  };

  return (
    <div className="container mt-4 p-4 bg-light rounded shadow">
      <h2 className="text-center mb-3">{submitLabel} Event</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Start Date */}
        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Recurrence Type */}
        <div className="mb-3">
          <label className="form-label">Recurrence</label>
          <select
            name="recurrenceType"
            className="form-select"
            value={formData.recurrenceType}
            onChange={handleChange}
          >
            <option value="single">Single</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {formData.recurrenceType !== "single" && (
          <>
            {/* Interval */}
            <div className="mb-3">
              <label className="form-label">
                Interval (every N weeks/months)
              </label>
              <input
                type="number"
                min="1"
                name="interval"
                className="form-control"
                value={formData.interval}
                onChange={handleChange}
              />
            </div>

            {/* Weekly weekdays */}
            {formData.recurrenceType === "weekly" && (
              <div className="mb-3">
                <label className="form-label">Select Weekdays</label>
                <div className="d-flex flex-wrap gap-2">
                  {weekdaysList.map((day) => (
                    <button
                      type="button"
                      key={day.value}
                      className={`btn btn-sm ${
                        formData.weekdays.includes(day.value)
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleWeekdayToggle(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly dates */}
            {formData.recurrenceType === "monthly" && (
              <div className="mb-3">
                <label className="form-label">Select Month Dates</label>
                <div className="d-flex flex-wrap gap-2">
                  {monthDatesList.map((date) => (
                    <button
                      type="button"
                      key={date}
                      className={`btn btn-sm ${
                        formData.monthDates.includes(date)
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleMonthDateToggle(date)}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* End Date */}
            <div className="mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            {/* Number of Occurrences */}
            <div className="mb-3">
              <label className="form-label">Number of Occurrences</label>
              <input
                type="number"
                name="occurrences"
                className="form-control"
                value={formData.occurrences}
                onChange={handleChange}
                min="1"
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary w-100">
          {submitLabel} Event
        </button>
      </form>
    </div>
  );
}

export default EventForm;
