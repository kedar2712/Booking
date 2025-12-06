import { jsPDF } from "jspdf";
import { Booking } from "../types";

export const generateVoucher = (booking: Booking) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Helper to center text
  const centerText = (text: string, y: number) => {
    const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Header
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  centerText("Height & Sight Holidays", 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  centerText("Booking Confirmation Voucher", 30);

  // Reset text color
  doc.setTextColor(60, 60, 60);

  // Booking Info Section
  let y = 60;
  
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text("BOOKING REFERENCE", 20, y);
  doc.text("DATE", pageWidth - 60, y);
  
  y += 7;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`#${booking.id.slice(-6).toUpperCase()}`, 20, y);
  doc.text(new Date().toLocaleDateString(), pageWidth - 60, y);

  // Client Details
  y += 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y - 5, pageWidth - 20, y - 5);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Guest Details", 20, y + 5);
  
  y += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${booking.clientName}`, 20, y);
  doc.text(`Phone: ${booking.phone}`, 20, y + 8);
  doc.text(`Guests: ${booking.guests} (${booking.rooms} Rooms)`, 20, y + 16);

  // Travel Details
  doc.text(`Destination: ${booking.destination}`, 120, y);
  doc.text(`Check-in: ${booking.checkIn}`, 120, y + 8);
  doc.text(`Check-out: ${booking.checkOut}`, 120, y + 16);

  // Hotel Info Box
  y += 35;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.rect(20, y, pageWidth - 40, 40, 'FD');
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Accommodation & Transport", 30, y + 10);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Hotel: ${booking.hotelName || 'N/A'}`, 30, y + 20);
  doc.text(`Room Category: ${booking.roomCategory || 'Standard'}`, 30, y + 28);
  
  if (booking.carName) {
    doc.text(`Transport: ${booking.carName} (${booking.carOperator || 'Standard'})`, 120, y + 20);
  }

  // Payment Status (Optional based on balance)
  y += 55;
  const balance = (booking.totalAmount || 0) - ((booking.amountHeightSight || 0) + (booking.amountPrakruti || 0) + (booking.amountCash || 0));
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status", 20, y);
  
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  if (balance <= 0) {
      doc.setTextColor(0, 150, 0);
      doc.text("PAID IN FULL", 20, y);
  } else {
      doc.setTextColor(200, 0, 0);
      doc.text(`Payment Due at Check-in: Rs. ${balance.toLocaleString('en-IN')}`, 20, y);
  }

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  centerText("Thank you for choosing Height & Sight Holidays", 270);
  centerText("This is a computer generated voucher.", 275);

  doc.save(`Voucher_${booking.clientName.replace(/\s+/g, '_')}.pdf`);
};