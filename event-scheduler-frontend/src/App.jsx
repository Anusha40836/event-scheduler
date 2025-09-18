import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EventList from "./pages/EventList";
import NewEvent from "./pages/NewEvent";
import EditEvent from "./pages/EditEvent";
import EventOccurrences from "./pages/EventOccurrences";

function App() {
  return (
    <Router>
      <div
        className="min-vh-100 d-flex flex-column align-items-center"
        style={{
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <h1
          className="text-white mb-5"
          style={{
            fontWeight: "700",
            textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
          }}
        >
          Event Scheduler
        </h1>

        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/events" element={<EventList />} /> {/* Add this */}
          <Route path="/events/new" element={<NewEvent />} />
          <Route path="/events/:id/edit" element={<EditEvent />} />
          <Route
            path="/events/:id/occurrences"
            element={<EventOccurrences />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
