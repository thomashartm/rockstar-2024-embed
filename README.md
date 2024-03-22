# AEM Rockstar 2024 - Chat AEM Embeddings Scripts

This project processes a set of source documents and embeds the data into vector store.
It is used to create the data for the ChatAEM - AEM Rockstars 2024 project.

## Getting Started

The embedding process can be run from local.

1. Make sure to have the following env variables present (create a .env file in the root of the project):

        DB_SECRET_NAME=<ChatAEM DB Secrets Name>
        DOCS_ROOT=<Fully uqalified path to your documentation>
        OPENAI_API_KEY=<YOUR OPEN AI KEY>

2. Run the following command to start the embedding process:

        npm run embed

