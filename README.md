# NyayaSetu Automated Legal Document Summarization and Analysis System

**NyayaSetu** is an AI-powered legal document summarization and analysis system built using **Google's Gemini API**. It can analyze complex legal documents and generate **concise summaries** in **English and Hindi**, making legal information more accessible and easier to understand for professionals.


## Project Overview
Legal documents are often lengthy and complex. **NyayaSetu** uses **Google Gemini API** along with advanced natural language processing (NLP) techniques to automatically:

- Summarize long legal documents in **English and Hindi**.
- Extract key clauses and important information.
- Highlight potential risks or unusual terms.
- Provide quick insights for legal professionals.

This project aims to **reduce manual effort, improve efficiency, and minimize errors** in legal document analysis.

---

## Features
- Upload legal documents in PDF, DOCX, or TXT format.
- AI-generated summaries using **Google Gemini API**, available in **English and Hindi**.
- Clause extraction and categorization.
- Dashboard to view analyzed documents.
- Export summaries and extracted clauses for reports.

---

## Technology Stack
- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **AI/NLP:** Google Gemini API for text summarization (English & Hindi) and clause extraction
- **Database:** MongoDB
- **Others:** Docker (optional), Git & GitHub for version control

---

## Architecture
1. User uploads a legal document through the web interface.
2. Backend processes the document and sends text data to **Google Gemini API**.
3. API returns summarized content in **English or Hindi** along with extracted clauses.
4. Processed data is stored in MongoDB and returned to the frontend.
5. Users can view summaries, download reports, and track documents.
