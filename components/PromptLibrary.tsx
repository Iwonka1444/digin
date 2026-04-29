"use client";

import { useState } from "react";

type BrandProfile = {
  company: string;
  industry: string;
  tone: string;
  offer: string;
  audience: string;
};

type PromptField = {
  key: string;
  label: string;
  placeholder: string;
  autoFill?: keyof BrandProfile;
  multiline?: boolean;
};

type Prompt = {
  id: string;
  title: string;
  description: string;
  template: string;
  fields: PromptField[];
};

type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  prompts: Prompt[];
};

const CATEGORIES: Category[] = [
  {
    id: "brand-strategy",
    name: "Brand Strategy",
    emoji: "🧭",
    color: "bg-purple-50 border-purple-200 text-purple-800",
    prompts: [
      {
        id: "audience-profile",
        title: "Audience Profile",
        description: "Deep profile of your target audience — problems, language, emotions",
        template: `Act as a market research expert for {company}, a {industry} brand.

Create a detailed audience profile for: {audience}

Include:
- Top 10 specific problems they face
- Exact language they use to describe these problems
- Current solutions they're trying (and why they fail)
- Their emotional state and frustrations
- What success looks like to them

Tone: {tone}
Keep it specific, no generic insights.`,
        fields: [
          { key: "company", label: "Company name", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing & Advertising", autoFill: "industry" },
          { key: "audience", label: "Target audience", placeholder: "e.g. Small business owners in NL, 25-45", autoFill: "audience" },
          { key: "tone", label: "Tone", placeholder: "e.g. professional, casual", autoFill: "tone" },
        ],
      },
      {
        id: "content-pillars",
        title: "Content Pillars",
        description: "3-5 content pillars anchored to specific beliefs",
        template: `You are a brand strategist for {company}, a {industry} brand.

Help develop 3-5 content pillars for their social media presence.

Brand offer: {offer}
Audience: {audience}
Tone: {tone}

For each pillar:
- Name it clearly
- Anchor it to a specific belief or observation (not a broad topic)
- Explain how it connects to business outcomes
- Give 2 example post ideas

Make each pillar distinct — a post from one should not fit in another.`,
        fields: [
          { key: "company", label: "Company name", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "offer", label: "What you offer", placeholder: "e.g. AI social media posts for SMBs", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "tone", label: "Tone", placeholder: "e.g. casual & friendly", autoFill: "tone" },
        ],
      },
      {
        id: "positioning-statement",
        title: "Positioning Statement",
        description: "70-90 word first-person positioning statement",
        template: `Write a 70-90 word, first-person positioning statement for {company}.

Company: {company}
Industry: {industry}
Offer: {offer}
Audience: {audience}
Key result or outcome: {result}

Include:
- Who you help (specific audience)
- Their specific situation
- The outcome you deliver (with metric/timeframe if possible)
- How you do it
- Why you specifically

Make it clear, specific, and instantly recognisable to the ideal client. No vague claims.`,
        fields: [
          { key: "company", label: "Company name", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "offer", label: "What you offer", placeholder: "e.g. AI-powered social media content", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "result", label: "Key result you deliver", placeholder: "e.g. 10x more posts in half the time" },
        ],
      },
      {
        id: "differentiation-map",
        title: "Differentiation Map",
        description: "Map what makes you different from competitors",
        template: `Create a differentiation map for {company} in the {industry} space.

Offer: {offer}
Audience: {audience}
Main competitors: {competitors}

Map 3 key differentiators:
1. Unique method or approach
2. Specific results achieved (include numbers if possible)
3. The specific niche or segment served

For each, write 2-3 clear, specific sentences. No vague claims like "best quality" or "passionate team".`,
        fields: [
          { key: "company", label: "Company name", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing software", autoFill: "industry" },
          { key: "offer", label: "Offer", placeholder: "e.g. AI content generator for SMBs", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "competitors", label: "Main competitors", placeholder: "e.g. Hootsuite, Buffer, generic AI tools" },
        ],
      },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn Content",
    emoji: "💼",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    prompts: [
      {
        id: "linkedin-hooks",
        title: "LinkedIn Hooks",
        description: "5 scroll-stopping hooks for LinkedIn posts",
        template: `Write 5 LinkedIn hooks for {company}, a {industry} brand.

Audience: {audience}
Topic: {topic}
Tone: {tone}

Rules:
- Each hook is exactly 2 lines
- Line 1: stops the scroll (bold claim, surprising stat, specific observation)
- Line 2: gives a reason to keep reading
- Vary the angles: credibility, observation, result, mistake, direct claim
- NO questions, NO exclamation marks, NO em-dashes
- Sound human, not like marketing copy`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "topic", label: "Topic / subject", placeholder: "e.g. Why most SMBs fail at social media" },
          { key: "tone", label: "Tone", placeholder: "e.g. professional but direct", autoFill: "tone" },
        ],
      },
      {
        id: "linkedin-story",
        title: "Story Post",
        description: "220-300 word narrative LinkedIn post",
        template: `Write a 220-300 word, first-person LinkedIn story post for {company}.

Industry: {industry}
Audience: {audience}
Story/situation to tell: {story}
Lesson or takeaway: {lesson}
Tone: {tone}

Structure:
- Paragraph 1-2: tell the specific story (real scene, real moment)
- Middle paragraphs: share lessons as short, flowing paragraphs — NOT numbered lists — each tied to the story
- Final line: one sentence linking it to the reader's situation

No questions. No exclamation marks. Sound like a real person sharing a genuine experience.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "story", label: "Story or situation to share", placeholder: "e.g. A client came to me with 0 followers and 6 months later had 5000", multiline: true },
          { key: "lesson", label: "Key lesson or takeaway", placeholder: "e.g. Consistency beats perfection every time" },
          { key: "tone", label: "Tone", placeholder: "e.g. warm, expert", autoFill: "tone" },
        ],
      },
      {
        id: "linkedin-contrarian",
        title: "Contrarian Post",
        description: "Bold post that challenges the conventional wisdom",
        template: `Write a 200-260 word LinkedIn contrarian post for {company}.

Industry: {industry}
Conventional belief to challenge: {conventional}
Your contrarian stance: {stance}
Evidence or reasoning: {evidence}
Audience: {audience}

Structure:
- Open with the clear contrarian stance (no softening)
- Support it with specific evidence or reasoning
- Acknowledge why the conventional view exists
- Close by restating what actually works instead

No questions. No exclamation marks. Be direct and confident.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "conventional", label: "Conventional belief to challenge", placeholder: "e.g. You need to post every day to grow on LinkedIn" },
          { key: "stance", label: "Your contrarian stance", placeholder: "e.g. Posting less but better content wins every time" },
          { key: "evidence", label: "Your evidence or reasoning", placeholder: "e.g. Our clients who post 2x/week consistently outperform those posting daily" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
        ],
      },
      {
        id: "linkedin-howto",
        title: "How-To Post",
        description: "200-280 word step-by-step teaching post",
        template: `Write a 200-280 word, first-person LinkedIn how-to post for {company}.

Industry: {industry}
Topic to teach: {topic}
Audience: {audience}
Tone: {tone}

Structure:
- Open with a hook from your direct experience
- Teach a step-by-step process in short paragraphs
- Each step: one clear action + why it works
- Close with one sentence on the result this creates for the reader

Keep paragraphs short. No numbered lists — use flowing paragraphs. Sound like you're sharing what actually works, not writing a tutorial.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "topic", label: "What to teach", placeholder: "e.g. How to write a LinkedIn post in 15 minutes" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "tone", label: "Tone", placeholder: "e.g. expert but accessible", autoFill: "tone" },
        ],
      },
    ],
  },
  {
    id: "offer-positioning",
    name: "Offer & Sales Copy",
    emoji: "💰",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    prompts: [
      {
        id: "sales-headlines",
        title: "Sales Page Headlines",
        description: "10 high-converting headlines for your sales page",
        template: `Write 10 sales page headlines for {company}.

Offer: {offer}
Audience: {audience}
Key result/outcome: {result}
Timeframe if applicable: {timeframe}

Rules:
- Each headline under 15 words
- Lead with a clear outcome, timeframe, or audience
- No vague adjectives ("amazing", "powerful", "game-changing")
- No questions
- Be specific — include numbers where possible

Then pick the top 3 and briefly explain why they'll perform best.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI social media content tool", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "result", label: "Key result you deliver", placeholder: "e.g. Professional social media content in minutes" },
          { key: "timeframe", label: "Timeframe (if any)", placeholder: "e.g. in 10 minutes, in 30 days" },
        ],
      },
      {
        id: "this-is-for-you",
        title: '"This is for you if…"',
        description: "5 specific statements that make ideal clients self-identify",
        template: `Write a "this is for you if" section for {company}'s offer.

Offer: {offer}
Ideal audience: {audience}
Their main struggles: {struggles}

Write 5 specific, sentence-length statements describing:
- Their current situation
- Their beliefs or frustrations
- Their past failed attempts

Make each statement feel precise enough that the right person instantly thinks "that's me." Avoid vague statements like "you want to grow your business."`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI content generator", autoFill: "offer" },
          { key: "audience", label: "Ideal audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "struggles", label: "Their main struggles", placeholder: "e.g. No time to post, don't know what to write, posting feels fake", multiline: true },
        ],
      },
      {
        id: "value-proposition",
        title: "Value Proposition",
        description: "3-outcome value proposition with proof",
        template: `Write a value proposition for {company} built on three key outcomes.

Offer: {offer}
Audience: {audience}
Results you deliver: {results}

For each outcome:
- State a specific result with metric or timeframe where possible
- Explain its real impact in 2-3 sentences
- Include one concrete example or recognisable scenario

Make the reader feel: "this is exactly what I need."`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Offer", placeholder: "e.g. AI marketing tool", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "results", label: "Results you deliver", placeholder: "e.g. 10x more content, consistent brand voice, saves 5h/week", multiline: true },
        ],
      },
    ],
  },
  {
    id: "lead-magnet",
    name: "Lead Magnet",
    emoji: "🧲",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    prompts: [
      {
        id: "lead-magnet-ideas",
        title: "Lead Magnet Ideas",
        description: "10 lead magnet ideas your audience will actually use",
        template: `Generate 10 lead magnet ideas for {company}.

Industry: {industry}
Audience: {audience}
Offer: {offer}
Their main problem: {problem}

For each idea include:
- Title
- Format (checklist, template, guide, video, etc.)
- One sentence on why this audience would use it immediately

Focus on quick, tangible results. Avoid broad or inspirational content — people need to feel they can use it today.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "offer", label: "Your paid offer", placeholder: "e.g. AI social media tool", autoFill: "offer" },
          { key: "problem", label: "Their #1 problem", placeholder: "e.g. No time to create social media content" },
        ],
      },
      {
        id: "lead-magnet-outline",
        title: "Lead Magnet Outline",
        description: "Full structured outline ready to write from",
        template: `Create a detailed outline for a lead magnet for {company}.

Topic/title: {title}
Audience: {audience}
Their problem: {problem}
Desired outcome: {outcome}

Include:
- Introduction (what they'll get + how to use it)
- 4-6 structured sections with clear headings and key points per section
- Concrete examples or templates for each section
- Closing section that leads to a natural next step

Make it specific enough to write from directly.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "title", label: "Lead magnet title", placeholder: "e.g. The 15-Minute Social Media System" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "problem", label: "Problem it solves", placeholder: "e.g. No time to create content" },
          { key: "outcome", label: "Desired outcome", placeholder: "e.g. Have a week of content ready in one sitting" },
        ],
      },
    ],
  },
  {
    id: "email",
    name: "Email Sequences",
    emoji: "📧",
    color: "bg-sky-50 border-sky-200 text-sky-800",
    prompts: [
      {
        id: "welcome-email-1",
        title: "Welcome Email #1",
        description: "First email after signup — personal, not generic",
        template: `Write a welcome email for new subscribers of {company}.

Company: {company}
Industry: {industry}
Offer: {offer}
What they signed up for: {signup_item}
Tone: {tone}

Rules:
- Under 220 words
- Include download/access link if applicable
- Brief credibility-based intro (no fake excitement)
- Personal, not generic
- Do NOT start with "Welcome" or "Congratulations"
- End with one warm, human sentence

Include 3 subject line options.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI content tool", autoFill: "offer" },
          { key: "signup_item", label: "What they signed up for", placeholder: "e.g. Free social media guide" },
          { key: "tone", label: "Tone", placeholder: "e.g. warm and direct", autoFill: "tone" },
        ],
      },
      {
        id: "offer-intro-email",
        title: "Offer Introduction Email",
        description: "Soft intro to your paid offer — natural, not pushy",
        template: `Write an email introducing the paid offer of {company}.

Company: {company}
Offer: {offer}
Audience: {audience}
Key result: {result}
Tone: {tone}

Rules:
- Under 260 words
- Introduce the offer as a natural next step, not a hard pitch
- Include 1-2 lines of social proof or results
- Keep tone soft and genuine
- Clear CTA at the end

Include 3 subject line options.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Your paid offer", placeholder: "e.g. DiGin Pro subscription", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "result", label: "Key result or proof point", placeholder: "e.g. Users save 5 hours/week on content" },
          { key: "tone", label: "Tone", placeholder: "e.g. warm and direct", autoFill: "tone" },
        ],
      },
      {
        id: "case-study-email",
        title: "Case Study Email",
        description: "Story-driven email featuring a client result",
        template: `Write a case study email for {company}.

Company: {company}
Client result: {result}
Before situation: {before}
What changed: {what_changed}
Outcome: {outcome}
Tone: {tone}

Rules:
- 240-300 words
- Open with the result
- Tell the story: before → what changed → outcome
- Close with a soft CTA
- Keep it story-driven, not a list of features

Include 3 subject line options.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "result", label: "The result achieved", placeholder: "e.g. 300% more engagement in 60 days" },
          { key: "before", label: "Before situation", placeholder: "e.g. Posting randomly, no strategy, low engagement" },
          { key: "what_changed", label: "What changed", placeholder: "e.g. Started using DiGin to plan and generate content" },
          { key: "outcome", label: "Specific outcome", placeholder: "e.g. 3x more leads from social media" },
          { key: "tone", label: "Tone", placeholder: "e.g. warm and credible", autoFill: "tone" },
        ],
      },
    ],
  },
  {
    id: "ads",
    name: "Ad Copy",
    emoji: "📣",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    prompts: [
      {
        id: "lead-magnet-ads",
        title: "Lead Magnet Ads",
        description: "3 ad variants promoting your free resource",
        template: `Write 3 ad variants for {company}'s lead magnet.

Company: {company}
Lead magnet: {lead_magnet}
Audience: {audience}
Main problem it solves: {problem}
Platform: {platform}

For each variant:
- Scroll-stopping hook (1-2 lines)
- 2-3 sentences on the value
- Clear CTA

Rules:
- Under 100 words each
- Specific to the audience and problem
- No questions, no exclamation marks
- Sound helpful, not salesy`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "lead_magnet", label: "Lead magnet name/description", placeholder: "e.g. Free social media content calendar template" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "problem", label: "Problem it solves", placeholder: "e.g. No time to plan social media content" },
          { key: "platform", label: "Platform", placeholder: "e.g. Facebook & Instagram" },
        ],
      },
      {
        id: "cold-audience-ads",
        title: "Cold Audience Ads",
        description: "3 ad variants for people who don't know you yet",
        template: `Write 3 cold-audience ad variants for {company}.

Company: {company}
Offer: {offer}
Audience: {audience}
Key result: {result}
Platform: {platform}

For each variant:
- Open with a situation or result-driven hook
- Establish credibility with one specific proof point
- Clear CTA

Rules:
- Under 120 words each
- No questions, no exclamation marks
- Write for {platform} feed placement
- Sound credible, not hype`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI social media tool", autoFill: "offer" },
          { key: "audience", label: "Target audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "result", label: "Key result/proof point", placeholder: "e.g. Save 5 hours/week on content creation" },
          { key: "platform", label: "Platform", placeholder: "e.g. Facebook & Instagram" },
        ],
      },
      {
        id: "ad-hooks",
        title: "Ad Hooks",
        description: "10 scroll-stopping hooks for paid ads",
        template: `Write 10 ad hooks for {company}.

Audience: {audience}
Offer: {offer}
Main problem: {problem}

Rules:
- 1-2 sentences each
- Vary the angles: results, observations, problems, audience-specific statements
- No questions, no exclamation marks
- Be specific — no generic marketing language

Then select the top 3 and briefly explain why they're most likely to perform.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners in NL", autoFill: "audience" },
          { key: "offer", label: "Offer", placeholder: "e.g. AI content creation tool", autoFill: "offer" },
          { key: "problem", label: "Main audience problem", placeholder: "e.g. No time to create social media content" },
        ],
      },
    ],
  },
  {
    id: "webinar",
    name: "Webinar & Events",
    emoji: "🎯",
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    prompts: [
      {
        id: "webinar-reg-page",
        title: "Webinar Registration Page",
        description: "Full registration page copy under 450 words",
        template: `Write a webinar registration page for {company}.

Webinar title: {title}
Date & time: {datetime}
Host: {host}
Audience: {audience}
What they'll learn: {outcomes}
Tone: {tone}

Include:
- Compelling headline
- Subheadline
- Who this is for (2-3 specific sentences)
- 3-4 outcome-focused bullet points
- Host intro (brief, credibility-focused)
- Clear CTA with date and time

Under 450 words total.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "title", label: "Webinar title", placeholder: "e.g. How to Get 30 Days of Social Content in 1 Hour" },
          { key: "datetime", label: "Date & time", placeholder: "e.g. Thursday May 15, 7PM CET" },
          { key: "host", label: "Host name & credentials", placeholder: "e.g. Iwona, founder of DiGin with 5 years in digital marketing" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "outcomes", label: "What they'll learn", placeholder: "e.g. How to batch content, use AI tools, build a posting routine", multiline: true },
          { key: "tone", label: "Tone", placeholder: "e.g. professional but warm", autoFill: "tone" },
        ],
      },
      {
        id: "linkedin-webinar-promo",
        title: "LinkedIn Webinar Promo Post",
        description: "160-210 word post promoting your live training",
        template: `Write a 160-210 word LinkedIn post promoting a live training by {company}.

Webinar title: {title}
Date & time: {datetime}
Audience: {audience}
What they'll gain: {outcomes}
Registration link: {link}

Structure:
- Open with the problem the training solves
- Outline what attendees will gain (specific, not vague)
- Include date and time clearly
- Close with a clear registration CTA

No exclamation marks. Keep it direct and valuable.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "title", label: "Webinar title", placeholder: "e.g. 30 Days of Content in 1 Hour" },
          { key: "datetime", label: "Date & time", placeholder: "e.g. Thursday May 15, 7PM CET" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "outcomes", label: "What they'll gain", placeholder: "e.g. A full content calendar, AI tools demo, live Q&A" },
          { key: "link", label: "Registration link", placeholder: "e.g. digin.app/webinar" },
        ],
      },
    ],
  },
  {
    id: "video-scripts",
    name: "Video Scripts",
    emoji: "🎬",
    color: "bg-orange-50 border-orange-200 text-orange-800",
    prompts: [
      {
        id: "60-sec-script",
        title: "60-Second Script",
        description: "Punchy 60-second talking head video script",
        template: `Write a 60-second talking head script for {company}.

Topic: {topic}
Audience: {audience}
Key message: {message}
CTA: {cta}
Tone: {tone}

Structure:
- Hook (5 sec): grab attention immediately
- Problem/insight (15 sec): set up the tension
- Main point (30 sec): deliver one clear, useful idea
- CTA (10 sec): simple, direct instruction

Keep it conversational and natural — written for speaking, not reading. Include a brief note on tone/delivery.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "topic", label: "Video topic", placeholder: "e.g. Why your social media isn't getting clients" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "message", label: "Key message", placeholder: "e.g. Consistency matters more than perfection" },
          { key: "cta", label: "Call to action", placeholder: "e.g. Follow for more / Link in bio / Comment below" },
          { key: "tone", label: "Tone", placeholder: "e.g. direct, confident, relatable", autoFill: "tone" },
        ],
      },
      {
        id: "vsl-hooks",
        title: "VSL Opening Hooks",
        description: "5 video sales letter opening hooks (~75 words each)",
        template: `Write 5 VSL opening hooks for {company}.

Offer: {offer}
Audience: {audience}
Main problem: {problem}
Desired outcome: {outcome}

For each hook (~75 words):
- Start with a specific, relatable situation
- Build curiosity and tension
- Hint at the promise without revealing the solution
- Keep it natural and spoken — not scripted-sounding

These will be spoken on camera. Write for the ear, not the eye.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI social media tool", autoFill: "offer" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
          { key: "problem", label: "Main problem", placeholder: "e.g. No time for social media content" },
          { key: "outcome", label: "Desired outcome", placeholder: "e.g. Consistent, professional content without the stress" },
        ],
      },
    ],
  },
  {
    id: "dm-outreach",
    name: "DM & Outreach",
    emoji: "💬",
    color: "bg-teal-50 border-teal-200 text-teal-800",
    prompts: [
      {
        id: "cold-linkedin-dms",
        title: "Cold LinkedIn DMs",
        description: "5 non-salesy cold outreach messages",
        template: `Write 5 cold LinkedIn DMs for {company}.

Sender: {sender}
Offer: {offer}
Target prospect: {prospect}
Goal of the DM: start a genuine conversation (NOT pitch immediately)

Rules:
- Under 100 words each
- Personalise with something specific about the prospect type
- Keep it natural and non-salesy
- No "I'd love to hop on a call" in the first message
- One thoughtful question at the end

Make each feel like it was written for that specific person.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "sender", label: "Your name/role", placeholder: "e.g. Iwona, founder of DiGin" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI social media content tool", autoFill: "offer" },
          { key: "prospect", label: "Who you're reaching out to", placeholder: "e.g. Small business owner who posts inconsistently on LinkedIn" },
        ],
      },
      {
        id: "warm-prospect-dms",
        title: "Warm Prospect DMs",
        description: "5 DMs to move warm prospects toward a call",
        template: `Write 5 LinkedIn DMs for {company} to move a warm prospect toward a discovery call.

Sender: {sender}
Offer: {offer}
Context (how they know you): {context}
Audience: {audience}

Rules:
- Under 80 words each
- Reference the shared context naturally
- Frame the call as a logical, low-pressure next step
- Make it feel like it's in their interest
- No hard selling`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "sender", label: "Your name/role", placeholder: "e.g. Iwona, founder of DiGin" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI marketing tool", autoFill: "offer" },
          { key: "context", label: "How they know you", placeholder: "e.g. They commented on your post / attended your webinar / downloaded your lead magnet" },
          { key: "audience", label: "Audience", placeholder: "e.g. Small business owners", autoFill: "audience" },
        ],
      },
    ],
  },
  {
    id: "testimonials",
    name: "Testimonials & Case Studies",
    emoji: "⭐",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    prompts: [
      {
        id: "testimonial-questions",
        title: "Testimonial Questions",
        description: "10 questions that get powerful, specific testimonials",
        template: `Write 10 open-ended client testimonial questions for {company}.

Offer: {offer}
Industry: {industry}

The questions should draw out:
- Their situation before working with you
- Specific challenges they faced
- Why they chose {company} over alternatives
- What they actually did / how they used the service
- Specific results (with numbers if possible)
- What surprised them
- What they'd tell someone similar who's considering it

Keep questions open-ended. No yes/no questions. Make them story-friendly.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "offer", label: "Your offer", placeholder: "e.g. AI social media tool", autoFill: "offer" },
          { key: "industry", label: "Industry", placeholder: "e.g. Marketing", autoFill: "industry" },
        ],
      },
      {
        id: "full-case-study",
        title: "Full Case Study",
        description: "400-600 word narrative case study",
        template: `Write a 400-600 word case study for {company}.

Client/situation: {client}
Before: {before}
What they did: {actions}
Results: {results}
Industry: {industry}

Structure:
- Open with the result (don't bury it)
- Tell the story chronologically: before → decision → actions → outcome
- Close by showing what's possible for someone in a similar situation

Keep it narrative — not a bullet list. Make it feel like a real story.`,
        fields: [
          { key: "company", label: "Company", placeholder: "e.g. DiGin", autoFill: "company" },
          { key: "client", label: "Client description", placeholder: "e.g. A Dutch florist with no social media presence" },
          { key: "before", label: "Situation before", placeholder: "e.g. 0 followers, posting randomly, getting no clients from social" },
          { key: "actions", label: "What they did with your help", placeholder: "e.g. Used DiGin to create 3 posts/week for 3 months", multiline: true },
          { key: "results", label: "Specific results", placeholder: "e.g. 800 followers, 12 new clients, 40% of new business from Instagram" },
          { key: "industry", label: "Industry", placeholder: "e.g. Retail/Florist", autoFill: "industry" },
        ],
      },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromptLibrary({
  brandProfile,
  onSaveDraft,
  lang = "en",
}: {
  brandProfile: {
    company?: string;
    industry?: string;
    tone?: string;
    offer?: string;
    audience?: string;
  } | null;
  onSaveDraft?: (content: string) => void;
  lang?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setOutput("");
    setError("");
    setCopied(false);
    setSaved(false);

    // Auto-fill from brand profile
    const autoFilled: Record<string, string> = {};
    prompt.fields.forEach((field) => {
      if (field.autoFill && brandProfile?.[field.autoFill]) {
        autoFilled[field.key] = brandProfile[field.autoFill] as string;
      } else {
        autoFilled[field.key] = fieldValues[field.key] || "";
      }
    });
    setFieldValues(autoFilled);
  };

  const buildPrompt = (prompt: Prompt, values: Record<string, string>) => {
    let result = prompt.template;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || `[${key}]`);
    });
    return result;
  };

  const handleGenerate = async () => {
    if (!selectedPrompt) return;
    try {
      setLoading(true);
      setError("");
      setOutput("");

      const builtPrompt = buildPrompt(selectedPrompt, fieldValues);

      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: builtPrompt }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.error || "Generation error."); return; }
      setOutput(json.output || "");
    } catch { setError("Connection error."); } finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSaveDraft) { onSaveDraft(output); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const allFieldsFilled = selectedPrompt?.fields.every((f) => fieldValues[f.key]?.trim()) ?? false;

  // Category view
  if (!selectedCategory) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Prompt Library 📚</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Professional marketing copy for every need. Auto-filled with your brand profile.
          </p>
        </div>

        {brandProfile?.company && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
            <span className="text-sm">✅</span>
            <p className="text-sm text-emerald-800">
              Auto-filling prompts with <strong>{brandProfile.company}</strong>'s brand profile.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition hover:shadow-md hover:scale-[1.02] ${cat.color}`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <p className="text-sm font-bold leading-tight">{cat.name}</p>
              <p className="text-xs opacity-70">{cat.prompts.length} templates</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Prompt list view
  if (!selectedPrompt) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedCategory(null)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition">‹</button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{activeCategory?.emoji} {activeCategory?.name}</h2>
            <p className="text-sm text-slate-500">{activeCategory?.prompts.length} templates — choose one to start</p>
          </div>
        </div>

        <div className="space-y-3">
          {activeCategory?.prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSelectPrompt(prompt)}
              className="w-full flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 text-left hover:border-emerald-200 hover:shadow-sm transition"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{prompt.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{prompt.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {prompt.fields.map((f) => (
                    <span key={f.key} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${f.autoFill && brandProfile?.[f.autoFill] ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                      {f.autoFill && brandProfile?.[f.autoFill] ? "✓ " : ""}{f.label}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-slate-300 text-lg shrink-0 mt-0.5">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Prompt editor + output view
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto lg:max-w-none">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelectedPrompt(null)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition">‹</button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{selectedPrompt.title}</h2>
          <p className="text-sm text-slate-500">{selectedPrompt.description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Fields */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fill in the details</p>
          {selectedPrompt.fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {field.label}
                {field.autoFill && brandProfile?.[field.autoFill] && (
                  <span className="ml-2 text-[10px] text-emerald-500 font-normal">✓ from brand profile</span>
                )}
              </label>
              {field.multiline ? (
                <textarea
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                />
              ) : (
                <input
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={loading || !allFieldsFilled}
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "✨ Generate"}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Output</p>
            {output && (
              <button onClick={() => setOutput("")} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
            )}
          </div>

          {!output && !loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <span className="text-4xl mb-3">✨</span>
              <p className="text-sm text-slate-400">Fill in the fields and click Generate.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 p-10 text-center">
              <span className="text-4xl mb-3 animate-bounce">🌱</span>
              <p className="text-sm text-emerald-600 font-medium">Creating your content...</p>
            </div>
          )}

          {output && !loading && (
            <>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4 max-h-[400px] overflow-y-auto">
                <p className="text-sm text-slate-800 leading-7 whitespace-pre-wrap">{output}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleCopy} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {copied ? "Copied ✅" : "Copy"}
                </button>
                <button onClick={handleGenerate} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Regenerate
                </button>
                {onSaveDraft && (
                  <button onClick={handleSave} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
                    {saved ? "Saved ✅" : "Save to drafts"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}