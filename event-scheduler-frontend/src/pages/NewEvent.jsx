// src/pages/NewEvent.jsx
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import EventForm from "../pages/EventForm";

function NewEvent() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await api.post("/events", data);
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Event</h2>
      <EventForm onSubmit={handleCreate} submitLabel="Save" />
    </div>
  );
}

export default NewEvent;
