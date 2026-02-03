# Kaushal Mitra (कौशल मित्र) — Design Document

> Voice-First AI Career Counselor for Bharat

**Version:** 1.0
**Date:** 2026-02-01
**Track:** AI for Communities, Access & Public Impact

---

## 1. Executive Summary

Kaushal Mitra is a voice-first AI career counselor that helps Indian youth discover their skills, find relevant training, practice for interviews, and connect with job opportunities — all through WhatsApp voice notes or IVR calls in any of India's 22 scheduled languages.

**One-liner:**
> *"India's first voice-first career counselor — helping 300M youth discover skills, learn for free, and find jobs, in all 22 Indian languages, without downloading an app."*

---

## 2. Problem Statement

### 2.1 The Youth Employment Crisis

| Statistic | Value | Source |
|-----------|-------|--------|
| Population under 35 | 65% | Census |
| Youth unemployment (15-24) | 31% | ILO 2024 |
| Workforce in informal sector | 83% | NSSO |
| Formally skill-trained | 2.3% | Skill India |
| Rural youth in unskilled migration | 70% | NSDC |

### 2.2 Why Current Solutions Fail

| Solution | Failure Mode |
|----------|--------------|
| **Job portals (Naukri, Indeed)** | English-first, resume-heavy, urban jobs only |
| **Skill India portal** | Complex navigation, no personalization |
| **NSDC courses** | Discovery broken — youth don't know what exists |
| **Career counselors** | 1 counselor per 10,000+ students in rural areas |
| **Recruiters** | Only reach tier-1 cities |

### 2.3 Core Insight

> Rural and semi-urban youth don't lack ambition — they lack **discovery** and **navigation**. They don't know what skills are valuable, what training exists, or how to access opportunities.

---

## 3. Solution Overview

### 3.1 What Is Kaushal Mitra?

A WhatsApp/IVR-based voice AI that acts as a personal career counselor for anyone seeking employment — from rural daily-wage workers to urban job seekers.

### 3.2 User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        KAUSHAL MITRA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ DISCOVER │───▶│  LEARN   │───▶│ PREPARE  │───▶│ CONNECT  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                 │
│  "What can      "Here's a       "Let's          "Here are 5   │
│   I do?"         free course"    practice"       jobs for you" │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 The Four Phases

#### Phase 1: DISCOVER — Skill Assessment via Conversation

```
User: "Main 10th pass hoon, gaon mein kaam dhundh raha hoon"
      (I'm 10th pass, looking for work in village)

AI:   "Achha! Pehle batao — kya tumne kabhi mobile phone
       repair kiya hai? Ya koi electrical kaam?"
      (Good! First tell me — have you ever repaired mobiles?
       Or done any electrical work?)
```

Through 5-7 conversational questions, extracts:
- Education level
- Existing skills (formal + informal)
- Location preference (local / willing to migrate)
- Work type preference (gig / full-time / self-employment)

#### Phase 2: LEARN — Personalized Skill Recommendations

```
AI:   "Tumhare skills ke hisaab se, yeh 3 courses free hain:
       1. Mobile Repair — NSDC, 2 weeks
       2. Electrician — Skill India, 1 month
       3. Data Entry — NPTEL, 3 weeks

       Kaun sa sunna hai? Bolo ya number dabaao"
```

RAG pulls from:
- NSDC / Skill India courses
- NPTEL free courses
- YouTube verified playlists
- Local ITI programs

#### Phase 3: PREPARE — Mock Interviews & Resume Building

```
User: "Mujhe interview ki practice karni hai"

AI:   "Theek hai. Main interviewer hoon. Shuru karte hain.
       Apna introduction do — naam, qualification, experience."
```

For urban/formal jobs:
- Auto-generates resume from conversation data
- Sends PDF via WhatsApp
- Provides interview tips specific to role

#### Phase 4: CONNECT — Job Matching

```
AI:   "Tumhare area mein 4 jobs mili hain:
       1. Delivery boy — Zepto, ₹15,000/month
       2. Electrician helper — local contractor
       3. Mobile shop — Jaipur, ₹12,000 + training

       Kisi ke baare mein detail sunni hai?"
```

Sources:
- Local classified aggregation
- Gig platforms (Swiggy, Zomato, Urban Company)
- Government job portals
- Direct employer partnerships

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐          ┌─────────────┐          ┌───────────┐  │
│   │  WhatsApp   │          │   IVR/Call  │          │  Web App  │  │
│   │  (Primary)  │          │  (Fallback) │          │ (Optional)│  │
│   └──────┬──────┘          └──────┬──────┘          └─────┬─────┘  │
│          │                        │                       │        │
└──────────┼────────────────────────┼───────────────────────┼────────┘
           │                        │                       │
           ▼                        ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         VOICE PROCESSING LAYER                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐              ┌─────────────────┐             │
│   │   Bhashini ASR  │              │   Bhashini TTS  │             │
│   │  (Speech → Text)│              │  (Text → Speech)│             │
│   │                 │              │                 │             │
│   │  22 Scheduled   │              │  Natural voice  │             │
│   │  Languages      │              │  in same lang   │             │
│   └────────┬────────┘              └────────▲────────┘             │
│            │                                │                       │
└────────────┼────────────────────────────────┼───────────────────────┘
             │                                │
             ▼                                │
┌─────────────────────────────────────────────────────────────────────┐
│                         AI BRAIN LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │                    ORCHESTRATOR (LangChain)                │    │
│   │                                                            │    │
│   │  • Conversation state management                          │    │
│   │  • Intent classification                                  │    │
│   │  • Tool/Agent routing                                     │    │
│   │  • Language detection & maintenance                       │    │
│   └───────────────────────────────────────────────────────────┘    │
│                              │                                      │
│        ┌─────────────────────┼─────────────────────┐               │
│        ▼                     ▼                     ▼               │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐           │
│   │ SKILL   │          │ COURSE  │          │   JOB   │           │
│   │ AGENT   │          │ AGENT   │          │  AGENT  │           │
│   │         │          │         │          │         │           │
│   │ Extract │          │ Match   │          │ Search  │           │
│   │ profile │          │ courses │          │ & rank  │           │
│   └────┬────┘          └────┬────┘          └────┬────┘           │
│        │                    │                    │                 │
└────────┼────────────────────┼────────────────────┼─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         RAG / DATA LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│   │   COURSES   │   │    JOBS     │   │   USER      │              │
│   │   Vector DB │   │   Database  │   │  PROFILES   │              │
│   │             │   │             │   │             │              │
│   │ • NSDC      │   │ • Local     │   │ • Skills    │              │
│   │ • NPTEL     │   │ • Gig apps  │   │ • History   │              │
│   │ • YouTube   │   │ • Govt jobs │   │ • Prefs     │              │
│   │ • ITI/Poly  │   │ • Employers │   │ • Language  │              │
│   └─────────────┘   └─────────────┘   └─────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Details

#### 4.2.1 User Interface Layer

| Channel | Target Users | Implementation |
|---------|--------------|----------------|
| **WhatsApp** | Smartphone users (primary) | WhatsApp Business API |
| **IVR** | Feature phone users | Twilio Programmable Voice |
| **Web** | Desktop users (optional) | Next.js PWA |

#### 4.2.2 Voice Processing Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| **ASR** | Bhashini Speech-to-Text | Convert voice to text in 22 languages |
| **TTS** | Bhashini Text-to-Speech | Convert response to natural voice |
| **Language Detection** | Bhashini NLU | Auto-detect user's language |

#### 4.2.3 AI Brain Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Orchestrator** | LangChain/LangGraph | Manage conversation flow, route to agents |
| **Skill Agent** | GPT-4/Claude + Prompts | Extract skills through conversation |
| **Course Agent** | LLM + RAG | Match user profile to courses |
| **Job Agent** | LLM + RAG | Match user to job opportunities |

#### 4.2.4 Data Layer

| Store | Technology | Contents |
|-------|------------|----------|
| **Vector DB** | ChromaDB → Pinecone | Course embeddings, job embeddings |
| **User DB** | PostgreSQL (Supabase) | User profiles, conversation history |
| **Cache** | Redis | Session state, API responses |

---

## 5. Data Flow

### 5.1 Voice Message Flow

```
┌──────┐    Voice Note     ┌──────────┐    Audio      ┌──────────┐
│ User │ ───────────────▶  │ WhatsApp │ ───────────▶  │  Server  │
└──────┘                   │   API    │               └────┬─────┘
                           └──────────┘                    │
                                                           ▼
                                                    ┌──────────────┐
                                                    │ Bhashini ASR │
                                                    │ (Hindi text) │
                                                    └──────┬───────┘
                                                           │
                                                           ▼
                                                    ┌──────────────┐
                                                    │  LangChain   │
                                                    │ Orchestrator │
                                                    └──────┬───────┘
                                                           │
                         ┌─────────────────────────────────┼─────────────────────────────────┐
                         │                                 │                                 │
                         ▼                                 ▼                                 ▼
                  ┌─────────────┐                  ┌─────────────┐                  ┌─────────────┐
                  │ Skill Agent │                  │Course Agent │                  │  Job Agent  │
                  └─────────────┘                  └─────────────┘                  └─────────────┘
                         │                                 │                                 │
                         └─────────────────────────────────┼─────────────────────────────────┘
                                                           │
                                                           ▼
                                                    ┌──────────────┐
                                                    │   Response   │
                                                    │  Generator   │
                                                    └──────┬───────┘
                                                           │
                                                           ▼
                                                    ┌──────────────┐
                                                    │ Bhashini TTS │
                                                    │ (Hindi audio)│
                                                    └──────┬───────┘
                                                           │
┌──────┐    Voice Reply    ┌──────────┐    Audio           │
│ User │ ◀───────────────  │ WhatsApp │ ◀──────────────────┘
└──────┘                   │   API    │
                           └──────────┘
```

### 5.2 Conversation State Machine

```
                              ┌───────────────┐
                              │   GREETING    │
                              │ Language Set  │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   DISCOVERY   │◀─────────────┐
                              │ Skill Questions│             │
                              └───────┬───────┘              │
                                      │                      │
                                      ▼                      │
                              ┌───────────────┐              │
                              │    PROFILE    │              │
                              │   Complete    │              │
                              └───────┬───────┘              │
                                      │                      │
                    ┌─────────────────┼─────────────────┐    │
                    │                 │                 │    │
                    ▼                 ▼                 ▼    │
            ┌───────────┐     ┌───────────┐     ┌───────────┐│
            │  COURSES  │     │   JOBS    │     │ INTERVIEW ││
            │  Matching │     │  Matching │     │  Practice ││
            └─────┬─────┘     └─────┬─────┘     └─────┬─────┘│
                  │                 │                 │      │
                  └─────────────────┼─────────────────┘      │
                                    │                        │
                                    ▼                        │
                              ┌───────────────┐              │
                              │   FOLLOW-UP   │──────────────┘
                              │   & Refine    │
                              └───────────────┘
```

---

## 6. Key Design Decisions

### 6.1 Why Voice-First?

| Reason | Impact |
|--------|--------|
| Low literacy barrier | 25% adult illiteracy in rural India |
| Natural interaction | Speaking > typing for most Indians |
| Works on 2G | Voice notes work on low bandwidth |
| No app install | WhatsApp already on 500M+ phones |
| Inclusive | Works for visually impaired users |

### 6.2 Why WhatsApp Primary, IVR Secondary?

| Channel | Pros | Cons |
|---------|------|------|
| **WhatsApp** | Rich media, async, free for user | Needs smartphone |
| **IVR** | Works on any phone | Synchronous, per-minute cost |

Strategy: WhatsApp for 80% of users, IVR as fallback for feature phones.

### 6.3 Why 22 Languages from Day 1?

- Bhashini provides all 22 scheduled languages at no extra cost
- True inclusion — not just Hindi-English
- Major differentiator vs. existing solutions
- Aligns with government Digital India mission

### 6.4 Why Conversational Skill Extraction (No Resume)?

| Traditional Approach | Our Approach |
|---------------------|--------------|
| Upload resume | Talk about your experience |
| Requires literacy | Voice-based |
| Formal skills only | Captures informal skills |
| Intimidating | Friendly conversation |

---

## 7. User Experience Design

### 7.1 Conversation Principles

1. **Warm & Friendly**: Like talking to an elder sibling, not a government office
2. **Simple Language**: No jargon, 8th-grade vocabulary
3. **One Thing at a Time**: Never ask multiple questions
4. **Confirm Understanding**: Repeat back what user said
5. **Always Provide Options**: "Do you want A, B, or something else?"

### 7.2 Sample Conversation Flow

```
[User sends voice note in Hindi]
User: "Namaste, mujhe kaam chahiye"
      (Hello, I need work)

AI:   "Namaste! Main Kaushal Mitra hoon, tumhara career guide.
       Pehle batao, tumne kitni padhai ki hai?"
      (Hello! I'm Kaushal Mitra, your career guide.
       First tell me, how much have you studied?)

User: "12th pass hoon, science se"
      (12th pass, science stream)

AI:   "Bahut achha! 12th science matlab bahut options hain.
       Kya tum computer ya mobile chala lete ho?"
      (Very good! 12th science means many options.
       Can you use computers or mobiles?)

User: "Haan, mobile toh achhe se chalata hoon, thoda computer bhi"
      (Yes, I use mobile well, some computer too)

AI:   "Perfect! Ab batao — kaam kahan chahiye?
       1. Apne gaon/sheher mein
       2. Kisi bade sheher mein
       3. Ghar se online kaam"
      (Perfect! Now tell me — where do you want work?
       1. In your village/town
       2. In a big city
       3. Online work from home)

User: "Ghar se online ho toh achha hai"
      (Online from home would be good)

AI:   "Samajh gaya. Online kaam ke liye yeh 3 courses free hain:
       1. Data Entry — NPTEL, 2 hafte
       2. Digital Marketing — Skill India, 1 mahina
       3. Graphic Design basics — YouTube course

       Kaunsa sunna hai? Number bolo ya naam bolo."
      (Understood. For online work, these 3 courses are free:
       1. Data Entry — NPTEL, 2 weeks
       2. Digital Marketing — Skill India, 1 month
       3. Graphic Design basics — YouTube course

       Which one to hear about? Say the number or name.)
```

### 7.3 Error Handling

| Scenario | Response |
|----------|----------|
| **Unclear audio** | "Sorry, awaaz clear nahi aayi. Ek baar phir bolo?" |
| **Off-topic** | "Main sirf career aur jobs mein help kar sakta hoon. Kaam dhundhne mein madad chahiye?" |
| **Language switch** | Auto-detect and switch, confirm: "Tamil mein baat karein?" |
| **No match found** | "Abhi exact match nahi mila, lekin yeh similar options hain..." |

---

## 8. Security & Privacy

### 8.1 Data Handling

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Voice recordings | Processed, not stored | Deleted after transcription |
| User profile | Encrypted in DB | Until user deletes |
| Conversation logs | Anonymized | 30 days |
| Phone number | Hashed | For session management only |

### 8.2 Privacy Principles

1. **Minimal Data**: Only collect what's needed
2. **User Control**: Delete profile anytime via voice command
3. **No Selling**: Never share data with third parties
4. **Transparency**: Tell users what we store

---

## 9. Success Metrics

### 9.1 Primary Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| Monthly Active Users | 10,000 |
| Skill Profiles Created | 5,000 |
| Course Enrollments | 2,000 |
| Job Applications Sent | 500 |
| Jobs Secured (tracked) | 100 |

### 9.2 Quality Metrics

| Metric | Target |
|--------|--------|
| Conversation Completion Rate | >70% |
| User Return Rate (7-day) | >40% |
| Course Completion Rate | >30% |
| NPS Score | >50 |

---

## 10. Future Roadmap

### Phase 2

- [ ] Employer dashboard for job posting
- [ ] Resume PDF generation
- [ ] Certificate verification via DigiLocker
- [ ] Integration with gig platforms (Swiggy, Zomato, Urban Company)

### Phase 3 (Scale)

- [ ] Government partnership (NSDC, Skill India)
- [ ] Employer partnerships for direct hiring
- [ ] Skill certification through the platform
- [ ] Regional job fairs integration

---

## 11. Appendix

### 11.1 Supported Languages (Bhashini)

| # | Language | Script |
|---|----------|--------|
| 1 | Assamese | অসমীয়া |
| 2 | Bengali | বাংলা |
| 3 | Bodo | बड़ो |
| 4 | Dogri | डोगरी |
| 5 | Gujarati | ગુજરાતી |
| 6 | Hindi | हिन्दी |
| 7 | Kannada | ಕನ್ನಡ |
| 8 | Kashmiri | कॉशुर |
| 9 | Konkani | कोंकणी |
| 10 | Maithili | मैथिली |
| 11 | Malayalam | മലയാളം |
| 12 | Manipuri | মৈতৈলোন্ |
| 13 | Marathi | मराठी |
| 14 | Nepali | नेपाली |
| 15 | Odia | ଓଡ଼ିଆ |
| 16 | Punjabi | ਪੰਜਾਬੀ |
| 17 | Sanskrit | संस्कृतम् |
| 18 | Santali | ᱥᱟᱱᱛᱟᱲᱤ |
| 19 | Sindhi | سنڌي |
| 20 | Tamil | தமிழ் |
| 21 | Telugu | తెలుగు |
| 22 | Urdu | اردو |

### 11.2 References

- Bhashini API Documentation: https://bhashini.gov.in/
- NSDC Course Catalog: https://www.nsdcindia.org/
- NPTEL Courses: https://nptel.ac.in/
- Skill India Portal: https://www.skillindia.gov.in/
