import { loadTextFromDirectory } from "../src/etl/reader";
import embedData from "../src/etl/textSplitterEmbedder";

const directoryPath = process.env.DOCS_ROOT; // Replace with your directory path

const args = process.argv.slice(2);

loadTextFromDirectory(directoryPath).then(filesContents => {
  //console.log(filesContents);
  let totalWords = 0;
  Object.keys(filesContents).forEach((key) => {
    const value = filesContents[key];
    totalWords += value.words
  });

  console.log(`Number of total words: ${totalWords} `);
  return filesContents;
}).then((filesContents) => {
  if(args.includes('store')){
    console.log('Storing data to embeddings db');
    return embedData(Object.values(filesContents));
  }else{
    console.log('Not Storing data to embeddings db');
  }
});
