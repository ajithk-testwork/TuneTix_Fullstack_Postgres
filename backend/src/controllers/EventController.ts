import { Request, Response } from "express";
import prisma from "../config/prisma";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

const getParamString = (
  value: string | string[] | undefined,
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};


const uploadToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "TuneTix/events",
      },
      (error, result) => {
        if (error) {
          console.log("Cloudinary Error:", error);
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Upload Failed"));
        }

        resolve(result.secure_url);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

//Create Event
export const createEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      language,
      duration,
      minimumAge,
      location,
      venue,
      organizer,
      date,
      time,
      SeatCategory,
      totalTickets,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !category ||
      !language ||
      !duration ||
      !location ||
      !venue ||
      !date ||
      !time ||
      !SeatCategory ||
      !totalTickets
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    const ping = await cloudinary.api.ping();
    console.log(ping);
    console.log("========== BODY ==========");
    console.log(req.body);

    console.log("========== FILE ==========");
    console.log(req.file);

    console.log("========== USER ==========");
    console.log((req as any).user);

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Event image is required",
      });
      return;
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    console.log(imageUrl);

    // Logged in Admin
    const userId = (req as any).user.id;

    // Create Event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        language,
        duration: parseInt(req.body.duration),
        minimumAge: parseInt(req.body.minimumAge),
        location,
        venue,
        organizer,
        date: new Date(req.body.date),
        time,
        image: imageUrl,
        totalTickets: parseInt(req.body.totalTickets),
        availableTickets: parseInt(req.body.totalTickets),
        status: "UPCOMING",
        isPublished: false,
        createdById: userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error: any) {
    console.error("Create Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event
export const updateEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamString(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });

      return;
    }

    const {
      title,
      description,
      category,
      language,
      duration,
      minimumAge,
      location,
      venue,
      organizer,
      date,
      time,
      totalTickets,
      isPublished,
      status,
    } = req.body;

    // Check event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    let imageUrl = existingEvent.image;

    // Upload new image (optional)
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title ?? existingEvent.title,
        description: description ?? existingEvent.description,

        category: category ?? existingEvent.category,
        language: language ?? existingEvent.language,

        duration: duration ? Number(duration) : existingEvent.duration,

        minimumAge: minimumAge ? Number(minimumAge) : existingEvent.minimumAge,

        location: location ?? existingEvent.location,
        venue: venue ?? existingEvent.venue,
        organizer: organizer ?? existingEvent.organizer,

        date: date ? new Date(date) : existingEvent.date,
        time: time ?? existingEvent.time,

        image: imageUrl,

        totalTickets: totalTickets
          ? Number(totalTickets)
          : existingEvent.totalTickets,

        isPublished:
          isPublished !== undefined
            ? isPublished === true || isPublished === "true"
            : existingEvent.isPublished,

        status: status ?? existingEvent.status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error("Update Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    res.status(200).json({
      success: true,
      totalEvents: events.length,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get All Events
export const getAllEvents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
      },

      orderBy: {
        date: "asc",
      },

      select: {
        id: true,
        title: true,
        description: true,

        category: true,
        language: true,

        duration: true,
        minimumAge: true,

        location: true,
        venue: true,
        organizer: true,

        date: true,
        time: true,

        image: true,

        seatCategories: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },

        totalTickets: true,
        availableTickets: true,

        status: true,
        isPublished: true,

        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      totalEvents: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error("Get All Events Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get Single Event
export const getSingleEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamString(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });

      return;
    }

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        description: true,

        category: true,
        language: true,

        duration: true,
        minimumAge: true,

        location: true,
        venue: true,
        organizer: true,

        date: true,
        time: true,

        image: true,

        seatCategories: {
          include: {
            seats: true,
          },
        },

        totalTickets: true,
        availableTickets: true,

        status: true,
        isPublished: true,

        createdAt: true,

        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Get SIngle Event Error", error);
  }
};

// Get Single Event Sales / Booking Details - Admin
export const getAdminEventDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamString(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
      return;
    }

    // Get event
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        language: true,
        duration: true,
        minimumAge: true,
        location: true,
        venue: true,
        organizer: true,
        date: true,
        time: true,
        image: true,
        totalTickets: true,
        availableTickets: true,
        status: true,
        isPublished: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        seatCategories: {
          select: {
            id: true,
            name: true,
            price: true,
            totalSeats: true,
            color: true,

            seats: {
              select: {
                id: true,
                seatCode: true,
                isBooked: true,
                isLocked: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    // Get all bookings for this event
    const bookings = await prisma.booking.findMany({
      where: {
        eventId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        ticketNumber: true,
        totalAmount: true,
        bookingStatus: true,
        paymentStatus: true,
        checkedIn: true,
        checkedInAt: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },

        seats: {
          select: {
            seat: {
              select: {
                id: true,
                seatCode: true,
                row: true,
                number: true,

                category: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Only successful + confirmed bookings count as sold
    const confirmedBookings = bookings.filter(
      (booking) =>
        booking.paymentStatus === "SUCCESS" &&
        booking.bookingStatus === "CONFIRMED",
    );

    // Number of sold seats
    const soldTickets = confirmedBookings.reduce(
      (total, booking) => total + booking.seats.length,
      0,
    );

    // Available tickets
    const availableTickets = Math.max(event.totalTickets - soldTickets, 0);

    // Revenue from successful bookings
    const revenue = confirmedBookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0,
    );

    // Category statistics
    const categoryStatistics = event.seatCategories.map((category) => {
      const soldSeats = category.seats.filter((seat) => seat.isBooked).length;

      const availableSeats = Math.max(category.totalSeats - soldSeats, 0);

      return {
        id: category.id,
        name: category.name,
        price: category.price,
        color: category.color,
        totalSeats: category.totalSeats,
        soldSeats,
        availableSeats,
        isSoldOut: availableSeats === 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Admin event details fetched successfully",

      data: {
        event: {
          ...event,

          // Override with calculated values
          availableTickets,
        },

        statistics: {
          totalTickets: event.totalTickets,
          soldTickets,
          availableTickets,
          bookingCount: confirmedBookings.length,
          totalBookings: bookings.length,
          revenue,
          isSoldOut: availableTickets === 0,
        },

        categoryStatistics,

        bookings: bookings.map((booking) => ({
          bookingId: booking.id,
          ticketNumber: booking.ticketNumber,

          user: booking.user,

          seats: booking.seats.map((item) => ({
            seatId: item.seat.id,
            seatCode: item.seat.seatCode,
            row: item.seat.row,
            number: item.seat.number,
            category: item.seat.category.name,
            categoryId: item.seat.category.id,
            categoryPrice: item.seat.category.price,
            categoryColor: item.seat.category.color,
          })),

          totalAmount: booking.totalAmount,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,

          checkedIn: booking.checkedIn,
          checkedInAt: booking.checkedInAt,

          createdAt: booking.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Get Admin Event Details Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch event details",
    });
  }
};

export const getAdminDashboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get all events managed by admin
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        image: true,
        totalTickets: true,
        availableTickets: true,
        date: true,
        status: true,
        isPublished: true,
        createdAt: true,
      },
    });

    // Get all bookings
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        ticketNumber: true,
        totalAmount: true,
        bookingStatus: true,
        paymentStatus: true,
        checkedIn: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        event: {
          select: {
            id: true,
            title: true,
          },
        },

        seats: {
          select: {
            seatId: true,
          },
        },
      },
    });

    // Only successful confirmed bookings
    const confirmedBookings = bookings.filter(
      (booking) =>
        booking.paymentStatus === "SUCCESS" &&
        booking.bookingStatus === "CONFIRMED",
    );

    // -----------------------------------
    // TOTAL EVENTS
    // -----------------------------------

    const totalEvents = events.length;

    // -----------------------------------
    // TOTAL TICKETS
    // -----------------------------------

    const totalTickets = events.reduce(
      (total, event) => total + event.totalTickets,
      0,
    );

    // -----------------------------------
    // TICKETS SOLD
    // -----------------------------------

    const ticketsSold = confirmedBookings.reduce(
      (total, booking) => total + booking.seats.length,
      0,
    );

    // -----------------------------------
    // AVAILABLE TICKETS
    // -----------------------------------

    const availableTickets = Math.max(totalTickets - ticketsSold, 0);

    // -----------------------------------
    // TOTAL BOOKINGS
    // -----------------------------------

    const totalBookings = confirmedBookings.length;

    // -----------------------------------
    // TOTAL REVENUE
    // -----------------------------------

    const totalRevenue = confirmedBookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0,
    );

    // -----------------------------------
    // CHECKED IN
    // -----------------------------------

    const totalCheckedIn = confirmedBookings.filter(
      (booking) => booking.checkedIn,
    ).length;

    // -----------------------------------
    // EVENT PERFORMANCE
    // -----------------------------------

    const eventPerformance = events.map((event) => {
      const eventBookings = confirmedBookings.filter(
        (booking) => booking.event.id === event.id,
      );

      const sold = eventBookings.reduce(
        (total, booking) => total + booking.seats.length,
        0,
      );

      const revenue = eventBookings.reduce(
        (total, booking) => total + booking.totalAmount,
        0,
      );

      const available = Math.max(event.totalTickets - sold, 0);

      const percentage =
        event.totalTickets > 0
          ? Math.round((sold / event.totalTickets) * 100)
          : 0;

      return {
        id: event.id,
        title: event.title,
        image: event.image,

        totalTickets: event.totalTickets,
        soldTickets: sold,
        availableTickets: available,

        bookingCount: eventBookings.length,

        revenue,

        soldPercentage: percentage,

        status:
          available === 0
            ? "SOLD_OUT"
            : percentage >= 80
              ? "SELLING_FAST"
              : "AVAILABLE",

        date: event.date,
        eventStatus: event.status,
        isPublished: event.isPublished,
      };
    });

    // -----------------------------------
    // ALMOST SOLD OUT
    // -----------------------------------

    const almostSoldOut = eventPerformance
      .filter(
        (event) => event.soldPercentage >= 80 && event.soldPercentage < 100,
      )
      .sort((a, b) => b.soldPercentage - a.soldPercentage);

    // -----------------------------------
    // RECENT BOOKINGS
    // -----------------------------------

    const recentBookings = bookings.slice(0, 10).map((booking) => ({
      id: booking.id,
      ticketNumber: booking.ticketNumber,

      customer: {
        name: booking.user.name,
        email: booking.user.email,
      },

      event: {
        id: booking.event.id,
        title: booking.event.title,
      },

      amount: booking.totalAmount,

      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,

      checkedIn: booking.checkedIn,

      date: booking.createdAt,
    }));

    // -----------------------------------
    // REVENUE BY MONTH
    // -----------------------------------

    const revenueByMonth = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      revenue: 0,
    }));

    confirmedBookings.forEach((booking) => {
      const month = new Date(booking.createdAt).getMonth();

      revenueByMonth[month].revenue += booking.totalAmount;
    });

    // -----------------------------------
    // BOOKINGS BY DAY
    // -----------------------------------

    const bookingsByDay = [
      { day: "Sun", bookings: 0 },
      { day: "Mon", bookings: 0 },
      { day: "Tue", bookings: 0 },
      { day: "Wed", bookings: 0 },
      { day: "Thu", bookings: 0 },
      { day: "Fri", bookings: 0 },
      { day: "Sat", bookings: 0 },
    ];

    confirmedBookings.forEach((booking) => {
      const day = new Date(booking.createdAt).getDay();

      bookingsByDay[day].bookings++;
    });

    // -----------------------------------
    // FINAL RESPONSE
    // -----------------------------------

    res.status(200).json({
      success: true,

      data: {
        summary: {
          totalEvents,

          totalTickets,

          ticketsSold,

          availableTickets,

          totalBookings,

          totalRevenue,

          totalCheckedIn,
        },

        eventPerformance,

        recentBookings,

        almostSoldOut,

        revenueByMonth,

        bookingsByDay,
      },
    });
  } catch (error: any) {
    console.error("Get Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to load admin dashboard",
    });
  }
};

// Delete Event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });

      return;
    }

    await prisma.$transaction(async (tx) => {
      // Delete booking-seat records
      await tx.bookingSeat.deleteMany({
        where: {
          booking: {
            eventId: id,
          },
        },
      });

      // Delete bookings
      await tx.booking.deleteMany({
        where: {
          eventId: id,
        },
      });

      // Delete seats
      await tx.seat.deleteMany({
        where: {
          eventId: id,
        },
      });

      // Delete seat categories
      await tx.seatCategory.deleteMany({
        where: {
          eventId: id,
        },
      });

      // Finally delete event
      await tx.event.delete({
        where: {
          id,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

// Publish Event
export const publishEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamString(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });

      return;
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (event.isPublished) {
      res.status(400).json({
        success: false,
        message: "Event is already published",
      });
      return;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        isPublished: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Event published successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error("Publish Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Unpublish Event
export const unpublishEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamString(req.params.id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });

      return;
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    if (!event.isPublished) {
      res.status(400).json({
        success: false,
        message: "Event is already unpublished",
      });
      return;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        isPublished: false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Event unpublished successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error("Unpublish Event Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
