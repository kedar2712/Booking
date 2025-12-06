import { GoogleGenAI } from "@google/genai";
import { Booking } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askBookingAssistant = async (question: string, bookings: Booking[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    // We pass the current database state as context to the model
    // This allows RAG-like behavior without a vector database for small datasets
    const dataContext = JSON.stringify(bookings.map(b => ({
      client: b.clientName,
      dest: b.destination,
      dates: `${b.checkIn} to ${b.checkOut}`,
      status: b.status,
      phone: b.phone,
      finance: {
        total: b.totalAmount,
        balance: b.totalAmount - (b.amountHeightSight + b.amountPrakruti + b.amountCash)
      }
    })));

    const systemPrompt = `
      You are an intelligent assistant for "Height and Sight Holidays".
      You have access to the current booking database provided below in JSON format.
      
      Rules:
      1. Answer the user's question based strictly on the provided data.
      2. If asking about dates, assume today is ${new Date().toDateString()}.
      3. Be concise and professional.
      4. If the user asks about financial totals, calculate them from the data.
      
      Booking Data:
      ${dataContext}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't generate a response based on the data.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error analyzing your bookings.";
  }
};
