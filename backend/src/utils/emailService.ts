import crypto from "crypto";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/* =========================================================
   BREVO SENDER
========================================================= */

const sender = {
  name: process.env.BREVO_SENDER_NAME || "TuneTix",
  email: process.env.BREVO_SENDER_EMAIL!,
};

/* =========================================================
   COMMON EMAIL SENDER
========================================================= */

const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
): Promise<void> => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing in .env");
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_SENDER_EMAIL is missing in .env");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",

    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },

    body: JSON.stringify({
      sender,

      to: [
        {
          email: to,
        },
      ],

      subject,

      htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Brevo Email Error:", errorText);

    throw new Error("Failed to send email");
  }

  console.log(`Email sent successfully to ${to}`);
};

/* =========================================================
   GENERATE OTP
========================================================= */

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/* =========================================================
   HASH OTP
========================================================= */

export const hashOtp = (otp: string): string => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/* =========================================================
   OTP EMAIL
   REGISTER + FORGOT PASSWORD
========================================================= */

export const sendOtpEmail = async (
  name: string,
  email: string,
  otp: string,
  purpose: "REGISTER" | "FORGOT_PASSWORD",
): Promise<void> => {
  const isRegistration = purpose === "REGISTER";

  const subject = isRegistration
    ? "Verify Your TuneTix Account 🎟️"
    : "Reset Your TuneTix Password 🔐";

  const title = isRegistration ? "Verify Your Email" : "Reset Your Password";

  const message = isRegistration
    ? "Use the verification code below to verify your TuneTix account."
    : "Use the password reset code below to reset your TuneTix password.";

  const codeLabel = isRegistration
    ? "Email Verification Code"
    : "Password Reset Code";

  const htmlContent = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${title}</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F8F9FC;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <!-- Main Container -->

  <div
    style="
      width:100%;
      padding:40px 15px;
      box-sizing:border-box;
      background:#F8F9FC;
    "
  >

    <div
      style="
        max-width:600px;
        margin:0 auto;
        background:#FFFFFF;
        border-radius:18px;
        overflow:hidden;
        border:1px solid #EAECF0;
        box-shadow:0 5px 25px rgba(0,0,0,0.06);
      "
    >

      <!-- =================================================
           HEADER
      ================================================== -->

      <div
        style="
          background:#6C5CE7;
          padding:32px 25px;
          text-align:center;
        "
      >

        <h1
          style="
            margin:0;
            color:#FFFFFF;
            font-size:30px;
            font-weight:700;
          "
        >
          TuneTix
        </h1>

        <p
          style="
            margin:8px 0 0;
            color:#EDE9FE;
            font-size:14px;
          "
        >
          Your Events. Your Seats. Your Experience.
        </p>

      </div>


      <!-- =================================================
           CONTENT
      ================================================== -->

      <div
        style="
          padding:35px;
        "
      >

        <h2
          style="
            margin:0 0 18px;
            color:#172033;
            font-size:23px;
          "
        >
          Hi ${name},
        </h2>


        <!-- Title -->

        <h3
          style="
            margin:0 0 12px;
            color:#6C5CE7;
            font-size:20px;
          "
        >
          ${title}
        </h3>


        <!-- Message -->

        <p
          style="
            margin:0;
            color:#667085;
            font-size:15px;
            line-height:1.7;
          "
        >
          ${message}
        </p>


        <!-- =================================================
             OTP BOX
        ================================================== -->

        <div
          style="
            margin:30px 0;
            padding:28px 20px;
            background:#F4F1FF;
            border:1px solid #E9E3FF;
            border-radius:16px;
            text-align:center;
          "
        >

          <p
            style="
              margin:0 0 14px;
              color:#667085;
              font-size:13px;
              font-weight:600;
            "
          >
            ${codeLabel}
          </p>


          <div
            style="
              color:#6C5CE7;
              font-size:36px;
              line-height:1.2;
              font-weight:700;
              letter-spacing:9px;
            "
          >
            ${otp}
          </div>

        </div>


        <!-- Expiry -->

        <p
          style="
            margin:0 0 12px;
            color:#667085;
            font-size:14px;
            line-height:1.6;
          "
        >
          This code is valid for
          <strong style="color:#172033;">
            10 minutes
          </strong>.
        </p>


        <!-- Security -->

        <p
          style="
            margin:0;
            color:#667085;
            font-size:14px;
            line-height:1.6;
          "
        >
          For your security, never share this code with anyone.
        </p>


        <p
          style="
            margin:14px 0 0;
            color:#667085;
            font-size:14px;
            line-height:1.6;
          "
        >
          If you did not request this code, you can safely ignore
          this email.
        </p>


        <!-- =================================================
             FOOTER
        ================================================== -->

        <div
          style="
            margin-top:32px;
            padding-top:20px;
            border-top:1px solid #EAECF0;
            text-align:center;
          "
        >

          <p
            style="
              margin:0;
              color:#98A2B3;
              font-size:12px;
            "
          >
            © ${new Date().getFullYear()} TuneTix
          </p>

          <p
            style="
              margin:7px 0 0;
              color:#98A2B3;
              font-size:12px;
            "
          >
            This is an automated email. Please do not reply.
          </p>

        </div>

      </div>

    </div>

  </div>

</body>

</html>
`;

  await sendEmail(email, subject, htmlContent);
};

/* =========================================================
   WELCOME EMAIL
   SENT AFTER EMAIL VERIFICATION
========================================================= */

export const sendWelcomeEmail = async (
  name: string,
  email: string,
): Promise<void> => {
  const htmlContent = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Welcome to TuneTix</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F8F9FC;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      width:100%;
      padding:40px 15px;
      box-sizing:border-box;
      background:#F8F9FC;
    "
  >

    <div
      style="
        max-width:600px;
        margin:0 auto;
        background:#FFFFFF;
        border-radius:18px;
        overflow:hidden;
        border:1px solid #EAECF0;
        box-shadow:0 5px 25px rgba(0,0,0,0.06);
      "
    >

      <!-- =================================================
           HEADER
      ================================================== -->

      <div
        style="
          background:#6C5CE7;
          padding:32px 25px;
          text-align:center;
        "
      >

        <h1
          style="
            margin:0;
            color:#FFFFFF;
            font-size:30px;
            font-weight:700;
          "
        >
          TuneTix
        </h1>

        <p
          style="
            margin:8px 0 0;
            color:#EDE9FE;
            font-size:14px;
          "
        >
          Your Events. Your Seats. Your Experience.
        </p>

      </div>


      <!-- =================================================
           CONTENT
      ================================================== -->

      <div
        style="
          padding:35px;
        "
      >

        <div
          style="
            text-align:center;
            margin-bottom:25px;
          "
        >

          <div
            style="
              width:60px;
              height:60px;
              margin:0 auto 18px;
              background:#F4F1FF;
              border-radius:18px;
              line-height:60px;
              font-size:28px;
            "
          >
            ✓
          </div>

          <h2
            style="
              margin:0;
              color:#172033;
              font-size:24px;
            "
          >
            Welcome to TuneTix, ${name}! 🎉
          </h2>

        </div>


        <p
          style="
            margin:0;
            color:#667085;
            font-size:15px;
            line-height:1.7;
          "
        >
          Your email address has been successfully verified.
          Your TuneTix account is now ready to use.
        </p>


        <!-- Success Box -->

        <div
          style="
            margin:30px 0;
            padding:25px;
            background:#F4F1FF;
            border:1px solid #E9E3FF;
            border-radius:16px;
            text-align:center;
          "
        >

          <h3
            style="
              margin:0 0 10px;
              color:#6C5CE7;
              font-size:19px;
            "
          >
            You're all set! 🎟️
          </h3>

          <p
            style="
              margin:0;
              color:#667085;
              font-size:14px;
              line-height:1.7;
            "
          >
            Discover amazing events, choose your seats,
            and book unforgettable experiences.
          </p>

        </div>


        <p
          style="
            margin:0;
            color:#667085;
            font-size:14px;
            line-height:1.7;
          "
        >
          Thank you for joining TuneTix.
          We look forward to seeing you at your next event!
        </p>


        <!-- Footer -->

        <div
          style="
            margin-top:32px;
            padding-top:20px;
            border-top:1px solid #EAECF0;
            text-align:center;
          "
        >

          <p
            style="
              margin:0;
              color:#98A2B3;
              font-size:12px;
            "
          >
            © ${new Date().getFullYear()} TuneTix
          </p>

          <p
            style="
              margin:7px 0 0;
              color:#98A2B3;
              font-size:12px;
            "
          >
            This is an automated email. Please do not reply.
          </p>

        </div>

      </div>

    </div>

  </div>

</body>

</html>
`;

  await sendEmail(email, "Welcome to TuneTix! 🎉", htmlContent);
};

/* =========================================================
   BOOKING CONFIRMATION EMAIL
   SENT AFTER SUCCESSFUL STRIPE PAYMENT
========================================================= */

interface BookingConfirmationEmailData {
  name: string;
  email: string;

  eventTitle: string;
  eventDate: string;
  eventTime: string;

  venue: string;
  location: string;

  ticketNumber: string;
  seats: {
    category: string;
    seatCode: string;
  }[];

  totalAmount: number;

  qrCode: string;

  eventImage?: string | undefined;
}

export const sendBookingConfirmationEmail = async (
  data: BookingConfirmationEmailData, bookingId: string
): Promise<void> => {
  const {
    name,
    email,
    eventTitle,
    eventDate,
    eventTime,
    venue,
    location,
    ticketNumber,
    seats,
    totalAmount,
    qrCode,
    eventImage,
  } = data;

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(totalAmount);

  const seatList =
    seats.length > 0
      ? seats
          .map((seat) => `${seat.category} — Seat ${seat.seatCode}`)
          .join("<br />")
      : "Seat information unavailable";

const eventImageSection = eventImage
  ? `
    <div style="
      width:100%;
      margin:0 0 25px 0;
      text-align:center;
    ">
      <img
        src="${eventImage}"
        alt="${eventTitle}"
        width="550"
        style="
          display:block;
          width:100%;
          max-width:550px;
          height:auto;
          max-height:300px;
          object-fit:cover;
          border:0;
          border-radius:16px;
          margin:0 auto;
        "
      />
    </div>
  `
  : "";

  const htmlContent = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Booking Confirmed - TuneTix</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F8F9FC;
    font-family:Arial,Helvetica,sans-serif;
    color:#172033;
  "
>

  <!-- =====================================================
       OUTER CONTAINER
  ====================================================== -->

  <div
    style="
      width:100%;
      padding:40px 15px;
      box-sizing:border-box;
      background:#F8F9FC;
    "
  >

    <!-- =====================================================
         EMAIL CARD
    ====================================================== -->

    <div
      style="
        max-width:620px;
        margin:0 auto;
        background:#FFFFFF;
        border-radius:20px;
        overflow:hidden;
        border:1px solid #EAECF0;
        box-shadow:0 8px 30px rgba(0,0,0,0.06);
      "
    >

      <!-- =================================================
           HEADER
      ================================================== -->

      <div
        style="
          background:#6C5CE7;
          padding:32px 25px;
          text-align:center;
        "
      >

        <h1
          style="
            margin:0;
            color:#FFFFFF;
            font-size:30px;
            font-weight:700;
          "
        >
          TuneTix
        </h1>

        <p
          style="
            margin:8px 0 0;
            color:#EDE9FE;
            font-size:14px;
          "
        >
          Your Events. Your Seats. Your Experience.
        </p>

      </div>


      <!-- =================================================
           SUCCESS BANNER
      ================================================== -->

      <div
        style="
          padding:30px 35px 10px;
          text-align:center;
        "
      >

        <div
          style="
            width:64px;
            height:64px;
            margin:0 auto 15px;
            background:#ECFDF3;
            border-radius:50%;
            line-height:64px;
            font-size:30px;
            color:#12B76A;
          "
        >
          ✓
        </div>

        <h2
          style="
            margin:0;
            color:#172033;
            font-size:25px;
          "
        >
          Booking Confirmed! 🎉
        </h2>

        <p
          style="
            margin:10px 0 0;
            color:#667085;
            font-size:14px;
            line-height:1.6;
          "
        >
          Your payment was successful and your tickets are confirmed.
        </p>

      </div>


      <!-- =================================================
           MAIN CONTENT
      ================================================== -->

      <div
        style="
          padding:25px 35px 35px;
        "
      >

        <h3
          style="
            margin:0 0 10px;
            color:#172033;
            font-size:20px;
          "
        >
          Hi ${name},
        </h3>

        <p
          style="
            margin:0 0 25px;
            color:#667085;
            font-size:15px;
            line-height:1.7;
          "
        >
          Thank you for booking with TuneTix.
          Your event tickets are ready. Please keep this email
          handy for entry at the venue.
        </p>


        <!-- =================================================
             EVENT IMAGE
        ================================================== -->

        ${eventImageSection}


        <!-- =================================================
             EVENT CARD
        ================================================== -->

        <div
          style="
            background:#F4F1FF;
            border:1px solid #E9E3FF;
            border-radius:16px;
            padding:24px;
            margin-bottom:22px;
          "
        >

          <p
            style="
              margin:0 0 8px;
              color:#6C5CE7;
              font-size:12px;
              font-weight:700;
              text-transform:uppercase;
              letter-spacing:1px;
            "
          >
            Event
          </p>

          <h2
            style="
              margin:0 0 20px;
              color:#172033;
              font-size:22px;
              line-height:1.4;
            "
          >
            ${eventTitle}
          </h2>


          <!-- DATE -->

          <div
            style="
              margin-bottom:14px;
            "
          >

            <span
              style="
                color:#667085;
                font-size:13px;
              "
            >
              Date
            </span>

            <br />

            <strong
              style="
                color:#172033;
                font-size:15px;
              "
            >
              ${eventDate}
            </strong>

          </div>


          <!-- TIME -->

          <div
            style="
              margin-bottom:14px;
            "
          >

            <span
              style="
                color:#667085;
                font-size:13px;
              "
            >
              Time
            </span>

            <br />

            <strong
              style="
                color:#172033;
                font-size:15px;
              "
            >
              ${eventTime}
            </strong>

          </div>


          <!-- VENUE -->

          <div
            style="
              margin-bottom:14px;
            "
          >

            <span
              style="
                color:#667085;
                font-size:13px;
              "
            >
              Venue
            </span>

            <br />

            <strong
              style="
                color:#172033;
                font-size:15px;
              "
            >
              ${venue}
            </strong>

          </div>


          <!-- LOCATION -->

          <div>

            <span
              style="
                color:#667085;
                font-size:13px;
              "
            >
              Location
            </span>

            <br />

            <strong
              style="
                color:#172033;
                font-size:15px;
              "
            >
              ${location}
            </strong>

          </div>

        </div>


        <!-- =================================================
             TICKET DETAILS
        ================================================== -->

        <div
          style="
            border:1px solid #EAECF0;
            border-radius:16px;
            overflow:hidden;
            margin-bottom:22px;
          "
        >

          <div
            style="
              background:#172033;
              padding:16px 20px;
            "
          >

            <h3
              style="
                margin:0;
                color:#FFFFFF;
                font-size:16px;
              "
            >
              Ticket Details
            </h3>

          </div>


          <div
            style="
              padding:20px;
            "
          >

            <!-- TICKET NUMBER -->

            <div
              style="
                padding-bottom:16px;
                margin-bottom:16px;
                border-bottom:1px solid #EAECF0;
              "
            >

              <span
                style="
                  color:#667085;
                  font-size:13px;
                "
              >
                Ticket Number
              </span>

              <br />

              <strong
                style="
                  color:#6C5CE7;
                  font-size:16px;
                  letter-spacing:0.5px;
                "
              >
                ${ticketNumber}
              </strong>

            </div>


            <!-- SEATS -->

            <div
              style="
                padding-bottom:16px;
                margin-bottom:16px;
                border-bottom:1px solid #EAECF0;
              "
            >

              <span
                style="
                  color:#667085;
                  font-size:13px;
                "
              >
                Selected Seats
              </span>

              <br />
<!-- SELECTED TICKETS -->

<div
  style="
    padding-bottom:16px;
    margin-bottom:16px;
    border-bottom:1px solid #EAECF0;
  "
>

  <span
    style="
      color:#667085;
      font-size:13px;
    "
  >
    Selected Tickets
  </span>

  <div
    style="
      margin-top:10px;
      color:#172033;
      font-size:14px;
      line-height:1.9;
    "
  >
    ${seatList}
  </div>

</div>

            </div>


            <!-- TOTAL -->

            <div>

              <span
                style="
                  color:#667085;
                  font-size:13px;
                "
              >
                Total Paid
              </span>

              <br />

              <strong
                style="
                  color:#12B76A;
                  font-size:20px;
                "
              >
                ${formattedAmount}
              </strong>

            </div>

          </div>

        </div>


        <!-- =================================================
             QR CODE
        ================================================== -->

        <div
          style="
            background:#FFFFFF;
            border:2px dashed #D9D6FE;
            border-radius:18px;
            padding:25px 20px;
            text-align:center;
            margin-bottom:22px;
          "
        >

          <h3
            style="
              margin:0 0 8px;
              color:#172033;
              font-size:19px;
            "
          >
            Your Entry QR Code 🎟️
          </h3>

          <p
            style="
              margin:0 0 20px;
              color:#667085;
              font-size:13px;
              line-height:1.6;
            "
          >
            Show this QR code at the venue entrance
            for ticket verification.
          </p>


          <!-- QR IMAGE -->

          <div
            style="
              display:inline-block;
              padding:12px;
              background:#FFFFFF;
              border:1px solid #EAECF0;
              border-radius:14px;
            "
          >

            <img
              src="${qrCode}"
              alt="TuneTix Ticket QR Code"
              width="220"
              height="220"
              style="
                display:block;
                width:220px;
                height:220px;
                object-fit:contain;
              "
            />

          </div>


          <p
            style="
              margin:18px 0 0;
              color:#98A2B3;
              font-size:12px;
              line-height:1.5;
            "
          >
            Please do not crop, edit, or share this QR code.
          </p>

        </div>


        <!-- =================================================
             IMPORTANT INFORMATION
        ================================================== -->

        <div
          style="
            background:#FFFAEB;
            border:1px solid #FDE68A;
            border-radius:14px;
            padding:18px;
            margin-bottom:25px;
          "
        >

          <p
            style="
              margin:0 0 7px;
              color:#92400E;
              font-size:14px;
              font-weight:700;
            "
          >
            Important
          </p>

          <p
            style="
              margin:0;
              color:#92400E;
              font-size:13px;
              line-height:1.6;
            "
          >
            Please carry this ticket email with you.
            Your QR code will be scanned at the venue entrance.
          </p>

        </div>


        <!-- =================================================
             CALL TO ACTION
        ================================================== -->

        <div
          style="
            text-align:center;
            margin:25px 0;
          "
        >

          <a
           href="https://tune-tix-fullstack-postgres-kszh.vercel.app/ticket/${bookingId}"
            style="
              display:inline-block;
              background:#6C5CE7;
              color:#FFFFFF;
              text-decoration:none;
              padding:14px 28px;
              border-radius:12px;
              font-size:14px;
              font-weight:700;
            "
          >
            View My Booking
          </a>

        </div>


        <!-- =================================================
             FOOTER
        ================================================== -->

        <div
          style="
            margin-top:30px;
            padding-top:20px;
            border-top:1px solid #EAECF0;
            text-align:center;
          "
        >

          <p
            style="
              margin:0;
              color:#98A2B3;
              font-size:12px;
            "
          >
            © ${new Date().getFullYear()} TuneTix
          </p>

          <p
            style="
              margin:7px 0 0;
              color:#98A2B3;
              font-size:12px;
              line-height:1.5;
            "
          >
            This is an automated email. Please do not reply.
          </p>

        </div>

      </div>

    </div>

  </div>

</body>

</html>
`;

  await sendEmail(email, `Booking Confirmed - ${eventTitle} 🎟️`, htmlContent);
};
