# Sahaj (सहज): Voice-First AI Career Counselor - Requirements

> Functional and Non-Functional Requirements

**Version:** 1.0  
**Date:** 2026-02-01  
**Track:** AI for Communities, Access & Public Impact

---

## 1. Product Requirements

### 1.1 Vision Statement

Sahaj enables any Indian youth to access career guidance, skill training, and job opportunities through voice conversations in their native language — without needing a smartphone app, internet literacy, or a resume.

**One-liner:**
> *"India's first voice-first career counselor — helping 300M youth discover skills, learn for free, and find jobs, in all 22 Indian languages, without downloading an app."*

### 1.2 Problem Statement

#### The Youth Employment Crisis

| Statistic | Value | Source |
|-----------|-------|--------|
| Population under 35 | 65% | Census |
| Youth unemployment (15-24) | 31% | ILO 2024 |
| Workforce in informal sector | 83% | NSSO |
| Formally skill-trained | 2.3% | Skill India |
| Rural youth in unskilled migration | 70% | NSDC |

#### Why Current Solutions Fail

| Solution | Failure Mode |
|----------|--------------|
| **Job portals (Naukri, Indeed)** | English-first, resume-heavy, urban jobs only |
| **Skill India portal** | Complex navigation, no personalization |
| **NSDC courses** | Discovery broken — youth don't know what exists |
| **Career counselors** | 1 counselor per 10,000+ students in rural areas |
| **Recruiters** | Only reach tier-1 cities |

#### Core Insight

> Rural and semi-urban youth don't lack ambition, they lack **discovery** and **navigation**. They don't know what skills are valuable, what training exists, or how to access opportunities.

### 1.3 Solution Vision

A WhatsApp/IVR-based voice AI that acts as a personal career counselor for anyone seeking employment — from rural daily-wage workers to urban job seekers.

#### The Four Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                        SAHAJ                                    │
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

### 1.4 Target Users

| User Segment | Demographics | Characteristics |
|--------------|--------------|-----------------|
| **Primary** | Rural youth 18-25 | 10th/12th pass, limited English, smartphone with WhatsApp |
| **Secondary** | Semi-urban youth 18-30 | Some college, Hindi + regional language, seeking better jobs |
| **Tertiary** | Urban job seekers | Graduate, comfortable with English, needs interview prep |
| **Edge Case** | Feature phone users | No smartphone, uses IVR fallback |

## 2. User Stories

### 2.1 Epic 1: Skill Discovery

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-1.1 | Rural youth | Tell the AI about my experience in my language | It understands what I can do |
| US-1.2 | User | Answer simple questions about my background | My skills are captured without filling forms |
| US-1.3 | User | Have the AI recognize informal skills (farming, repair work) | All my abilities are valued |
| US-1.4 | User | See a summary of my skill profile | I know what the system understood |

### 2.2 Epic 2: Course Discovery & Learning

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-2.1 | User | Get course recommendations matching my skills | I know what to learn next |
| US-2.2 | User | Hear course details (duration, provider, cost) via voice | I can decide without reading |
| US-2.3 | User | Receive course links on WhatsApp | I can enroll easily |
| US-2.4 | User | Get free course options first | Cost is not a barrier |
| US-2.5 | User | Learn about courses from NSDC, NPTEL, YouTube | I have variety |

### 2.3 Epic 3: Interview Preparation

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-3.1 | User | Practice mock interviews via voice | I'm prepared for real interviews |
| US-3.2 | User | Get feedback on my answers | I can improve |
| US-3.3 | User | Practice in my regional language | I'm comfortable |
| US-3.4 | User | Get a resume generated from my profile | I have professional documentation |
| US-3.5 | Urban user | Get resume as PDF on WhatsApp | I can share with employers |

### 2.4 Epic 4: Job Matching

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-4.1 | User | Get job recommendations matching my skills | I find relevant opportunities |
| US-4.2 | User | Filter jobs by location (local vs. distant) | I control where I work |
| US-4.3 | User | See gig economy options (delivery, services) | I have flexible options |
| US-4.4 | User | Hear job details (salary, requirements) | I can evaluate fit |
| US-4.5 | User | Get contact info or application link | I can apply directly |

### 2.5 Epic 5: Multilingual Voice Interface

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-5.1 | User | Speak in any of 22 Indian languages | Language is not a barrier |
| US-5.2 | User | Have the AI respond in my language | I understand clearly |
| US-5.3 | User | Switch languages mid-conversation | I can use my most comfortable language |
| US-5.4 | Feature phone user | Call a number and interact via voice | I don't need a smartphone |

## 3. Functional Requirements

### 3.1 Voice Input/Output

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-V1 | System SHALL accept voice notes via WhatsApp Business API | P0 |
| FR-V2 | System SHALL transcribe voice to text using Sarvam AI ASR | P0 |
| FR-V3 | System SHALL support all 22 scheduled Indian languages | P0 |
| FR-V4 | System SHALL convert text responses to speech using Sarvam AI TTS | P0 |
| FR-V5 | System SHALL auto-detect user's language from first message | P0 |
| FR-V6 | System SHALL maintain language consistency within a session | P0 |
| FR-V7 | System SHALL support IVR fallback via Twilio | P1 |
| FR-V8 | System SHALL handle code-mixed speech (Hinglish, etc.) | P1 |

### 3.2 Conversation Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-C1 | System SHALL maintain conversation context across messages | P0 |
| FR-C2 | System SHALL handle multi-turn conversations (up to 50 turns) | P0 |
| FR-C3 | System SHALL gracefully handle unclear audio | P0 |
| FR-C4 | System SHALL allow users to restart conversation | P0 |
| FR-C5 | System SHALL persist user profile across sessions | P0 |
| FR-C6 | System SHALL handle conversation timeouts (30 min inactivity) | P1 |
| FR-C7 | System SHALL support conversation history recall | P2 |

### 3.3 Skill Extraction

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-S1 | System SHALL extract education level from conversation | P0 |
| FR-S2 | System SHALL extract work experience (formal & informal) | P0 |
| FR-S3 | System SHALL extract location preferences | P0 |
| FR-S4 | System SHALL extract job type preferences (gig/full-time) | P0 |
| FR-S5 | System SHALL map extracted skills to standard skill taxonomy | P1 |
| FR-S6 | System SHALL allow users to update their profile | P1 |
| FR-S7 | System SHALL validate extracted information with user | P0 |

### 3.4 Course Recommendation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CR1 | System SHALL recommend courses based on user profile | P0 |
| FR-CR2 | System SHALL prioritize free courses | P0 |
| FR-CR3 | System SHALL include NSDC, NPTEL, YouTube courses | P0 |
| FR-CR4 | System SHALL provide course details (duration, provider, cost) | P0 |
| FR-CR5 | System SHALL send course links via WhatsApp | P0 |
| FR-CR6 | System SHALL filter courses by language availability | P1 |
| FR-CR7 | System SHALL track course enrollment (when possible) | P2 |

### 3.5 Interview Preparation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-I1 | System SHALL conduct mock interviews via voice | P1 |
| FR-I2 | System SHALL provide feedback on interview responses | P1 |
| FR-I3 | System SHALL offer role-specific interview questions | P1 |
| FR-I4 | System SHALL generate resume from profile data | P1 |
| FR-I5 | System SHALL send resume PDF via WhatsApp | P1 |
| FR-I6 | System SHALL support interview practice in regional languages | P1 |

### 3.6 Job Matching

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-J1 | System SHALL match users to job listings | P1 |
| FR-J2 | System SHALL filter jobs by location | P1 |
| FR-J3 | System SHALL include gig economy opportunities | P1 |
| FR-J4 | System SHALL provide job details (salary, requirements) | P1 |
| FR-J5 | System SHALL provide application links or contact info | P1 |
| FR-J6 | System SHALL update job listings regularly | P2 |

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P1 | Voice-to-response latency | < 5 seconds |
| NFR-P2 | ASR processing time | < 2 seconds |
| NFR-P3 | TTS generation time | < 2 seconds |
| NFR-P4 | LLM response time | < 3 seconds |
| NFR-P5 | System availability | 99% uptime |
| NFR-P6 | Concurrent users supported | 100 (MVP), 10,000 (scale) |

### 4.2 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-S1 | Handle 1,000 daily conversations (MVP) | Day 1 |
| NFR-S2 | Scale to 100,000 daily conversations | 6 months |
| NFR-S3 | Horizontal scaling for API servers | Supported |
| NFR-S4 | Database read replicas | Supported |

### 4.3 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R1 | Message delivery guarantee | At-least-once |
| NFR-R2 | Graceful degradation on API failure | Fallback responses |
| NFR-R3 | Data backup frequency | Daily |
| NFR-R4 | Recovery time objective (RTO) | < 4 hours |
| NFR-R5 | Recovery point objective (RPO) | < 1 hour |

### 4.4 Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SEC1 | Data encryption at rest | AES-256 |
| NFR-SEC2 | Data encryption in transit | TLS 1.3 |
| NFR-SEC3 | Phone number hashing | SHA-256 |
| NFR-SEC4 | Voice recordings | Not stored after processing |
| NFR-SEC5 | API authentication | API keys + rate limiting |
| NFR-SEC6 | User data deletion on request | < 24 hours |

### 4.5 Accessibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-A1 | Voice-only interaction | Full functionality |
| NFR-A2 | Works on 2G networks | Voice notes < 1MB |
| NFR-A3 | Works on basic smartphones | Android 6.0+ |
| NFR-A4 | Feature phone support | IVR fallback |
| NFR-A5 | No app download required | WhatsApp-only |

### 4.6 Localization

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-L1 | 22 language support | Via Sarvam AI |
| NFR-L2 | Code-mixing support | Hindi-English, Tamil-English |
| NFR-L3 | Regional dialect handling | Best effort via ASR |
| NFR-L4 | Culturally appropriate responses | Reviewed prompts |

## 5. Technical Requirements

### 5.1 Integration Requirements

| ID | Integration | Purpose | Priority |
|----|-------------|---------|----------|
| TR-I1 | WhatsApp Business API | Primary messaging channel | P0 |
| TR-I2 | Sarvam AI ASR API (Saaras v3) | Speech-to-text | P0 |
| TR-I3 | Sarvam AI TTS API (Bulbul v3) | Text-to-speech | P0 |
| TR-I4 | OpenAI/Anthropic API | LLM for conversation | P0 |
| TR-I5 | Twilio Voice API | IVR fallback | P1 |
| TR-I6 | Supabase | User database | P0 |
| TR-I7 | ChromaDB/Pinecone | Vector search | P0 |

### 5.2 Data Requirements

| ID | Data Source | Content | Update Frequency |
|----|-------------|---------|------------------|
| TR-D1 | NSDC | Skill courses, certifications | Weekly |
| TR-D2 | NPTEL | Free online courses | Monthly |
| TR-D3 | YouTube | Curated skill playlists | Manual |
| TR-D4 | Skill India Portal | Government schemes | Weekly |
| TR-D5 | Job aggregators | Job listings | Daily (future) |

### 5.3 Infrastructure Requirements

| ID | Component | Specification |
|----|-----------|---------------|
| TR-INF1 | Application server | Python 3.11+, FastAPI |
| TR-INF2 | Database | PostgreSQL 15+ |
| TR-INF3 | Vector database | ChromaDB (MVP) → Pinecone |
| TR-INF4 | Cache | Redis 7+ |
| TR-INF5 | Hosting | Railway/Render (MVP) → AWS/GCP |
| TR-INF6 | CDN | Cloudflare (for static assets) |

## 6. Constraints

### 6.1 Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Sarvam AI API rate limits | May throttle at scale | Queue + retry logic |
| WhatsApp 24-hour window | Can't message after 24h without user initiation | Prompt users to message first |
| LLM token costs | High at scale | Caching, prompt optimization |
| Voice note size limit | 16MB on WhatsApp | Not an issue for short voice |

### 6.2 Business Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| WhatsApp Business API cost | Per-message cost at scale | Start with free tier, seek sponsorship |
| No direct job API access | Limited job listings | Start with curated static data |
| User trust | May not trust unknown number | Partner with govt/NGO for credibility |

### 6.3 Hackathon Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| 24-48 hour timeline | Limited features | Focus on MVP scope |
| Team size | Limited parallelization | Clear task division |
| API key limits | May hit free tier limits | Prepare backup keys |

## 7. Acceptance Criteria

### 7.1 MVP Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| AC-1 | User can send voice note in Hindi and get voice reply | Demo |
| AC-2 | User can complete skill discovery flow (5-7 questions) | Demo |
| AC-3 | User receives relevant course recommendations | Demo |
| AC-4 | System works in at least 3 languages | Demo |
| AC-5 | Conversation feels natural, not robotic | User feedback |
| AC-6 | End-to-end latency < 10 seconds | Measurement |

### 7.2 Demo Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| AC-D1 | 2-3 minute demo video completed | Video |
| AC-D2 | Demo shows complete user journey | Video review |
| AC-D3 | Hindi + 1 regional language shown | Video |
| AC-D4 | Problem statement clearly articulated | Pitch deck |
| AC-D5 | Impact metrics highlighted | Pitch deck |

## 8. Out of Scope (MVP)

The following are explicitly NOT in scope for the hackathon MVP:

| Feature | Reason | Future Phase |
|---------|--------|--------------|
| Real-time job scraping | Time-intensive | Phase 2 |
| Employer dashboard | B2B feature | Phase 2 |
| Payment integration | Complexity | Phase 3 |
| Certificate verification | API access needed | Phase 2 |
| Skill assessment tests | Content creation needed | Phase 2 |
| Mobile app | Not needed with WhatsApp | Maybe never |
| Web dashboard for users | Voice-first focus | Phase 2 |

## 9. Dependencies

### 9.1 External Dependencies

| Dependency | Risk Level | Contingency |
|------------|------------|-------------|
| Sarvam AI API availability | Low | Use Whisper + gTTS as backup |
| WhatsApp Business API approval | Medium | Use Twilio sandbox for demo |
| OpenAI/Anthropic API | Low | Have both ready, can switch |
| Supabase availability | Low | Local PostgreSQL backup |

### 9.2 Data Dependencies

| Dependency | Risk Level | Contingency |
|------------|------------|-------------|
| NSDC course data | Low | Manual curation of 50-100 courses |
| NPTEL course data | Low | Public data, easy to scrape |
| Job listings | High | Use static sample data for MVP |

## 10. Supported Languages (Sarvam AI)

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

## 11. Glossary

| Term | Definition |
|------|------------|
| ASR | Automatic Speech Recognition — converting speech to text |
| TTS | Text-to-Speech — converting text to spoken audio |
| RAG | Retrieval-Augmented Generation — LLM + knowledge base |
| IVR | Interactive Voice Response — phone-based voice menu |
| NSDC | National Skill Development Corporation |
| NPTEL | National Programme on Technology Enhanced Learning |
| Sarvam AI | India's sovereign AI platform for speech, translation, and text processing |
| Gig economy | Flexible, on-demand work (delivery, services, etc.) |