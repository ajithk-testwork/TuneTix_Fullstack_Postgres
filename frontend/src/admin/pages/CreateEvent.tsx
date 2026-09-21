import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Type,
  AlignLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ticket,
  Tags,
  Languages,
  Hourglass,
  UserCheck,
  Building,
  Mic2,
  UploadCloud,
  X,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Added for redirection
import API from "../../api/adminAPI";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};


const CreateEvent: React.FC = () => {
  const navigate = useNavigate(); // Initialize navigation
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Defaulted Ticketing and Publishing state since UI sections are removed
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    language: "",
    duration: "",
    minimumAge: "",
    location: "",
    venue: "",
    organizer: "",
    date: "",
    time: "",
    price: "0",           // Default value for backend validation
    totalTickets: "0",    // Default value for backend validation
    SeatCategory: "GENERAL", 
    isPublished: false,   // Default to unpublished
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelection = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setStatus({ type: null, message: "" });
    } else {
      setStatus({
        type: "error",
        message: "Please upload a valid image file (PNG, JPG, WEBP).",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelection(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setStatus({ type: "error", message: "Please upload an event image." });
      return;
    }

    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      submitData.append("image", imageFile);

      const res = await API.post("/event/create-event", submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus({
        type: "success",
        message: res.data.message || "Event Created Successfully! Redirecting...",
      });

      // Clear the form
      setFormData({
        title: "",
        description: "",
        category: "",
        language: "",
        duration: "",
        minimumAge: "",
        location: "",
        venue: "",
        organizer: "",
        date: "",
        time: "",
        price: "0",
        totalTickets: "0",
        SeatCategory: "GENERAL",
        isPublished: false,
      });
      removeImage();

      // Redirect to the newly created event (Adjust the route based on your routing setup)
      setTimeout(() => {
        if (res.data?.event?.id) {
          navigate('/admin/manage-events');
        } else {
          navigate(`/admin`);
        }
      }, 1500);

    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Server connection failed. Please check your network and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto pb-16 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
       

        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Management Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create New Event
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Configure event metadata and promotional artwork. Events are saved as drafts by default.
          </p>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence mode="wait">
        {status.type && (
          <motion.div
            key={status.type}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`mb-8 p-4 rounded-xl flex items-center gap-3.5 border shadow-sm ${
              status.type === "success"
                ? "bg-emerald-50/80 text-emerald-800 border-emerald-200"
                : "bg-rose-50/80 text-rose-800 border-rose-200"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <p className="text-sm font-medium tracking-wide">{status.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Artwork */}
        <motion.section
          
          className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden"
        >
          <div className="bg-gray-50/60 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                1. Promotional Artwork
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload a high-resolution cover poster displayed across ticketing feeds and checkout headers.
              </p>
            </div>
          </div>
          <div className="p-8">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
              Cover Image <span className="text-red-500">*</span>
            </label>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-56 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                    : "border-gray-200 bg-gray-50/40 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="p-3.5 bg-white rounded-full shadow-sm border border-gray-100 mb-3">
                  <UploadCloud className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  SVG, PNG, JPG, or WEBP (16:9 aspect ratio recommended)
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group"
              >
                <img
                  src={imagePreview}
                  alt="Cover Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
                  <p className="text-white text-sm font-medium truncate max-w-[70%]">
                    {imageFile?.name}
                  </p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-3.5 py-2 bg-white/95 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Remove Artwork
                  </button>
                </div>
              </motion.div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </motion.section>

        {/* Section 2: Details */}
        <motion.section
          
          className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden"
        >
          <div className="bg-gray-50/60 px-8 py-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              2. Core Event Specifications
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter primary classification, language, duration, and organizer metadata.
            </p>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Event Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., Rockstar Anirudh XV — Live in Concert"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tags className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="MUSIC">Music</option>
                  <option value="CONCERT">Concert</option>
                  <option value="DANCE">Dance</option>
                  <option value="DJ_NIGHT">DJ Night</option>
                  <option value="COMEDY">Comedy</option>
                  <option value="MOVIE">Movie</option>
                  <option value="SPORTS">Sports</option>
                  <option value="CRICKET">Cricket</option>
                  <option value="FOOTBALL">Football</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="CONFERENCE">Conference</option>
                  <option value="FESTIVAL">Festival</option>
                  <option value="THEATRE">Theatre</option>
                  <option value="EXHIBITION">Exhibition</option>
                  <option value="FOOD_FEST">Food Fest</option>
                  <option value="TECH">Tech</option>
                  <option value="GAMING">Gaming</option>
                  <option value="CULTURAL">Cultural</option>
                  <option value="COLLEGE">College</option>
                  <option value="KIDS">Kids</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Language <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Languages className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="language"
                  required
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="" disabled>Select a language...</option>
                  <option value="TAMIL">Tamil</option>
                  <option value="ENGLISH">English</option>
                  <option value="HINDI">Hindi</option>
                  <option value="TELUGU">Telugu</option>
                  <option value="MALAYALAM">Malayalam</option>
                  <option value="KANNADA">Kannada</option>
                  <option value="MULTI_LANGUAGE">Multi Language</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Duration (Minutes) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hourglass className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., 180"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Minimum Age <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="minimumAge"
                  required
                  min="0"
                  value={formData.minimumAge}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., 12"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Organizer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mic2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="organizer"
                  required
                  value={formData.organizer}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., Vels Entertainment / INOX Live"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Full Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 pointer-events-none">
                  <AlignLeft className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Provide a thorough overview of performance schedule, entry rules, and event highlights..."
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 3: Date & Location */}
        <motion.section
          
          className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden"
        >
          <div className="bg-gray-50/60 px-8 py-5 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              3. Scheduling & Venue
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify the date, call time, city, and physical venue address.
            </p>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Event Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CalendarDays className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                City / Region <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., Chennai"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., Jawaharlal Nehru Stadium"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Actions */}
        <motion.div
         
          className="flex items-center justify-end gap-4 pt-4"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Draft...</span>
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>Create Event (Draft)</span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default CreateEvent;