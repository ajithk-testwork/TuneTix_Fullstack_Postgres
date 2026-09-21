import { Request, Response } from "express";
import prisma from "../config/prisma";
import { getIO } from "../socket";

const generateTicketNumber = async (): Promise<string> => {
  const bookingCount = await prisma.booking.count();

  const year = new Date().getFullYear();

  return `EVT-${year}-${String(bookingCount + 1).padStart(6, "0")}`;
};

export const createBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const { eventId, seatIds } = req.body;



    if (!eventId || !Array.isArray(seatIds) || seatIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Event and Seats are required",
      });
      return;
    }

    // Prevent duplicate seat IDs
    const uniqueSeatIds = [...new Set(seatIds)];

    if (uniqueSeatIds.length !== seatIds.length) {
      res.status(400).json({
        success: false,
        message: "Duplicate seats are not allowed",
      });
      return;
    }



    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }


    const seats = await prisma.seat.findMany({
      where: {
        id: {
          in: uniqueSeatIds,
        },
      },
      include: {
        category: true,
      },
    });

    if (seats.length !== uniqueSeatIds.length) {
      res.status(400).json({
        success: false,
        message: "Some seats not found",
      });
      return;
    }


    await prisma.seat.updateMany({
      where: {
        id: {
          in: uniqueSeatIds,
        },
        isLocked: true,
        isBooked: false,
        lockedUntil: {
          lt: new Date(),
        },
      },
      data: {
        isLocked: false,
        lockedUntil: null,
      },
    });


    let totalAmount = 0;

    seats.forEach((seat) => {
      totalAmount += seat.category.price;
    });


    const booking = await prisma.$transaction(
      async (tx) => {
        const now = new Date();

        const lockUntil = new Date(now.getTime() + 10 * 60 * 1000);

    

        const lockedSeats = await tx.seat.updateMany({
          where: {
            id: {
              in: uniqueSeatIds,
            },

            isBooked: false,

            OR: [
              {
                isLocked: false,
              },
              {
                isLocked: true,
                lockedUntil: {
                  lte: now,
                },
              },
            ],
          },

          data: {
            isLocked: true,
            lockedUntil: lockUntil,
          },
        });


        if (lockedSeats.count !== uniqueSeatIds.length) {
          throw new Error("One or more selected seats are no longer available");
        }

    

        const ticketNumber = await generateTicketNumber();

   
        const newBooking = await tx.booking.create({
          data: {
            userId,
            eventId,
            totalAmount,

            bookingStatus: "PENDING",

            paymentStatus: "PENDING",

            ticketNumber,
          },
        });

       
        await tx.bookingSeat.createMany({
          data: uniqueSeatIds.map((seatId: string) => ({
            bookingId: newBooking.id,
            seatId,
          })),
        });

        return {
          booking: newBooking,
          lockUntil,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

   

    res.status(201).json({
      success: true,

      message: "Seats locked successfully for 10 minutes",

      bookingId: booking.booking.id,

      ticketNumber: booking.booking.ticketNumber,

      totalAmount,

      lockedUntil: booking.lockUntil,
    });
  } catch (error: any) {
    console.error("Create Booking Error:", error);

    // Seat became unavailable
    if (
      error.message === "One or more selected seats are no longer available"
    ) {
      res.status(409).json({
        success: false,
        message:
          "One or more selected seats are no longer available. Please select different seats.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
    });
  }
};

export const getMyBookings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        userId,
      },

      include: {
        event: true,

        seats: {
          include: {
            seat: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookingId = Array.isArray(req.params.bookingId)
      ? req.params.bookingId[0]
      : req.params.bookingId;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });

      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },

      include: {
        user: true,

        event: true,

        seats: {
          include: {
            seat: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookingId = Array.isArray(req.params.bookingId)
      ? req.params.bookingId[0]
      : req.params.bookingId;

    if (!bookingId) {
      res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });

      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },

      include: {
        seats: true,
      },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });

      return;
    }

    if (booking.bookingStatus === "CANCELLED") {
      res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });

      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: {
          id: bookingId,
        },

        data: {
          bookingStatus: "CANCELLED",
        },
      });

      await tx.seat.updateMany({
        where: {
          id: {
            in: booking.seats.map((seat) => seat.seatId),
          },
        },

        data: {
          isBooked: false,
          isLocked: false,
          lockedUntil: null,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkInTicket = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ticketNumber } = req.body;

    if (!ticketNumber) {
      res.status(400).json({
        success: false,
        message: "Ticket number is required",
      });

      return;
    }

    const booking = await prisma.booking.findUnique({
      where: {
        ticketNumber,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },

        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            venue: true,
            location: true,
          },
        },

        seats: {
          include: {
            seat: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Invalid ticket",
      });

      return;
    }

    if (booking.paymentStatus !== "SUCCESS") {
      res.status(400).json({
        success: false,
        message: "Payment is not completed for this ticket",
      });

      return;
    }

    if (booking.bookingStatus !== "CONFIRMED") {
      res.status(400).json({
        success: false,
        message: "This booking is not confirmed",
      });

      return;
    }

    // Prevent duplicate entry

    if (booking.checkedIn) {
      res.status(409).json({
        success: false,
        message: "This ticket has already been checked in",
        data: {
          ticketNumber: booking.ticketNumber,

          checkedInAt: booking.checkedInAt,

          user: booking.user,

          event: booking.event,
        },
      });

      return;
    }

    const adminId = (req as any).user?.id;

    // Update attendance

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },

      data: {
        checkedIn: true,

        checkedInAt: new Date(),

        checkedInBy: adminId || null,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },

        event: {
          select: {
            id: true,
            title: true,
            date: true,
            time: true,
            venue: true,
            location: true,
          },
        },

        seats: {
          include: {
            seat: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    //Socket.IO LIVE UPDATE

    const io = getIO();

    io.to(`event:${updatedBooking.event.id}`).emit("attendance:updated", {
      eventId: updatedBooking.event.id,

      bookingId: updatedBooking.id,

      ticketNumber: updatedBooking.ticketNumber,

      checkedIn: true,

      checkedInAt: updatedBooking.checkedInAt,

      attendee: {
        id: updatedBooking.user.id,

        name: updatedBooking.user.name,

        email: updatedBooking.user.email,

        phoneNumber: updatedBooking.user.phoneNumber,
      },

      seats: updatedBooking.seats.map((item) => ({
        seatCode: item.seat.seatCode,

        category: item.seat.category.name,
      })),
    });

    res.status(200).json({
      success: true,

      message: "Ticket checked in successfully",

      data: {
        bookingId: updatedBooking.id,

        ticketNumber: updatedBooking.ticketNumber,

        checkedIn: updatedBooking.checkedIn,

        checkedInAt: updatedBooking.checkedInAt,

        user: updatedBooking.user,

        event: updatedBooking.event,

        seats: updatedBooking.seats.map((item) => ({
          seatCode: item.seat.seatCode,

          category: item.seat.category.name,
        })),
      },
    });
  } catch (error: any) {
    console.error("Check In Ticket Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to check in ticket",
    });
  }
};
