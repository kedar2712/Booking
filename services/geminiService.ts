
import { GoogleGenAI } from "@google/genai";
import { Booking } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askBookingAssistant = async (question: string, bookings: Booking[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    // SECURITY UPDATE: Sanitize data before sending to LLM.
    // Removed phone numbers and other potentially sensitive fields that aren't strictly necessary for general queries.
    const dataContext = JSON.stringify(bookings.map(b => ({
      id: b.id.slice(-4), // Minimal ID reference
      clientName: b.clientName,
      destination: b.destination,
      hotelName: b.hotelName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      rooms: b.rooms,
      status: b.status,
      // Only include financial summaries, not raw breakdown if not needed, 
      // but here we provide calculated balance for the AI to help with "how much is pending?"
      totalAmount: b.totalAmount,
      balance: (b.totalAmount || 0) - ((b.amountHeightSight || 0) + (b.amountPrakruti || 0) + (b.amountCash || 0))
    })));

    const prompt = `
      You are a helpful assistant for a travel agency owner. 
      Answer the user's question based ONLY on the following booking data.
      
      Data: ${dataContext}
      
      User Question: ${question}
      
      Keep answers concise and professional. If the answer isn't in the data, say so.
      For financial questions, calculate totals if needed.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("AI Error:", error);
    return "I'm having trouble connecting to the assistant right now. Please try again later.";
  }
};
