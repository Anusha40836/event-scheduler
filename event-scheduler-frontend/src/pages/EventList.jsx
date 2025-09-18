// src/pages/EventList.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function EventList() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (err) {
        console.error("Error deleting event:", err);
      }
    }
  };

  const displayRecurrence = (recurrence) => {
    if (!recurrence || recurrence.type === "single") return "Single";
    let text = `${recurrence.type} every ${recurrence.interval || 1} ${
      recurrence.type === "weekly" ? "week(s)" : "month(s)"
    }`;
    if (recurrence.type === "weekly" && recurrence.weekdays)
      text += ` on ${recurrence.weekdays.join(", ")}`;
    if (recurrence.type === "monthly" && recurrence.monthDates)
      text += ` on ${recurrence.monthDates.join(", ")}`;
    if (recurrence.endDate) text += ` until ${recurrence.endDate.slice(0, 10)}`;
    if (recurrence.occurrences) text += ` (${recurrence.occurrences} times)`;
    return text;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Events</h2>
      <button
        onClick={() => navigate("/events/new")}
        style={{ marginBottom: "20px" }}
      >
        + Create New Event
      </button>
      <ul>
        {events.map((ev) => (
          <li key={ev._id} style={{ marginBottom: "10px" }}>
            <strong>{ev.title}</strong> ({displayRecurrence(ev.recurrence)})
            {" | "}
            <Link to={`/events/${ev._id}/occurrences`}>View Occurrences</Link>
            {" | "}
            <button
              onClick={() => navigate(`/events/${ev._id}/edit`)}
              style={{ marginLeft: "5px" }}
            >
              Edit
            </button>
            {" | "}
            <button
              onClick={() => handleDelete(ev._id)}
              style={{ marginLeft: "5px" }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventList;
