🚀 Local RAG System: Ask My Documents
A high-performance Retrieval-Augmented Generation (RAG) system built with Node.js. This application allows you to upload documents, convert them into vector embeddings, and chat with your data locally using Ollama and PostgreSQL (pgvector).

✨ Features
Local Processing: Uses Ollama to run LLMs locally, ensuring data privacy.

Vector Search: Powered by pgvector with an HNSW index for lightning-fast similarity lookups.

Intelligent Chunking: Implements recursive text splitting with overlap to maintain context.

Source Attribution: Responses include citations showing exactly which document chunks were used.

Batch Embedding: Efficiently processes large documents by batching embedding requests.

🛠️ Tech Stack
Component	Technology
Runtime	Node.js (Express)
Database	PostgreSQL + pgvector extension
LLM (Chat)	Gemma 3:1b (via Ollama)
Embeddings	Nomic-Embed-Text (via Ollama)
Vector Index	HNSW (Hierarchical Navigable Small World)
📥 Getting Started
1. Prerequisites

Node.js (v18+)

PostgreSQL (with pgvector installed)

Ollama

2. Install Local Models

Open your terminal and pull the necessary models:

Bash
ollama pull gemma3:1b
ollama pull nomic-embed-text
3. Setup Environment Variables

Create a .env file in the root directory:

Code snippet
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=llm_docs
DB_PORT=5432
4. Installation

Bash
# Install dependencies
npm install

# Start the server
node index.js
🛰️ API Endpoints
POST /api/upload-file

Uploads a text file, chunks the content, generates embeddings, and saves them to the vector database.

Body: multipart/form-data (file)

POST /api/chat

Query your documents using natural language.

Body: { "prompt": "Who is Kutenda?" }

Response:

JSON
{
  "answer": "Kutenda is a software developer...",
  "sources": ["Doc ID: 4", "Doc ID: 5"]
}
🧠 How It Works
Ingestion: Files are read and split into 400-character chunks with a 100-character overlap.

Embedding: Each chunk is converted into a 768-dimensional vector using nomic-embed-text.

Storage: Vectors and text chunks are stored in a PostgreSQL table with an HNSW index for efficient Cosine Similarity searching.

Retrieval: When a user asks a question, the question is embedded and the top 5 most relevant chunks are retrieved via the <=> operator.

Generation: The context and the question are sent to gemma3:1b to generate a factual, grounded response.
