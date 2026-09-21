import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Search,
  ArrowUpRight,
  IndianRupee,
  Loader2,
} from "lucide-react";
import API from "../../api/adminAPI"; // Adjust path if necessary

// Define the Event interface based on your API response
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  duration: number;
  location: string;
  venue: string;
  date: string;
  time: string;
  image: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  status: string;
  isPublished: boolean;
}

const ManageEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);

        const response = await API.get("/admin/events", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        let fetchedEvents = [];

        if (Array.isArray(response.data)) {
          fetchedEvents = response.data;
        } else if (
          response.data?.events &&
          Array.isArray(response.data.events)
        ) {
          fetchedEvents = response.data.events;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          fetchedEvents = response.data.data;
        }

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]); // Fallback to an empty array if the API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Format date nicely (e.g., Aug 29, 2026)
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Filter events based on search term
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Manage Events
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View, track, and manage your published and upcoming events.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                      <p className="text-sm font-medium">
                        Loading events data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      No events found matching your search.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const ticketsSold =
                    event.totalTickets - event.availableTickets;
                  const salesPercentage =
                    (ticketsSold / event.totalTickets) * 100;

                  return (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/admin/events/${event.id}`)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Event Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {event.title}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                              <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-600">
                                {event.category}
                              </span>
                              • {event.language}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(event.date)}
                          </div>
                          <p className="text-xs text-gray-500 ml-5">
                            {event.time} • {event.duration} mins
                          </p>
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {event.location}
                          </div>
                          <p className="text-xs text-gray-500 ml-5 truncate max-w-[150px]">
                            {event.venue}
                          </p>
                        </div>
                      </td>

                      {/* Sales Metrics */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-900">
                              {ticketsSold} / {event.totalTickets}
                            </span>
                            <span className="text-gray-500 flex items-center">
                              <IndianRupee className="w-3 h-3" /> {event.price}
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${salesPercentage > 80 ? "bg-green-500" : salesPercentage > 40 ? "bg-blue-500" : "bg-gray-400"}`}
                              style={{ width: `${salesPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            event.status === "UPCOMING"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : event.status === "LIVE"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-gray-50 border-gray-200 text-gray-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          className="p-2 text-gray-400 group-hover:text-blue-600 transition-colors rounded-lg group-hover:bg-blue-50"
                          title="View Dashboard"
                        >
                          <ArrowUpRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
