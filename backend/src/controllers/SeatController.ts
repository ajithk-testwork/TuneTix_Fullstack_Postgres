import { Request, Response } from "express";
import prisma from "../config/prisma";

const getParamString = (
  value: string | string[] | undefined,
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

export const releaseExpiredSeats = async () => {
  try {
    const result = await prisma.seat.updateMany({
      where: {
        isLocked: true,
        lockedUntil: {
          lt: new Date(),
        },
        isBooked: false,
      },
      data: {
        isLocked: false,
        lockedUntil: null,
      },
    });

    if (result.count > 0) {
      console.log(`🔓 Released ${result.count} expired seat(s)`);
    }
  } catch (error) {
    console.error("Expired seat cleanup error:", error);
  }
};

export const generateSeats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryId = getParamString(req.params.categoryId);

    if (!categoryId) {
      res.status(400).json({
        success: false,
        message: "Category ID is required",
      });

      return;
    }

    const category = await prisma.seatCategory.findUnique({
      where: {
        id: categoryId,
      },

      include: {
        seats: true,
      },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Seat Category not found",
      });

      return;
    }

    // Prevent duplicate generation
    if (category.seats.length > 0) {
      res.status(400).json({
        success: false,
        message: "Seats already generated",
      });

      return;
    }

    const seats = [];

    for (let i = 1; i <= category.totalSeats; i++) {
      seats.push({
        eventId: category.eventId,
        categoryId: category.id,
        row: category.rowLetter,
        number: i,
        seatCode: `${category.rowLetter}${i}`,
      });
    }

    await prisma.seat.createMany({
      data: seats,
    });

    res.status(201).json({
      success: true,
      message: `${seats.length} seats generated successfully`,
      data: seats,
    });

    return;
  } catch (error: any) {
    console.error("Generate Seats Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

    return;
  }
};

export const getSeatLayout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await releaseExpiredSeats();
    const eventId = getParamString(req.params.eventId);

    if (!eventId) {
      res.status(400).json({
        success: false,
        message: "Event ID is required",
      });

      return;
    }

    const categories = await prisma.seatCategory.findMany({
      where: {
        eventId,
      },

      include: {
        seats: {
          orderBy: {
            number: "asc",
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });

    return;
  } catch (error: any) {
    console.error("Get Seat Layout Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

    return;
  }
};
