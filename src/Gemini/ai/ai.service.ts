import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  private model: {
    generateContent: (
      prompt: string,
    ) => Promise<{ response: { text: () => string } }>;
  };

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async classifyUrgency(
    description: string,
  ): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
    const prompt = `
      Classifique a urgência desse problema em: LOW, MEDIUM ou HIGH.
      Texto: "${description}"
      Responda apenas com uma das três palavras.
    `;

    const result = await this.model.generateContent(prompt);
    const urgency = result.response.text().trim().toUpperCase();

    if (urgency === 'HIGH') return 'HIGH';
    if (urgency === 'MEDIUM') return 'MEDIUM';
    return 'LOW';
  }
}
