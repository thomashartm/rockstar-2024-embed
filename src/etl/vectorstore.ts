import {PoolConfig} from "pg";
import fs from "fs";
import {embeddingsTable} from "../configuration";
import getSecretValue from "../util/awsconfig";
import {OpenAIEmbeddings} from "@langchain/openai";
import {Embeddings} from "@langchain/core/embeddings";
import {PGVectorStore} from "@langchain/community/vectorstores/pgvector";


// sslPath is used to fix a path issue while executing the lambdaHandler locally
const sslPath = process.env.SSL_PATH ?? `${__dirname}/../..`;

const initVectorStore = async () => {
  const db = await getSecretValue(process.env.DB_SECRET_NAME as string, true)
  const endpoint = db['host']
  const [host, port] = endpoint.split(':');
  const config = {
    postgresConnectionOptions: {
      type: 'postgres',
      user: db['username'],
      host: host,
      port: port,
      database: db['db_name'],
      password: db['password'],
      ssl: {
        ca: fs.readFileSync(`${sslPath}/resources/global-bundle.pem`).toString(),
        rejectUnauthorized: false,
      },

      log: (...messages: any[]) => {
        console.log(messages);
      },
    } as PoolConfig,
    tableName: embeddingsTable,
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embeddings',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  };

  const embeddings = new OpenAIEmbeddings({
    maxConcurrency: 5,
    batchSize: 5,
    modelName: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });


  return await PGVectorStore.initialize(
    embeddings as Embeddings,
    config);
}

const getRetriever = (vectorStore: PGVectorStore) => {
  return vectorStore.asRetriever({k: 1, verbose: true});
}

export {initVectorStore, getRetriever};
