import fs from 'fs/promises';
import path from "path";
import {Embedding} from "./types";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";


async function getFilteredFiles(directoryPath: string, expectedExtension: string = '.txt') {
  const files = await fs.readdir(directoryPath);
  return files
    .filter(file => !file.startsWith('.DS_Store'))
    .filter(file => file.endsWith(expectedExtension));
}
async function loadTextFromDirectory(directoryPath: string) {
  const documents = [];
  const filteredFiles = await getFilteredFiles(directoryPath);
  for (const file of filteredFiles) {
    const filePath = path.join(directoryPath, file);
    const loader = new TextLoader(filePath);
    const docs = await loader.load()
    documents.push(...docs);
  }

  return filterDocs(documents)
}

async function filterDocs(docs: Document[]) {
  const results = []
  for (const doc of docs) {
    let pageContent = doc.pageContent;
    if (pageContent.length < 50) {
      console.log('Removing document with less than 100 characters', doc.metadata?.fileName);
      continue;
    }
    // paragraph split
    let title = '';
    let source = '';
    let totalWords = 0;

    const lines = pageContent
      .split(/\r?\n/);
    const content = lines
      .filter(line => line.trim() !== '')
      .map(line => line.replace(/^\s$/, ''))
      .map(line => {
        // assuming the first non-empty line is the title
        if (source.length === 0 && line.length > 0) {
          source = line.replace('Source:', '').trim();
        }
        return line
      })
      .filter(line => !line.startsWith('Source:'))
      .map(line => {
        // assuming the first non-empty line is the title
        if (title.length === 0 && line.length > 0) {
          title = line;
        }
        return line
      })
      .map(line => {
        // remove leading and trailing spaces
        const words = line.split(/\W+/).filter(word => word.length > 0);
        totalWords += words.length;
        return line;
      })
      .map(line => line.trim())
      .map(line => line.replace(/([(\[]).*?([)\]])/g, ''))
      .map(line => line.replace(/\s{2,}/g, ' '))
      .map(line => line.replace(/[^a-zA-Z0-9.,\s]/g, ''))
      .map(line => line.replace('-   ', ''))
      .map(line => line.replace('   ', ''));


    results.push({
      pageContent: content.join(''),
      metadata: {
        fileName: doc.metadata.fileName,
        title: title,
        source: source,
        words: totalWords
      }
    } as Document);
  }
  return results;
}

// Function to read files in the directory and extract their contents line by line
async function readTxtFromDirectory(directoryPath: string): Promise<{ [fileName: string]: Embedding }> {
  const filesContents: { [fileName: string]: any } = {};

  try {
    const files = await fs.readdir(directoryPath);
    const filteredFiles = files
      .filter(file => !file.startsWith('.DS_Store'))
      .filter(file => file.endsWith('.txt'));

    for (const file of filteredFiles) {
      const filePath = path.join(directoryPath, file);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isFile()) {
        const contents = await fs.readFile(filePath, {encoding: 'utf-8'});
        const lines = contents.split(/\r?\n/);

        let title = '';
        let source = '';
        let totalWords = 0;
        const content = lines
          .filter(line => line.trim() !== '')
          .map(line => line.replace(/^\s$/, ''))
          .map(line => {
            // assuming the first non-empty line is the title
            if (source.length === 0 && line.length > 0) {
              source = line.replace('Source:', '').trim();
            }
            return line
          })
          .filter(line => !line.startsWith('Source:'))
          .map(line => {
            // assuming the first non-empty line is the title
            if (title.length === 0 && line.length > 0) {
              title = line;
            }
            return line
          })
          .map(line => {
            // remove leading and trailing spaces
            const words = line.split(/\W+/).filter(word => word.length > 0);
            totalWords += words.length;
            return line;
          });

        filesContents[file] = {
          fileName: file,
          source: source,
          title: title,
          content: content,
          words: totalWords,
        }

      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }

  return filesContents;
}

export { readTxtFromDirectory, loadTextFromDirectory };
