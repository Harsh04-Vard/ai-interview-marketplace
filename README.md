# 🎯 AI Interview Marketplace

A full-stack AI-powered mock interview platform that helps users practice technical interviews with real-time video calls and AI-generated questions.

---

## 🚀 Live Demo

👉 https://ai-interview-marketplace.vercel.app

---

## ✨ Features

* 🤖 AI-powered interview questions (Groq LLaMA)
* 🎥 Real-time video interviews
* 🔐 Secure authentication (Clerk)
* 📅 Interview booking system
* 🧠 Multiple categories (DSA, System Design, Behavioral)
* ⚡ Interactive one-by-one question flow

---

## 🛠 Tech Stack

* Next.js (App Router)
* React + Tailwind CSS
* Prisma + PostgreSQL
* Clerk Authentication
* Groq AI (LLaMA 3.1)
* Stream Video SDK

---

## 📦 Setup

```bash
git clone https://github.com/Harsh04-Vard/ai-interview-marketplace.git
cd ai-interview-marketplace
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
DATABASE_URL=your_database_url_here
DIRECT_URL=your_direct_database_url_here
ARCJET_KEY=your_arcjet_key_here
ARCJET_ENV=your_environment_here
STREAM_API_KEY=your_stream_api_key_here
STREAM_SECRET_KEY=your_stream_secret_key_here
NEXT_PUBLIC_STREAM_API_KEY=your_stream_public_key_here
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_APP_URL=your_app_url_here
RESEND_API_KEY=your_resend_api_key_here
```

---

## 📌 Future Improvements

* AI-based scoring system
* Timer-based interviews
* Performance analytics
* Custom domain

---

## 👨‍💻 Author

Harsh Vardhan
GitHub: https://github.com/Harsh04-Vard

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
