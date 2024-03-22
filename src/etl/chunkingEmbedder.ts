import {initVectorStore} from "./vectorstore";
import {Embedding} from "./types";
import {CharacterTextSplitter} from "langchain/text_splitter";
import { Document } from "langchain/document";
import {sleep} from "openai/core";

async function processEmbeddings(embeddings: Embedding[], splitter: CharacterTextSplitter) {

  let processedEmbeddings: Document[] = [];
  const maxTokens = 1000;
  for (const embedding of embeddings) {
      const text = embedding.content.join('\n')
      const words = text.split(/\s+/); // Simple word tokenization
      let chunks: string[] = [];
      let currentChunk: string[] = [];

      words.forEach(word => {
        if ((currentChunk.length + 1) <= maxTokens) {
          currentChunk.push(word);
        } else {
          chunks.push(currentChunk.join(' '));
          currentChunk = [word]; // Start a new chunk with the current word
        }
      });

      // Add the last chunk if it's not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
      }

      for(const chunk of chunks) {
      const splitContents = await splitter.splitText(chunk);

        // For each chunk of content, create a new embedding object
        splitContents.forEach(chunk => {
          processedEmbeddings.push(new Document(
            {pageContent: chunk, metadata: {  fileName: embedding.fileName, title: embedding.title, words: embedding.words, source: embedding.source } }
          ));
        });
      }

  }

  return processedEmbeddings;
}

function splitIntoChunks<T>(items: T[], chunkSize: number): T[][] {
  return items.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / chunkSize);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // Start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, [] as T[][]);
}

const embedData = async (data: Embedding[]) => {
  const loadedData = []
  const splitter = new CharacterTextSplitter({
    keepSeparator: false,
    chunkSize: 1000,
    chunkOverlap: 20,
  });

  data.forEach(embedding => {
    if (embedding.content && embedding.content.length > 0) {
      const content = embedding.content.filter((line: string) => line && line.trim() !== '');

      if (content.length > 0) {

        loadedData.push({
          fileName: embedding.fileName,
          title: embedding.title,
          words: embedding.words,
          source: embedding.source,
          content: content,
        });
      }
    }
  });

  const processedEmbeddings = await processEmbeddings(loadedData, splitter);
  const processableChunks = splitIntoChunks(processedEmbeddings, 1);

  console.log(processableChunks)
  for(const documents of processableChunks) {
    const vectorStore = await initVectorStore();
    await vectorStore.client.query("BEGIN");
    await vectorStore.addDocuments(documents);
    await vectorStore.client.query("COMMIT");
    await vectorStore.end()
    sleep(1000)
  }

  console.log(loadedData.length);
}

export {embedData};
