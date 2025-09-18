// src/pages/EditEvent.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import EventForm from "../pages/EventForm";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEventData(res.data);
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };
    fetchEvent();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await api.put(`/events/${id}`, data);
      alert("✅ Event updated successfully!");
      navigate("/events");
    } catch (err) {
      console.error("Error updating event:", err);
      alert("❌ Failed to update event");
    }
  };

  if (!eventData) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Event</h2>
      <EventForm
        initialData={eventData}
        onSubmit={handleUpdate}
        submitLabel="Update"
      />
    </div>
  );
}

export default EditEvent;
