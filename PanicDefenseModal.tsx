import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useEmergency } from '../EmergencyContext';
import { 
  ShieldAlert, 
  X, 
  Zap, 
  Flame, 
  Volume2, 
  Eye, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  Key, 
  SprayCan as Spray, 
  Smartphone, 
  Shield, 
  Scale, 
  Activity, 
  Radio, 
  VolumeX, 
  Wind,
  Layers,
  Flashlight,
  PhoneCall,
  UserCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startPoliceSiren, stopPoliceSiren, isPoliceSirenPlaying, speakDispatchAnnouncement } from '../services/soundSynthesizer';

interface PanicDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTacticalStrobe?: () => void;
  onOpenFakeCall?: () => void;
}

type TabType = 'PANIC_NOW' | 'STRIKES' | 'ESCAPES' | 'IMPROVISED_WEAPONS' | 'SITUATIONS' | 'LEGAL_RIGHTS';

export default function PanicDefenseModal({
  isOpen,
  onClose,
  onOpenTacticalStrobe,
  onOpenFakeCall
}: PanicDefenseModalProps) {
  const { language } = useLanguage();
  const { emergency, triggerEmergency, cancelEmergency } = useEmergency();
  const [activeTab, setActiveTab] = useState<TabType>('PANIC_NOW');
  const [isSirenOn, setIsSirenOn] = useState(false);
  const [selectedStrikeId, setSelectedStrikeId] = useState<string>('eyes');
  const [selectedEscapeId, setSelectedEscapeId] = useState<string>('wrist');
  
  // Panic 4-4-4 Box Breathing Animation State
  const [breathePhase, setBreathePhase] = useState<'INHALE' | 'HOLD' | 'EXHALE' | 'REST'>('INHALE');
  const [breatheTimer, setBreatheTimer] = useState<number>(4);

  const isBn = language === 'bn';

  // Keep siren status synced
  useEffect(() => {
    setIsSirenOn(isPoliceSirenPlaying());
  }, [isOpen]);

  // Box Breathing cycle (4s Inhale -> 4s Hold -> 4s Exhale -> 4s Rest)
  useEffect(() => {
    if (!isOpen || activeTab !== 'PANIC_NOW') return;
    const interval = setInterval(() => {
      setBreatheTimer((prev) => {
        if (prev <= 1) {
          setBreathePhase((curr) => {
            if (curr === 'INHALE') return 'HOLD';
            if (curr === 'HOLD') return 'EXHALE';
            if (curr === 'EXHALE') return 'REST';
            return 'INHALE';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  const handleToggleSiren = () => {
    if (isSirenOn) {
      stopPoliceSiren();
      setIsSirenOn(false);
    } else {
      startPoliceSiren('KOLKATA_112', 0.9);
      setIsSirenOn(true);
    }
  };

  const handleShoutVoice = (phrase: 'FIRE' | 'POLICE' | 'STOP') => {
    if (phrase === 'FIRE') {
      speakDispatchAnnouncement('Fire! Fire! Save me! Help! আগুন! আগুন! বাঁচাও!');
    } else if (phrase === 'POLICE') {
      speakDispatchAnnouncement('Police! Police! Dial 112! পুলিশ! আমাকে বাঁচান!');
    } else {
      speakDispatchAnnouncement('Stay back! Step away immediately! পেছনে যান!');
    }
  };

  // Vulnerable target strike points
  const VULNERABLE_STRIKES = [
    {
      id: 'eyes',
      nameEn: '1. Eyes & Nose Bridge (চোখ ও নাকের হাড়)',
      zone: 'Upper Face / চোখ',
      damage: 'Instant Blindness & Extreme Watery Eyes',
      techniqueEn: 'Drive heel of open palm upward into base of nose, or gouge thumb/fingers firmly into corners of eyes.',
      techniqueBn: 'হাতের তালুর গোড়ালি দিয়ে নিচ থেকে ওপরের দিকে নাকের গোড়ায় সজোরে আঘাত করুন অথবা দুই বৃদ্ধাঙ্গুল দিয়ে চোখে চাপ দিন।',
      effectEn: 'Causes involuntary eye closure, intense tearing, and buys 15–30 seconds for immediate sprint escape.',
      effectBn: 'চোখে তীব্র জল এসে আক্রমণকারী সাময়িকভাবে অন্ধ হয়ে পড়বে এবং আপনি দৌড়ে পালানোর সময় পাবেন।'
    },
    {
      id: 'throat',
      nameEn: '2. Throat & Windpipe (শ্বাসনালী ও কণ্ঠনালী)',
      zone: 'Neck / গলা',
      damage: 'Chokes Airway & Disables Breath',
      techniqueEn: 'Direct web of thumb or open-palm thrust directly into Adam\'s apple/trachea notch.',
      techniqueBn: 'হাতের বৃদ্ধাঙ্গুল ও তর্জনীর মধ্যবর্তী খাঁজ দিয়ে আক্রমণকারীর গলার খাঁজে (Adam\'s apple) সোজা ধাক্কা বা খোঁচা মারুন।',
      effectEn: 'Triggers violent coughing fit, severe breath spasm, dropping attacker to knees.',
      effectBn: 'শ্বাসরোধ হয়ে প্রচণ্ড কাশি শুরু হবে এবং আক্রমণকারী হাঁটু গেড়ে বসে পড়তে বাধ্য হবে।'
    },
    {
      id: 'groin',
      nameEn: '3. Groin & Lower Abdomen (কুঁচকি ও তলপেট)',
      zone: 'Pelvis / কুঁচকি',
      damage: 'Excruciating Pain & Complete Body Collapse',
      techniqueEn: 'Violent upward knee smash with full body hip thrust, or sharp toe-kick if standing at distance.',
      techniqueBn: 'শরীরের সম্পূর্ণ ভর দিয়ে আপনার হাঁটু আক্রমণকারীর দুই পায়ের মাঝখানে (কুঁচকিতে) ওপরের দিকে সজোরে আঘাত করুন।',
      effectEn: 'Forces attacker into immediate fetal shock, paralyzing legs and posture.',
      effectBn: 'অসহ্য ব্যথায় আক্রমণকারী তৎক্ষণাৎ মাটিতে লুটিয়ে পড়বে।'
    },
    {
      id: 'ears',
      nameEn: '4. Ears Acoustic Shock (কানের পর্দা ও ভারসাম্য)',
      zone: 'Head / কান',
      damage: 'Eardrum Rupture & Loss of Equilibrium',
      techniqueEn: 'Cup both palms and simultaneously slam hard over both ears of the attacker.',
      techniqueBn: 'দুই হাতের তালু বাটির মতো বাঁকিয়ে আক্রমণকারীর দুই কানের ওপর একসাথে সজোরে চড় বা চাপড় মারুন।',
      effectEn: 'Air compression damages eardrums, causes instant vertigo, dizziness, and ear ringing.',
      effectBn: 'বাতাসের তীব্র চাপে মাথা ঘুরে আক্রমণকারী ভারসাম্য হারিয়ে ফেলবে।'
    },
    {
      id: 'knee_instep',
      nameEn: '5. Knee Cap & Instep Foot (হাঁটুর জোড় ও পায়ের পাতা)',
      zone: 'Legs / পা',
      damage: 'Joint Hyperextension & Foot Bone Fracture',
      techniqueEn: 'Stomp your hard heel downward onto attacker\'s toes/instep, or kick side of their knee joint.',
      techniqueBn: 'আপনার জুতো বা গোড়ালির পুরো ওজন দিয়ে আক্রমণকারীর পায়ের পাতার ওপর সজোরে পা দিয়ে মারুন বা হাঁটুর পাশে লাথি মারুন।',
      effectEn: 'Prevents attacker from chasing or running behind you as you escape.',
      effectBn: 'আক্রমণকারীর পা জখম হবে, ফলে সে আর আপনার পেছনে দৌড়ে আসতে পারবে না।'
    },
    {
      id: 'solar_plexus',
      nameEn: '6. Solar Plexus (বুকের খাঁচা / মধ্যচ্ছদা)',
      zone: 'Torso / বুকের মাঝখান',
      damage: 'Diaphragm Paralysis & "Wind Knockout"',
      techniqueEn: 'Drive rear elbow straight back into attacker\'s ribcage/solar plexus when grabbed from behind.',
      techniqueBn: 'পেছন থেকে জড়িয়ে ধরলে আপনার কনুই পেছনের দিকে সোজা তার বুকের মধ্যভাগে সজোরে চালনা করুন।',
      effectEn: 'Knocks breath completely out of lungs, making standing impossible for several seconds.',
      effectBn: 'আক্রমণকারীর দম বন্ধ হয়ে যাবে এবং সে নিশ্বাস নেওয়ার জন্য ব্যাকুল হয়ে পড়বে।'
    }
  ];

  // Tactical Escapes from Common Attacks
  const ESCAPE_TACTICS = [
    {
      id: 'wrist',
      titleEn: 'Wrist Grab Release (হাত শক্ত করে ধরলে)',
      titleBn: 'কব্জি বা হাত শক্ত করে টেনে ধরলে মুক্তির নিয়ম',
      situationEn: 'Attacker grabs one or both of your wrists trying to drag you.',
      situationBn: 'আক্রমণকারী আপনার হাত বা কব্জি শক্ত করে ধরে টেনে নেওয়ার চেষ্টা করছে।',
      stepsEn: [
        '1. The Thumb Rule: Identify where the attacker\'s thumb meets their fingers. The thumb is always the weakest link of any hand grip.',
        '2. Rotate your wrist toward their thumb notch (not against the 4 strong fingers).',
        '3. Step in toward the attacker to use your body weight, bend your elbow, and yank your hand sharply upward and toward your own shoulder.',
        '4. As grip breaks, deliver immediate palm strike to their face or kick groin, then RUN!'
      ],
      stepsBn: [
        '১. বৃদ্ধাঙ্গুল নিয়ম: মানুষের হাতের মুঠোয় বৃদ্ধাঙ্গুলির দিকটি সবচেয়ে দুর্বল।',
        '২. আপনার কব্জিটি আক্রমণকারীর বৃদ্ধাঙ্গুলের সংযোগস্থলের দিকে ঘোরান।',
        '৩. আক্রমণকারীর দিকে এক কদম এগিয়ে এসে নিজের কনুই ভাঁজ করে হাতটি নিজের কাঁধের দিকে তীব্র টানে ওপরের দিকে হেঁচকা টান দিন।',
        '৪. হাত ছাড়া পাওয়ার সাথে সাথে আক্রমণকারীর নাকে বা কুঁচকিতে আঘাত করুন এবং দৌড় দিন।'
      ]
    },
    {
      id: 'rear_hug',
      titleEn: 'Rear Bear Hug / Grabbed from Behind (পেছন থেকে জড়িয়ে ধরলে)',
      titleBn: 'পেছন থেকে জাপটে বা জড়িয়ে ধরলে মুক্তির নিয়ম',
      situationEn: 'Attacker sneaks up behind you and pins your arms or torso.',
      situationBn: 'আক্রমণকারী পেছন থেকে অতর্কিতে এসে আপনার দুই হাত বা শরীর জাপটে ধরেছে।',
      stepsEn: [
        '1. Drop Weight Instantly: Squat down low immediately to lower your center of gravity. This makes it impossible for them to easily lift or carry you.',
        '2. Foot Stomp: Raise your foot and stomp your hard heel directly onto the attacker\'s toes or instep.',
        '3. Backward Headbutt & Elbows: Slam the back of your head into their nose, or drive sharp elbows back into their ribs.',
        '4. Pinky Break: Reach back, grab their pinky/little finger with full hand and bend it backwards aggressively until they scream and release.'
      ],
      stepsBn: [
        '১. শরীর নিচু করুন (Squat): তৎক্ষণাৎ হাঁটু মুড়ে শরীর নিচু করুন। এতে আক্রমণকারী আপনাকে সহজে শূন্যে তুলতে পারবে না।',
        '২. পায়ের পাতায় গোড়ালি দিয়ে আঘাত: নিজের গোড়ালি তুলে আক্রমণকারীর পায়ের পাতায় সজোরে আছড়ে ফেলুন।',
        '৩. পেছনের দিকে কনুই ও মাথার গুঁতো: পেছনের দিকে নিজের মাথা দিয়ে আক্রমণকারীর নাকে অথবা কনুই দিয়ে পাঁজরে প্রচণ্ড আঘাত করুন।',
        '৪. কনিষ্ঠা আঙুল ভাঙার কৌশল: পেছনে হাত দিয়ে আক্রমণকারীর কনিষ্ঠা (ছোট আঙুল) ধরে পেছনের দিকে মচকে দিন।'
      ]
    },
    {
      id: 'front_choke',
      titleEn: 'Front Chokehold / Strangling (সামনে থেকে গলা টিপে ধরলে)',
      titleBn: 'সামনে থেকে দুই হাত দিয়ে গলা টিপে ধরলে',
      situationEn: 'Attacker has hands around your throat against wall or in open space.',
      situationBn: 'আক্রমণকারী আপনার গলার নলি চেপে ধরেছে।',
      stepsEn: [
        '1. Chin Tuck: Instantly tuck your chin tight against your chest. This seals your windpipe and carotid arteries, preventing unconsciousness.',
        '2. The Windmill Arms: Raise both arms straight up in the air and pivot your whole body rapidly sideways. Your shoulders will lever their arms off your neck.',
        '3. Eye Gouge: Use both thumbs to press deeply into their eye sockets.',
        '4. Knee Strike: Bring your knee up with maximum force into their groin, then push away and sprint.'
      ],
      stepsBn: [
        '১. চিবুক বুকে নামিয়ে নিন (Chin Tuck): তৎক্ষণাৎ নিজের থুতনি বা চিবুক বুকের সাথে শক্ত করে চেপে নামান। এতে শ্বাসনালী বন্ধ হতে পারবে না।',
        '২. উইন্ডমিল কাঁধ ঘোরানো: দুই হাত ওপরে তুলে শরীর একপাশে সজোরে ঘুরিয়ে দিন। এতে আক্রমণকারীর হাতের বাঁধন ভেঙে যাবে।',
        '৩. চোখে আঙুল চাপুন: দুই বৃদ্ধাঙ্গুল দিয়ে আক্রমণকারীর চোখের কোণে জোরে চাপ দিন।',
        '৪. কুঁচকিতে হাঁটুর আঘাত: কুঁচকিতে হাঁটুর আঘাত মেরে সোজা ভিড় বা আলোর দিকে দৌড় দিন।'
      ]
    },
    {
      id: 'wall_trap',
      titleEn: 'Cornered Against Wall (দেওয়ালে কোণঠাসা করলে)',
      titleBn: 'দেওয়ালে পিঠ ঠেকিয়ে আক্রমণকারী ঘিরে ফেললে',
      situationEn: 'Pinned against a wall or obstacle with no room behind you.',
      situationBn: 'দেয়াল বা কোণে আটকে ফেলা হয়েছে এবং পেছনে যাওয়ার পথ নেই।',
      stepsEn: [
        '1. Passive Defensive Guard: Raise both hands up to chin level with open palms facing out (looks like pleading, but prepares lethal guard).',
        '2. Head Slap or Ear Clap: Clap both hands forcefully over their ears.',
        '3. Knee or Kick: Drive knee to groin or stomp kneecap.',
        '4. Pivot and Escape: Push off their chest or wall to duck under their arm and sprint out along the open wall boundary.'
      ],
      stepsBn: [
        '১. প্যাসিভ গার্ড: দুই হাত বুকের সামনে খোলা অবস্থায় রাখুন (মনে হবে ভয় পেয়েছেন, কিন্তু আপনি প্রস্তুত)।',
        '২. কানে বা চোখে আঘাত: দুই কানে একসাথে চাপড় মারুন অথবা চোখে আঙুল ঢুকিয়ে দিন।',
        '৩. হাঁটু দিয়ে কুঁচকিতে আঘাত: পেটের নিচের অংশে হাঁটু দিয়ে আঘাত করুন।',
        '৪. পাশ কাটিয়ে বেরিয়ে যান: আক্রমণকারীর হাতের নিচ দিয়ে পাশ কাটিয়ে সোজা খোলা রাস্তায় বেরিয়ে যান।'
      ]
    },
    {
      id: 'ground_pin',
      titleEn: 'Ground Pin / Knocked to the Floor (মাটিতে ফেলে দিলে)',
      titleBn: 'মাটিতে ফেলে দিলে নিজেকে রক্ষার কৌশল',
      situationEn: 'You are pushed onto the ground and attacker is on top or hovering over you.',
      situationBn: 'মাটিতে ফেলে দেওয়া হয়েছে এবং আক্রমণকারী ওপর থেকে চেপে আসার চেষ্টা করছে।',
      stepsEn: [
        '1. Never Turn on Stomach: Turn onto your back immediately. Your legs are your strongest defense.',
        '2. Bicycle Defense Shield: Keep knees bent near chest, feet pointing toward attacker. Kick violently like bicycle pedals at their shins, knees, and groin.',
        '3. Eye Scratch & Biting: If pinned closely, scratch eyes, gouge nose, or bite any exposed neck/ear flesh with maximum aggression.',
        '4. Bridge & Roll (Upa): Plant feet flat, thrust hips violently upward to unbalance them, roll to your side and scramble to your feet.'
      ],
      stepsBn: [
        '১. উপুড় হবেন না: কখনো পেটের ওপর উপুড় হয়ে শোবেন না। পিঠের ওপর চিৎ হয়ে থাকুন, কারণ আপনার পা দুটি আপনার সবচেয়ে বড় বর্ম।',
        '২. সাইকেল কিক শিল্ড: দুই পা তুলে সাইকেলের মতো সজোরে আক্রমণকারীর হাঁটু, বুক ও কুঁচকিতে লাথি চালাতে থাকুন।',
        '৩. কামড় ও আঁচড়: কাছে চলে এলে সর্বশক্তি দিয়ে মুখ, কান বা নাকে কামড় দিন এবং চোখে নখ বসিয়ে দিন।',
        '৪. হিপ ব্রিজিং: কোমর ওপরের দিকে সজোরে ধাক্কা দিয়ে আক্রমণকারীকে একদিকে উল্টে দিন এবং উঠে দৌড় দিন।'
      ]
    }
  ];

  // Improvised weapons
  const IMPROVISED_WEAPONS = [
    {
      nameEn: 'House / Vehicle Keys (চাবির গুচ্ছ)',
      nameBn: 'চাবি (Keys)',
      icon: <Key className="w-6 h-6 text-amber-500" />,
      descEn: 'Hold keys protruding firmly between knuckles in a tight fist, or hold single long key as a dagger strike tool to eyes/face.',
      descBn: 'আঙুলের ফাঁকে চাবি গুঁজে শক্ত মুষ্টি তৈরি করুন অথবা ছোরা ধরার মতো শক্ত করে ধরে চোখ বা গলায় আঘাত করুন।'
    },
    {
      nameEn: 'Sanitizer / Perfume / Deodorant Spray',
      nameBn: 'স্যানিটাইজার বা পারফিউম স্প্রে',
      icon: <Spray className="w-6 h-6 text-emerald-500" />,
      descEn: 'Spray directly into attacker’s eyes. Alcohol and aerosol propellant cause instant incapacitating blindness and severe burning.',
      descBn: 'চোখের দিকে লক্ষ্য করে সোজা স্প্রে করুন। অ্যালকোহল ও গ্যাসের কারণে আক্রমণকারী চোখে হাত দিয়ে বসে পড়বে।'
    },
    {
      nameEn: 'Heavy Backpack / Umbrella (ব্যাগ ও ছাতা)',
      nameBn: 'ব্যাগ ও ছাতা',
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      descEn: 'Use backpack as a bulletproof shield to block knife/punches. Thrust umbrella metal tip like a spear toward stomach/throat.',
      descBn: 'ব্যাগকে ঢাল হিসেবে ব্যবহার করে আঘাত প্রতিহত করুন। ছাতার চোখা ডগা দিয়ে পেটে বা গলায় সজোরে খোঁচা দিন।'
    },
    {
      nameEn: 'Smartphone Hard Corner (মোবাইলের কোণ)',
      nameBn: 'স্মার্টফোনের শক্ত কোণ',
      icon: <Smartphone className="w-6 h-6 text-rose-500" />,
      descEn: 'Hold phone firmly and hammer the metal/glass corner directly against attacker’s temple, cheekbone, or collarbone.',
      descBn: 'মোবাইলের শক্ত কোণ দিয়ে আক্রমণকারীর কপাল, গালের হাড় বা কণ্ঠাস্থির (Collarbone) ওপর হাতুড়ির মতো আঘাত করুন।'
    }
  ];

  // Dangerous street situations
  const STREET_SITUATIONS = [
    {
      titleEn: 'Suspicious Auto/Cab/Taxi (সন্দেহজনক অটো বা ট্যাক্সি)',
      titleBn: 'অটো বা ট্যাক্সিতে চালকের গতিবিধি সন্দেহজনক মনে হলে',
      rulesEn: [
        '1. Immediately call a family member loudly: "আমি গাড়ির ভেতরে আছি, গাড়ি নম্বর WB-XX-XXXX, লোকেশন শেয়ার করে দিয়েছি।"',
        '2. If driver locks doors or changes dark route: Pull emergency handbrake lever located between front seats, or kick side glass window with heel.',
        '3. Carry a sharp pin/pen to threaten driver’s neck from behind if they refuse to stop.'
      ],
      rulesBn: [
        '১. অবিলম্বে ফোনে উচ্চস্বরে আত্মীয়কে বলুন: "আমি গাড়িতে উঠেছি, গাড়ির নম্বর WB-XX-XXXX, লাইভ জিপিএস লোকেশন শেয়ার করে দিয়েছি।"',
        '২. চালক ভুল রাস্তায় গেলে: সামনের সিটের মাঝখানের হ্যান্ডব্রেক টেনে ধরুন অথবা গোড়ালি দিয়ে জানলার কাচে লাথি মারুন।',
        '৩. কলম বা শক্ত জিনিস চালকের গলার পেছনে ধরে গাড়ি অবিলম্বে জনবহুল জায়গায় থামাতে বাধ্য করুন।'
      ]
    },
    {
      titleEn: 'Being Followed on Dark Road (অন্ধকার রাস্তায় কেউ পিছু নিলে)',
      titleBn: 'নির্জন বা অন্ধকার রাস্তায় কেউ পিছু নিলে কী করবেন',
      rulesEn: [
        '1. Cross the road immediately. If they cross too, you know with 100% certainty you are being targeted.',
        '2. Turn around and make direct eye contact with assertive posture: "কার সাথে কথা বলবেন? কি চান?" (Break their stealth advantage).',
        '3. Enter ANY open lighted store, medical shop, or knock on any house gate shouting "আগুন! বাঁচাও!".'
      ],
      rulesBn: [
        '১. তৎক্ষণাৎ রাস্তার উল্টোদিকের ফুটপাথে চলে যান। সেও যদি উল্টোদিকে আসে, তবে নিশ্চিত থাকুন সে আপনাকে অনুসরণ করছে।',
        '২. সরাসরি আক্রমণকারীর চোখের দিকে তাকিয়ে বুক ফুলিয়ে দৃঢ় কণ্ঠে বলুন: "কার খোঁজ করছেন? পেছনে যাবেন না!"',
        '৩. যেকোনো খোলা দোকান, ওষুধের দোকান বা বাড়ির দরজায় নক করে সাহায্য চান।'
      ]
    },
    {
      titleEn: 'The Golden Screaming Rule: "FIRE!" (চিৎকারের গোপন নিয়ম)',
      titleBn: 'চিৎকার করার সময় "বাঁচাও" না বলে "আগুন" কেন বলবেন?',
      rulesEn: [
        'Psychological research shows people often ignore general "Help" screams out of fear of getting involved in fights.',
        'When you scream "FIRE! FIRE! আগুন! আগুন!", neighbors and bystanders rush outside immediately to protect their own safety and property, instantly surrounding the attacker with a crowd.'
      ],
      rulesBn: [
        'মনস্তাত্ত্বিক গবেষণায় প্রমাণিত: শুধু "বাঁচাও" বললে অনেকেই ঝামেলা এড়াতে দরজা বন্ধ করে দেয়।',
        'কিন্তু "আগুন! আগুন! (FIRE!)" বলে চিৎকার করলে মানুষ নিজের বাড়ি ও প্রাণ বাঁচাতে তৎক্ষণাৎ বাইরে বেরিয়ে আসে এবং আক্রমণকারী জনতার ভিড়ে ধরা পড়ে যায়।'
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 25 }}
          className="bg-slate-900 border border-red-500/40 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col text-slate-100 relative overflow-hidden my-auto"
        >
          {/* Top Bar Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/80 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-lg sm:text-xl text-white tracking-tight">
                    {isBn ? 'প্যানিক মোমেন্ট ও সম্পূর্ণ সেলফ ডিফেন্স গাইড' : 'PANIC MOMENT & SELF-DEFENSE PROTOCOL'}
                  </h2>
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/30">
                    LIFE-SAVING
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {isBn 
                    ? 'বিপদে পড়লে নিজেকে বাঁচাতে তাত্ক্ষণিক শারীরিক আঘাত, পালানোর কৌশল ও আইনি অধিকার' 
                    : 'Tactical strikes, escape maneuvers, panic breathing & legal immunity'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('PANIC_NOW')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PANIC_NOW'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? '🚨 ৪-সেকেন্ড প্যানিক অ্যাকশন' : '🚨 Panic Immediate Action'}</span>
            </button>

            <button
              onClick={() => setActiveTab('STRIKES')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'STRIKES'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-300" />
              <span>{isBn ? '🎯 দুর্বল স্থানে আঘাত (Strikes)' : '🎯 Target Vulnerable Strikes'}</span>
            </button>

            <button
              onClick={() => setActiveTab('ESCAPES')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ESCAPES'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isBn ? '🥋 আক্রমণ থেকে মুক্তি (Escapes)' : '🥋 Escape Grab Tactics'}</span>
            </button>

            <button
              onClick={() => setActiveTab('IMPROVISED_WEAPONS')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'IMPROVISED_WEAPONS'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? '🔑 হাতের কাছে অস্ত্র (Weapons)' : '🔑 Everyday Improvised Weapons'}</span>
            </button>

            <button
              onClick={() => setActiveTab('SITUATIONS')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'SITUATIONS'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-300" />
              <span>{isBn ? '🚗 গাড়ি ও রাস্তায় সতর্কতা' : '🚗 Dangerous Street Scenarios'}</span>
            </button>

            <button
              onClick={() => setActiveTab('LEGAL_RIGHTS')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'LEGAL_RIGHTS'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-teal-300" />
              <span>{isBn ? '⚖️ আত্মরক্ষার আইন (IPC 96-106)' : '⚖️ Legal Self-Defense Rights'}</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* 1. PANIC IMMEDIATE ACTION */}
            {activeTab === 'PANIC_NOW' && (
              <div className="space-y-6">
                {/* 4-4-4 Box Breathing to Stop Freeze Response */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/40 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-md">
                      <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-black border border-indigo-500/30">
                        <Wind className="w-3.5 h-3.5 animate-spin" />
                        <span>{isBn ? 'প্যানিক শক বন্ধ করুন (4-4-4 Box Breathing)' : 'De-Freeze Panic Breathing'}</span>
                      </div>
                      <h3 className="text-lg font-black text-white">
                        {isBn ? 'ভয় পেলে হাত-পা কাঁপা বন্ধ করার ৪-সেকেন্ড ব্রিদিং' : 'Stabilize Heart Rate & Restore Sharp Vision'}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {isBn 
                          ? 'হঠাৎ বিপদে পড়লে মস্তিষ্কে রক্তের চাপ বেড়ে ব্রেন ফ্রিজ (Freeze) হয়ে যায়। গোলকের ছন্দে নিশ্বাস নিন — ৪ সেকেন্ড নিশ্বাস টানুন, ৪ সেকেন্ড ধরে রাখুন, ৪ সেকেন্ড ছাড়ুন।' 
                          : 'Adrenaline spike causes tunnel vision and panic freezing. Match the expanding breathing sphere to restore split-second decision making.'}
                      </p>
                    </div>

                    {/* Animated Breathing Sphere */}
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: breathePhase === 'INHALE' ? 1.25 : breathePhase === 'HOLD' ? 1.25 : breathePhase === 'EXHALE' ? 0.85 : 0.85,
                            borderColor: breathePhase === 'HOLD' ? '#f59e0b' : breathePhase === 'INHALE' ? '#6366f1' : '#10b981'
                          }}
                          transition={{ duration: 3.8, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-full border-4 border-indigo-400 bg-indigo-600/20 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-indigo-600/30"
                        />
                        <div className="text-center relative z-10 space-y-0.5">
                          <span className="text-xl font-black text-white block">
                            {breathePhase === 'INHALE' ? (isBn ? 'নিশ্বাস নিন' : 'INHALE') :
                             breathePhase === 'HOLD' ? (isBn ? 'ধরে রাখুন' : 'HOLD') :
                             breathePhase === 'EXHALE' ? (isBn ? 'নিশ্বাস ছাড়ুন' : 'EXHALE') :
                             (isBn ? 'বিশ্রাম' : 'REST')}
                          </span>
                          <span className="text-2xl font-mono font-black text-amber-400">{breatheTimer}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant Emergency Action Arsenal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Police Siren Toggle */}
                  <button
                    onClick={handleToggleSiren}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSirenOn 
                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/40 animate-pulse'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-white/20 text-white">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40">
                        {isSirenOn ? 'ACTIVE' : 'READY'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-white">
                        {isSirenOn ? (isBn ? 'সাইরেন বন্ধ করুন' : 'STOP POLICE SIREN') : (isBn ? 'পুলিশ সাইরেন বাজান' : 'LOUD POLICE SIREN')}
                      </h4>
                      <p className="text-[11px] opacity-80 mt-0.5">
                        {isBn ? 'আক্রমণকারীকে ভয় দেখাতে উচ্চমাত্রার অ্যালার্ম' : 'Blare loud PCR van acoustic horn'}
                      </p>
                    </div>
                  </button>

                  {/* Defense Strobe Trigger */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTacticalStrobe?.();
                    }}
                    className="p-4 rounded-2xl border bg-amber-950/40 hover:bg-amber-950/60 border-amber-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950">
                        <Flashlight className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        BLINDING
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-amber-200">
                        {isBn ? 'ট্যাকটিক্যাল ফ্ল্যাশ স্ট্রোব' : 'Tactical Strobe Flash'}
                      </h4>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        {isBn ? 'চোখে আলো ফেলে সাময়িক অন্ধ করার ব্লিঙ্ক' : 'Strobe light to blind attacker in dark'}
                      </p>
                    </div>
                  </button>

                  {/* Fake Escape Call */}
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFakeCall?.();
                    }}
                    className="p-4 rounded-2xl border bg-indigo-950/40 hover:bg-indigo-950/60 border-indigo-500/40 text-left transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        SIMULATION
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-indigo-200">
                        {isBn ? 'ফেক রেসকিউ কল (Fake Call)' : 'Fake Rescue Call'}
                      </h4>
                      <p className="text-[11px] text-indigo-300/80 mt-0.5">
                        {isBn ? 'পুলিশ বা বাবার নকল ফোন এনে পালানোর সুযোগ' : 'Simulate incoming call to safely escape'}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Instant Synthesized Voice Shouting Buttons */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-300">
                    <Volume2 className="w-4 h-4 text-red-400" />
                    <span>{isBn ? 'উচ্চস্বরে ভয়েস চিৎকার শুনিয়ে দৃষ্টি আকর্ষণ করুন (Loud Simulated Shouts):' : 'Play Loud Synthesized Voice Distraction Shouts:'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleShoutVoice('FIRE')}
                      className="py-2.5 px-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>"আগুন! আগুন! বাঁচাও!" (FIRE!)</span>
                    </button>

                    <button
                      onClick={() => handleShoutVoice('POLICE')}
                      className="py-2.5 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Radio className="w-4 h-4 text-blue-400" />
                      <span>"পুলিশ! ১১২ তে ফোন করুন!"</span>
                    </button>

                    <button
                      onClick={() => handleShoutVoice('STOP')}
                      className="py-2.5 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>"পেছনে যান! পুলিশ ডাকছি!"</span>
                    </button>
                  </div>
                </div>

                {/* 5-Second Sprint Rule Callout */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-emerald-300">
                      {isBn ? 'গোল্ডেন রুল: ৫ সেকেন্ডের মধ্যে আঘাত ও দৌড় (The 5-Second Sprint Rule)' : 'The 5-Second Sprint Escape Rule'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isBn
                        ? 'আপনার লক্ষ্য কখনো আক্রমণকারীর সাথে মারামারি জেতা নয়। আপনার একমাত্র লক্ষ্য হলো শরীরের কোনো একটি দুর্বল স্থানে (চোখ/কুঁচকি/গলা) সর্বোচ্চ শক্তিতে একটি মোক্ষম আঘাত হানা এবং সে হতভম্ব হওয়ার সাথে সাথেই আলো ও মানুষের দিকে দৌড় দেওয়া।'
                        : 'Self-defense is NOT martial arts fighting. Your sole mission is 1 explosive disabling strike to a vulnerable nerve center, followed by a relentless 5-second sprint to safety.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TARGET VULNERABLE STRIKES */}
            {activeTab === 'STRIKES' && (
              <div className="space-y-6">
                <div className="text-xs text-slate-400 font-medium">
                  {isBn
                    ? 'আক্রমণকারী যত শক্তিশালীই হোক না কেন, মানুষের শরীরের এই অঙ্গগুলোতে আঘাত করলে সে মুহূর্তের মধ্যে শক্তি হারায়:'
                    : 'Regardless of the attacker’s size or strength, striking these vital anatomical weak points immediately incapacitates them:'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left List of Strike Points */}
                  <div className="space-y-2 md:col-span-1">
                    {VULNERABLE_STRIKES.map((strike) => (
                      <button
                        key={strike.id}
                        onClick={() => setSelectedStrikeId(strike.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedStrikeId === strike.id
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block">{strike.nameEn.split('(')[0]}</span>
                          <span className="text-[10px] opacity-75">{strike.zone}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                      </button>
                    ))}
                  </div>

                  {/* Right Detailed Technique Viewer */}
                  <div className="md:col-span-2">
                    {(() => {
                      const strike = VULNERABLE_STRIKES.find(s => s.id === selectedStrikeId) || VULNERABLE_STRIKES[0];
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="font-black text-base text-white">{strike.nameEn}</h3>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full font-bold border border-red-500/30">
                              {strike.damage}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                                {isBn ? 'কীভাবে আঘাত করবেন (How to Strike):' : 'How to Strike Effectively:'}
                              </h4>
                              <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-900 p-3 rounded-xl border border-slate-800">
                                {isBn ? strike.techniqueBn : strike.techniqueEn}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                {isBn ? 'আক্রমণকারীর শারীরিক প্রতিক্রিয়া (Instant Physiological Effect):' : 'Instant Effect:'}
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                                {isBn ? strike.effectBn : strike.effectEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 3. ESCAPE TACTICS */}
            {activeTab === 'ESCAPES' && (
              <div className="space-y-6">
                <div className="text-xs text-slate-400 font-medium">
                  {isBn
                    ? 'আক্রমণকারী হাত ধরলে, গলা টিপলে বা পেছন থেকে জড়িয়ে ধরলে মুক্তির সুনির্দিষ্ট শারীরিক কৌশলসমূহ:'
                    : 'Step-by-step leverage and physical maneuvers to break out of common violent holds:'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left List of Escapes */}
                  <div className="space-y-2 md:col-span-1">
                    {ESCAPE_TACTICS.map((escape) => (
                      <button
                        key={escape.id}
                        onClick={() => setSelectedEscapeId(escape.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedEscapeId === escape.id
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-black">{isBn ? escape.titleBn : escape.titleEn}</span>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                      </button>
                    ))}
                  </div>

                  {/* Right Escape Steps Viewer */}
                  <div className="md:col-span-2">
                    {(() => {
                      const escape = ESCAPE_TACTICS.find(e => e.id === selectedEscapeId) || ESCAPE_TACTICS[0];
                      const steps = isBn ? escape.stepsBn : escape.stepsEn;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
                          <div className="border-b border-slate-800 pb-3">
                            <h3 className="font-black text-base text-emerald-300">{isBn ? escape.titleBn : escape.titleEn}</h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {isBn ? escape.situationBn : escape.situationEn}
                            </p>
                          </div>

                          <div className="space-y-2.5">
                            {steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 4. IMPROVISED WEAPONS */}
            {activeTab === 'IMPROVISED_WEAPONS' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-medium">
                  {isBn
                    ? 'আপনার ব্যাগে বা পকেটে থাকা সাধারণ জিনিসগুলোকে কীভাবে তাৎক্ষণিক আত্মরক্ষার অস্ত্রে রূপান্তর করবেন:'
                    : 'Turn ordinary everyday pocket and purse items into high-impact self-defense weapons:'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {IMPROVISED_WEAPONS.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-white">{isBn ? item.nameBn : item.nameEn}</h4>
                          <span className="text-[10px] text-amber-400 font-bold uppercase">Tactical Improvised Weapon</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800/60 font-medium">
                        {isBn ? item.descBn : item.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. STREET SITUATIONS */}
            {activeTab === 'SITUATIONS' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-medium">
                  {isBn
                    ? 'রাস্তা, অটো/ট্যাক্সি ও নির্জন স্থানে বিপদ মোকাবিলার নিয়মাবলী:'
                    : 'Street-smart defense protocols when travelling in cabs, walking dark alleys, or facing stalkers:'}
                </div>

                <div className="space-y-4">
                  {STREET_SITUATIONS.map((sit, idx) => {
                    const rules = isBn ? sit.rulesBn : sit.rulesEn;
                    return (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-3">
                        <h4 className="font-black text-sm text-purple-300 flex items-center gap-2">
                          <Compass className="w-4 h-4 text-purple-400" />
                          <span>{isBn ? sit.titleBn : sit.titleEn}</span>
                        </h4>
                        <div className="space-y-2">
                          {rules.map((rule, rIdx) => (
                            <div key={rIdx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
                              {rule}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. LEGAL RIGHTS */}
            {activeTab === 'LEGAL_RIGHTS' && (
              <div className="space-y-4">
                <div className="bg-teal-950/40 border border-teal-500/30 p-5 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-teal-300 font-black text-sm">
                    <Scale className="w-5 h-5 text-teal-400" />
                    <span>{isBn ? 'ভারতের আইনে আত্মরক্ষার পূর্ণ অধিকার (IPC Sections 96 to 106 / BNS)' : 'Right of Private Defence Under Indian Law'}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {isBn
                      ? 'ভারতীয় দণ্ডবিধি (IPC 96-106) এবং ভারতীয় ন্যায় সংহিতা (BNS) অনুযায়ী নিজের জীবন, সম্ভ্রম বা শরীরের মারাত্মক ক্ষতি ঠেকাতে যেকোনো নারী শারীরিক বল প্রয়োগ করতে পারেন। এতে আক্রমণকারী গুরুতর আহত হলেও তা কোনো অপরাধ নয় (১০০% আইনসঙ্গত ও শাস্তিহীন)।'
                      : 'The Indian Penal Code (Sections 96 to 106) and Bharatiya Nyaya Sanhita explicitly guarantee the Right of Private Defence of Body. When facing assault, rape threat, grievous hurt, or kidnapping, the law grants complete immunity for inflicting even fatal harm to save oneself.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                    <h5 className="font-black text-xs text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isBn ? 'জিরো এফআইআর (Zero FIR) অধিকার' : 'Zero FIR Mandate'}</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? 'ঘটনাস্থল যেখানেই হোক, যেকোনো পুলিশ স্টেশন তাৎক্ষণিক এফআইআর নিতে বাধ্য। সীমানার অজুহাতে ফিরিয়ে দেওয়া সম্পূর্ণ বেআইনি।'
                        : 'Any police station must register an FIR immediately regardless of territorial jurisdiction.'}
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                    <h5 className="font-black text-xs text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isBn ? 'মহিলা কনস্টেবল ও গোপনীয়তা' : 'Female Officer & Privacy'}</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      {isBn
                        ? 'কোনো নারীর জবানবন্দি কেবল মহিলা পুলিশ কর্মকর্তার উপস্থিতিতে এবং পরিচয় সম্পূর্ণ গোপন রেখে গ্রহণ করতে হবে।'
                        : 'Victim statements must be recorded by a female officer with 100% identity protection.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
