export const openAIChatModel = 'gpt-3.5-turbo-1106';
export const modelTemperature = 0.9;

export const openAIConfiguration = {
  modelName: openAIChatModel,
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: modelTemperature,
  callbacks: [
  ],
}

export const chatHistoryTable = process.env.CHAT_HISTORY_TABLE ?? 'chat_history';

export const embeddingsTable = process.env.EMBEDDINGS_TABLE ?? 'doc_embeddings';
