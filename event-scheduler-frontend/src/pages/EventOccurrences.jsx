import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function EventOccurrences() {
  const { id } = useParams();
  const [occurrences, setOccurrences] = useState([]);
  const [event, setEvent] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const fetchOccurrences = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);

        let url = `/events/${id}/occurrences?max=50`;
        if (res.data.recurrence?.endDate) {
          url += `&until=${res.data.recurrence.endDate}`;
        }

        const occRes = await api.get(url);
        setOccurrences(occRes.data);
      } catch (err) {
        console.error("Error fetching occurrences:", err);
      }
    };

    fetchOccurrences();
  }, [id]);

  if (!event) return <p>Loading...</p>;

  const totalPages = Math.ceil(occurrences.length / PER_PAGE);
  const paginatedOccurrences = occurrences.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  const renderRecurrence = () => {
    if (!event.recurrence) return "Single Event";

    const { type, weekdays, monthDates, interval } = event.recurrence;

    if (type === "weekly") {
      const days = weekdays.map((d) => WEEKDAYS[d]).join(", ");
      return `Weekly on ${days} (every ${interval || 1} week${
        interval > 1 ? "s" : ""
      })`;
    }

    if (type === "monthly") {
      const dates = monthDates.join(", ");
      return `Monthly on day(s) ${dates} (every ${interval || 1} month${
        interval > 1 ? "s" : ""
      })`;
    }

    return "Single Event";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{event.title}</h2>
      <p>
        <strong>Recurrence:</strong> {renderRecurrence()}
      </p>

      {paginatedOccurrences.length === 0 ? (
        <p>No occurrences found.</p>
      ) : (
        <>
          <ul>
            {paginatedOccurrences.map((date, idx) => (
              <li key={idx}>{new Date(date).toLocaleString()}</li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div style={{ marginTop: "10px" }}>
              <button onClick={handlePrev} disabled={page === 1}>
                Prev
              </button>
              <span style={{ margin: "0 10px" }}>
                Page {page} of {totalPages}
              </span>
              <button onClick={handleNext} disabled={page === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EventOccurrences;
