# Ask My Document

A **high-performance, local Retrieval-Augmented Generation (RAG) system** that allows you to upload documents and chat with them in natural language. Designed for **data privacy**, all processing occurs locally using **Ollama** and **PostgreSQL with pgvector**.

This system differs from a general RAG assistant: it's **document-centric**, letting you interact with uploaded files directly, rather than relying on pre-existing knowledge or conversation history.

## Problem Statement

Organizations and individuals often struggle to extract meaningful insights from large document collections. Traditional LLMs:

* Cannot access private files directly
* May hallucinate without proper context
* Often require cloud-based APIs, risking data privacy

Result: Slow, inaccurate, or insecure document search and summarization.

## Solution Overview

**Ask My Document** solves these problems by:

1. **Ingesting documents locally** and splitting them into intelligently sized chunks with overlap to preserve context
2. **Generating vector embeddings** for each chunk using Ollama
3. **Storing embeddings in PostgreSQL with an HNSW index** for fast similarity search
4. **Retrieving the most relevant chunks** when a user queries the system
5. **Generating factual responses** with source attribution using Gemma 3:1b

The system ensures **accurate, grounded, and private interactions** with your documents.

## Business Value

* Instant access to large document collections
* Reduces time spent searching or summarizing files manually
* Preserves privacy by running locally
* Supports multiple file formats (plain text, PDFs, etc.)
* Useful for research, customer support, compliance, or knowledge management

### Example Use Cases

* Internal company manuals Q&A
* Academic research paper summaries
* Legal or compliance document search
* Personal knowledge management

## High-Level Architecture

```text
Document Upload
      |
      v
Node.js / Express API
      |
      |-- Chunking --> Ollama (nomic-embed-text embeddings)
      |-- Vector Storage --> PostgreSQL + pgvector (HNSW Index)
      |
      v
Ollama LLM (gemma3:1b)
      |
      v
Answer Generation with source citations
```

## Tech Stack

| Component    | Technology                                |
| ------------ | ----------------------------------------- |
| Runtime      | Node.js (Express)                         |
| Database     | PostgreSQL + pgvector                     |
| LLM          | Gemma 3:1b via Ollama                     |
| Embeddings   | Nomic-Embed-Text via Ollama               |
| Vector Index | HNSW (Hierarchical Navigable Small World) |

## Core Features

* **Local Processing** – Runs fully on your machine with Ollama
* **Vector Search** – Fast similarity search using HNSW index
* **Intelligent Chunking** – Recursive text splitting with overlap
* **Source Attribution** – Responses cite exact document chunks
* **Batch Embedding** – Efficiently handles large documents

## Getting Started

### Prerequisites

* Node.js v18+
* PostgreSQL with pgvector installed
* Ollama installed

### Install Local Models

```bash
ollama pull gemma3:1b
ollama pull nomic-embed-text
```

### Setup Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=llm_docs
DB_PORT=5432
```

### Installation

```bash
# Install dependencies
npm install

# Start the server
node index.js
```

## API Endpoints

**POST /api/upload-file** – Uploads a text file, chunks the content, generates embeddings, and stores them.

* Body: `multipart/form-data` (file)

**POST /api/chat** – Query documents in natural language.

* Body: `{ "prompt": "Who is Kutenda?" }`
* Response:

```json
{
  "answer": "Kutenda is a software developer...",
  "sources": ["Doc ID: 4", "Doc ID: 5"]
}
```

## How It Works

1. **Ingestion** – Files are read and split into 400-character chunks with 100-character overlap.
2. **Embedding** – Each chunk is converted into a 768-dimensional vector using nomic-embed-text.
3. **Storage** – Vectors and text chunks are stored in PostgreSQL with HNSW index for efficient similarity search.
4. **Retrieval** – User queries are embedded; top 5 most relevant chunks retrieved.
5. **Generation** – Context + query sent to Gemma 3:1b for a factual, grounded response with citations.

## Future Enhancements

* Support for PDFs and other document formats
* Multi-document query batching
* Real-time streaming responses
* Authentication and multi-user support
* Conversation history and memory features
* Multi-language document embeddings

## Project Significance

**Ask My Document** demonstrates a production-ready, **document-focused RAG architecture** that prioritizes privacy, accuracy, and efficiency. Perfect for enterprise knowledge management, research workflows, and personal data interaction.
