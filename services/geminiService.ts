import { GoogleGenAI } from "@google/genai";
import { AppData, TransactionType } from "../types";

const getAIClient = () => {
  // Assuming API key is available via process.env.API_KEY as per instructions
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeInventory = async (data: AppData): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Prepare a summary context for the AI
    const lowStockItems = data.products.filter(p => p.currentStock <= p.minStock);
    const totalInventoryValue = data.products.reduce((sum, p) => sum + (p.currentStock * p.buyingPrice), 0);
    const recentSales = data.transactions
      .filter(t => t.type === TransactionType.OUTWARD)
      .slice(0, 20); // Last 20 sales for brevity

    const prompt = `
      Act as an expert Inventory Business Consultant. Analyze the following inventory data and provide a concise strategic summary (max 3 short paragraphs).
      
      Data Snapshot:
      - Total Inventory Value (Cost): $${totalInventoryValue.toFixed(2)}
      - Low Stock Alerts: ${lowStockItems.map(i => i.name).join(', ') || 'None'}
      - Recent Sales Transactions (Last 20): ${JSON.stringify(recentSales.map(t => ({ date: t.date.split('T')[0], items: t.items.length, total: t.totalAmount })))}
      
      Please provide:
      1. A quick health check of the inventory.
      2. Identify any potential sales trends based on the recent transaction frequency.
      3. Actionable advice for the business owner regarding restocking or pricing.
      
      Keep the tone professional yet encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error connecting to AI Analysis service. Please check your API Key configuration.";
  }
};