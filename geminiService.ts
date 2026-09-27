export async function getSafetyGuidance(prompt: string, language: string) {
  const cleanPrompt = prompt.toLowerCase().trim();
  const isBengali = language === 'bn' || cleanPrompt.match(/[অ-হ]/);

  // 1. Try server-side API proxy (Express server)
  try {
    const response = await fetch("/api/safety-guidance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, language }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text) return data.text;
    }
  } catch (error) {
    console.log("Backend server offline or not running full-stack. Trying client-side/offline fallback...");
  }

  // 2. Try client-side Gemini if VITE_GEMINI_API_KEY is available
  const browserApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (browserApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${browserApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a Women's Safety Assistant for "নির্ভয়া সাথী". Please guide the user on: "${prompt}". Respond in ${language === 'bn' ? 'Bengali' : 'English'}. Keep it concise and practical.` }] }]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (apiError) {
      console.error("Direct Gemini API error:", apiError);
    }
  }

  // 3. Robust Offline Smart Helper Rules (extremely friendly and safety-oriented)
  
  // Danger / SOS / Panic
  if (
    cleanPrompt.includes('danger') || 
    cleanPrompt.includes('help') || 
    cleanPrompt.includes('sos') || 
    cleanPrompt.includes('panic') || 
    cleanPrompt.includes('emergency') || 
    cleanPrompt.includes('বাঁচাও') || 
    cleanPrompt.includes('সাহায্য') || 
    cleanPrompt.includes('বিপদ') || 
    cleanPrompt.includes('আক্রমণ') ||
    cleanPrompt.includes('ভয়') ||
    cleanPrompt.includes('প্যানিক')
  ) {
    return isBengali 
      ? "🚨 প্যানিক মোমেন্টে তাৎক্ষণিক করণীয়:\n\n১. **৪-সেকেন্ড ব্রিদিং**: ভয় পেয়ে হাত-পা কাঁপলে ৪ সেকেন্ড শ্বাস নিন, ৪ সেকেন্ড ধরে রাখুন, ৪ সেকেন্ড ছাড়ুন। এটি ব্রেন ফ্রিজ দূর করে।\n২. **'বাঁচাও' না বলে 'আগুন! আগুন!' চিৎকার করুন**: গবেষণায় দেখা গেছে মানুষ আগুনের কথায় ৩ গুণ দ্রুত বাইরে আসে ও এগিয়ে আসে।\n৩. **রেড SOS / পুলিশ সাইরেন চালু করুন**: অ্যাপের 'প্যানিক ও সেলফ ডিফেন্স' টুল ওপেন করে উচ্চস্বরে সাইরেন বাজান এবং ফ্ল্যাশ স্ট্রোব আলো জ্বালান।\n৪. জাতীয় জরুরি নম্বর **112** অথবা ওমেন হেল্পলাইন **1091**-এ কল করুন।"
      : "🚨 Immediate Panic Moment Actions:\n\n1. **4-4-4 Box Breathing**: Inhale 4s, hold 4s, exhale 4s to prevent panic freeze and restore sharp vision.\n2. **Shout 'FIRE! FIRE!' instead of just 'Help'**: Draws 3x faster bystander crowd intervention.\n3. **Activate Emergency Tools**: Tap 'Panic & Self-Defense' in the app to blare the siren or use the tactical strobe flash.\n4. Call National Emergency **112** or Women's Helpline **1091** immediately.";
  }

  // Self Defense / Pepper Spray / Fighting / Moves
  if (
    cleanPrompt.includes('defense') || 
    cleanPrompt.includes('pepper') || 
    cleanPrompt.includes('spray') || 
    cleanPrompt.includes('safe') || 
    cleanPrompt.includes('fight') || 
    cleanPrompt.includes('protect') || 
    cleanPrompt.includes('সুরক্ষা') || 
    cleanPrompt.includes('রক্ষা') || 
    cleanPrompt.includes('আক্রমণ') || 
    cleanPrompt.includes('মারামারি') ||
    cleanPrompt.includes('आत्मरक्षा') ||
    cleanPrompt.includes('কৌশল') ||
    cleanPrompt.includes('হাত ধরলে') ||
    cleanPrompt.includes('গলা') ||
    cleanPrompt.includes('self protect')
  ) {
    return isBengali
      ? "🥋 বিপদে পড়লে আত্মরক্ষা (Self-Defense) ও আঘাতের প্রধান নিয়মাবলী:\n\n🎯 **শরীরের দুর্বল স্থানে আঘাত (Weak Target Points):**\n• **চোখ ও নাক**: হাতের তালুর গোড়ালি দিয়ে নিচ থেকে নাকের গোড়ায় সজোরে আঘাত করুন অথবা চোখে বৃদ্ধাঙ্গুল দিয়ে চাপ দিন (১৫-৩০ সেকেন্ডের সাময়িক অন্ধত্ব তৈরি হয়)।\n• **কুঁচকি (Groin)**: আপনার হাঁটু তুলে আক্রমণকারীর দুই পায়ের মাঝখানে সর্বোচ্চ শক্তিতে আঘাত করুন।\n• **শ্বাসনালী (Throat)**: গলার খাঁজে (Adam's Apple) তালু দিয়ে সোজা ধাক্কা মারুন।\n• **পায়ের পাতা ও হাঁটু**: গোড়ালির পুরো ওজন দিয়ে আক্রমণকারীর পায়ের পাতার ওপর আছড়ে ফেলুন।\n\n🔓 **আক্রমণ থেকে মুক্তির কৌশল (Escape Tactics):**\n• **হাত শক্ত করে ধরলে**: বৃদ্ধাঙ্গুলের দিকে নিজের কব্জি ঘুরিয়ে নিজের কাঁধের দিকে হেঁচকা টান দিন।\n• **পেছন থেকে জড়িয়ে ধরলে**: হাঁটু মুড়ে শরীর নিচু করুন (Squat), গোড়ালি দিয়ে আক্রমণকারীর পায়ে মারুন এবং ছোট আঙুল (Pinky) পেছনে মচকে দিন।\n• **গলা টিপে ধরলে**: চিবুক বুকের সাথে শক্ত করে নামিয়ে রাখুন (Chin Tuck) এবং চোখে আঘাত করুন।\n\n🔑 **হাতের কাছে থাকা অস্ত্র**: চাবির গুচ্ছ, স্যানিটাইজার/পারফিউম স্প্রে (চোখে মারা), ভারী ব্যাগ বা ছাতা ঢাল হিসেবে ব্যবহার করুন।"
      : "🥋 Complete Physical Self-Defense Instructions:\n\n🎯 **Vital Weak Strike Targets:**\n• **Eyes & Nose**: Drive palm-heel upward into base of nose or thumb-gouge eyes for instant blinding.\n• **Groin**: Violent upward knee drive with full hip thrust to instantly collapse attacker.\n• **Throat / Windpipe**: Palm thrust into Adam's apple notch to disable breath.\n• **Instep / Foot**: Stomp hard heel directly onto attacker's toes/instep.\n\n🔓 **Escape Maneuvers:**\n• **Wrist Grab**: Rotate wrist toward attacker's thumb (weakest point) and yank sharply toward your shoulder.\n• **Rear Bear-Hug**: Drop weight low into a squat, stomp foot, elbow ribs, and bend their pinky finger backwards.\n• **Front Choke**: Tuck chin down to protect airway, rotate shoulders sideways, and gouge eyes.\n\n🔑 **Improvised Weapons**: Keys between knuckles, perfume/sanitizer in eyes, backpack as a shield.";
  }

  // Legal / Laws / Police / FIR
  if (
    cleanPrompt.includes('legal') || 
    cleanPrompt.includes('law') || 
    cleanPrompt.includes('rights') || 
    cleanPrompt.includes('police') || 
    cleanPrompt.includes('fir') || 
    cleanPrompt.includes('court') || 
    cleanPrompt.includes('আইন') || 
    cleanPrompt.includes('পুলিশ') || 
    cleanPrompt.includes('অধিকার') || 
    cleanPrompt.includes('মামলা')
  ) {
    return isBengali
      ? "⚖️ আইনি অধিকার ও সচেতনতা:\n\n১. **Zero FIR**: ঘটনা যেকোনো জায়গায় ঘটুক না কেন, আপনি নিকটস্থ যেকোনো পুলিশ স্টেশনে FIR দায়ের করতে পারেন।\n২. **সূর্যাস্তের পর গ্রেপ্তার নয়**: কোনো নারীকে সূর্যাস্তের পর এবং সূর্যোদয়ের আগে মহিলা পুলিশ অফিসারের উপস্থিতি ও আদালতের বিশেষ অনুমতি ছাড়া গ্রেপ্তার করা যায় না।\n৩. **IPC ধারা ১০০**: নিজের শরীর ও জীবন রক্ষার জন্য আইনসম্মতভাবে আত্মরক্ষার সর্বোচ্চ অধিকার আপনার আছে।"
      : "⚖️ Legal Rights & Awareness:\n\n1. **Zero FIR**: You can register an FIR at any police station across India, regardless of where the incident occurred.\n2. **No Arrest After Sunset**: Women cannot be arrested after sunset and before sunrise, except in extraordinary circumstances with a female officer and judicial permission.\n3. **IPC Section 100**: You have a constitutional and legal right to private defense of body and property against any threat.";
  }

  // Location / Gps / Tracking
  if (
    cleanPrompt.includes('location') || 
    cleanPrompt.includes('track') || 
    cleanPrompt.includes('gps') || 
    cleanPrompt.includes('map') || 
    cleanPrompt.includes('জিপিএস') || 
    cleanPrompt.includes('ম্যাপ') || 
    cleanPrompt.includes('অবস্থান')
  ) {
    return isBengali
      ? "📍 অবস্থান ট্র্যাকিং:\n\nআমাদের অ্যাপের 'Live Trip' ফিচারের মাধ্যমে আপনি আপনার রিয়েল-টাইম অবস্থান আপনার বিশ্বস্ত বন্ধুদের সাথে শেয়ার করতে পারেন। বিপদে পড়লে জিপিএস ট্র্যাকিং স্বয়ংক্রিয়ভাবে সক্রিয় হয়।"
      : "📍 Location Tracking:\n\nYou can use our 'Live Trip' feature to share your live location with trusted contacts. In case of SOS, your live coordinates are automatically highlighted to helpers.";
  }

  // Default response
  return isBengali
    ? "আমি আপনার 'নির্ভয়া সাথী' নিরাপত্তা সহকারী। নারী নিরাপত্তা, আইনি অধিকার, জরুরি নম্বর, বা আত্মরক্ষার কৌশল সম্পর্কে যেকোনো প্রশ্ন করতে পারেন। জরুরি প্রয়োজনে অনুগ্রহ করে স্ক্রিনে থাকা 'SOS' বাটনে ক্লিক করুন।"
    : "I am your 'Nirbhaya Sathi' safety assistant. You can ask me any questions about women's safety, self-defense tactics, legal rights, or helpline numbers. For emergencies, please use the Red 'SOS' button.";
}
