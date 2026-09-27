# 🚀 Render Deployment Guide (বাংলা ও English)

Render-এ এই ফুলস্ট্যাক প্রজেক্টটি ডিপ্লয় করা Vercel-এর চেয়ে অনেক সহজ এবং ফ্রি! নিচে খুব সহজ ধাপগুলো দেওয়া হলো:

---

### ধাপ ১: GitHub-এ কোড আপলোড করা
1. [GitHub.com](https://github.com) এ লগইন করে একটি নতুন Repository তৈরি করুন (যেমন: `nirbhaya-sathi`)।
2. আপনার ডাউনলোড করা ZIP ফাইলটি আনজিপ (Unzip/Extract) করুন।
3. সমস্ত ফাইলগুলো আপনার নতুন GitHub repository-তে আপলোড (Push/Upload) করে দিন।

---

### ধাপ ২: Render-এ অ্যাকাউন্ট তৈরি ও কানেক্ট করা
1. [render.com](https://render.com) এ যান এবং আপনার GitHub অ্যাকাউন্ট দিয়ে Sign Up / Log In করুন।
2. ড্যাশবোর্ডে গিয়ে **"New +"** বাটনে ক্লিক করুন এবং **"Web Service"** সিলেক্ট করুন।
3. **"Build and deploy from a Git repository"** অপশন বেছে নিয়ে আপনার GitHub repository-টি সিলেক্ট করুন।

---

### ধাপ ৩: Render সেটিংস কনফিগার করা
Render নিচের সেটিংসগুলো অটোমেটিক ডিটেক্ট করে নেবে (অথবা নিজে মিলিয়ে নিন):
- **Name:** `nirbhaya-sathi`
- **Region:** `Singapore` (বাংলাদেশ/ভারতের জন্য দ্রুততম)
- **Branch:** `main` (বা `master`)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Instance Type:** `Free`

---

### ধাপ ৪: Environment Variables (ঐচ্ছিক কিন্তু ভালো)
নিচে স্ক্রোল করে **"Environment Variables"** সেকশনে যান:
- **NODE_ENV**: `production`
- **GEMINI_API_KEY**: আপনার Google Gemini API Key (যদি AI ফিচার সার্ভার থেকে ব্যবহার করতে চান)

*(নোট: `PORT` Render নিজে থেকেই বসিয়ে নেয়, তাই আলাদা করে PORT সেট করতে হবে না!)*

---

### ধাপ ৫: Deploy বাটনে ক্লিক করুন
- নিচে থাকা **"Deploy Web Service"** (বা "Create Web Service") বাটনে ক্লিক করুন।
- ২-৩ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে এবং Render আপনাকে একটি ফ্রি লাইভ লিঙ্ক দিয়ে দেবে (যেমন: `https://nirbhaya-sathi.onrender.com`)।

🎉 আপনার ফুলস্ট্যাক ফ্রন্টএন্ড এবং এক্সপ্রেস ব্যাকএন্ড সম্পূর্ণ ফ্রিতে লাইভ চালু হয়ে যাবে!
