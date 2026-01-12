# NyayaSetu Automated Legal Document Summarization and Analysis System
AI-powered legal document summarization system built using Google's Gemini API to analyze and generate concise summaries of complex legal documents.

## Project Overview
Legal documents are often lengthy and complex. NyayaSetu uses **Google Gemini API** along with advanced natural language processing (NLP) techniques to automatically:

- Summarize long legal documents.
- Extract key clauses and important information.
- Highlight potential risks or unusual terms.
- Provide quick insights for legal professionals.

This project aims to **reduce manual effort, improve efficiency, and minimize errors** in legal document analysis.

---

## Features
- Upload legal documents in PDF, DOCX, or TXT format.
- AI-generated summaries using **Google Gemini API**.
- Clause extraction and categorization.
- Dashboard to view analyzed documents.
- Export summaries and extracted clauses for reports.

---

## Technology Stack
- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **AI/NLP:** Google Gemini API for text summarization and clause extraction
- **Database:** MongoDB
- **Others:** Docker (optional), Git & GitHub for version control

---

## Architecture
1. User uploads a legal document through the web interface.
2. Backend processes the document and sends text data to **Google Gemini API**.
3. API returns summarized content and extracted clauses.
4. Processed data is stored in MongoDB and returned to the frontend.
5. Users can view summaries, download reports, and track documents.
