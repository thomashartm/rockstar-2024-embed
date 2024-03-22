import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {MozillaReadabilityTransformer} from "@langchain/community/document_transformers/mozilla_readability";
import {initVectorStore} from "./vectorstore";


const splitDocuments = async (docs: any) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 20,
    separators: ["\n\n", ". ", ".\n"],
    keepSeparator: false,
  });
  const transformer = new MozillaReadabilityTransformer();
  const sequence = splitter.pipe(transformer);

  return await sequence.invoke(docs);
}


const embedData = async (docs: any) => {
  const documents = await splitDocuments(docs);

  const vectorStore = await initVectorStore();
  await vectorStore.client.query("BEGIN");
  await vectorStore.addDocuments(documents);
  await vectorStore.client.query("COMMIT");
  await vectorStore.end();

  console.log(documents);
}


export default embedData;
