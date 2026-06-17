import { useMemo, useState } from "react";
import NeoMetricGauge from "./NeoMetricGauge";

const TOTAL_JOURNEY_DAYS = 180;
const DEFAULT_INFLATION_RATE = 0.019;

const RELATION_GROUPS = {
  outside: {
    title: "Ù„Ø³Øª Ø¯Ø§Ø®Ù„ Ù…Ø¬Ø§Ù„ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© Ø¨Ø¹Ø¯",
    shortTitle: "Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…Ø¬Ø§Ù„",
    description:
      "Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ù† ÙŠØ±ÙŠØ¯ ÙÙ‡Ù… Ø§Ù„Ù…Ø¬Ø§Ù„ Ø£Ùˆ Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ø¥Ù„ÙŠÙ‡ Ø¯ÙˆÙ† Ø§ÙØªØ±Ø§Ø¶ Ø£Ù†Ù‡ ÙŠÙ…Ù„Ùƒ Ø®Ø¨Ø±Ø© Ù…Ø¨Ø§Ø´Ø±Ø© ÙÙŠ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©.",
    baseRange: { low: 6000, mid: 7600, high: 9500 },
    defaultOutcome: "enter"
  },
  inside: {
    title: "Ø¯Ø§Ø®Ù„ Ù…Ø¬Ø§Ù„ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© Ø£Ùˆ Ù‚Ø±ÙŠØ¨ Ù…Ù†Ù‡",
    shortTitle: "Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø¬Ø§Ù„",
    description:
      "Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ù† ÙŠØ¹Ù…Ù„ ÙÙŠ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© Ø£Ùˆ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ø£Ùˆ Ø´Ø¤ÙˆÙ† Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† Ø£Ùˆ Ø£Ø¯ÙˆØ§Ø± Ù‚Ø±ÙŠØ¨Ø© Ù…Ù† Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù†Ø§Ø³.",
    baseRange: { low: 8500, mid: 12500, high: 17000 },
    defaultOutcome: "promotion"
  },
  leader: {
    title: "Ø£Ø¹Ù…Ù„ ÙÙŠ Ù‚ÙŠØ§Ø¯Ø© Ø£Ùˆ Ø¥Ø¯Ø§Ø±Ø© ÙˆØ£Ø±ÙŠØ¯ ÙÙ‡Ù… Ø§Ù„Ù†Ø§Ø³ ÙˆØ§Ù„Ù…Ù†Ø¸Ù…Ø© ÙƒØ£Ø¯Ø§Ø© Ù‚Ø±Ø§Ø±",
    shortTitle: "Ù‚Ø§Ø¦Ø¯ Ø£Ùˆ Ù…Ø¯ÙŠØ±",
    description:
      "Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ù† Ù„Ø§ ÙŠØ±ÙŠØ¯ Ø¨Ø§Ù„Ø¶Ø±ÙˆØ±Ø© ÙˆØ¸ÙŠÙØ© Ù…ÙˆØ§Ø±Ø¯ Ø¨Ø´Ø±ÙŠØ©ØŒ Ø¨Ù„ ÙŠØ±ÙŠØ¯ ÙÙ‡Ù… Ø§Ù„Ø£Ø¯Ø§Ø¡ ÙˆØ§Ù„Ø«Ù‚Ø§ÙØ© ÙˆØ§Ù„Ù‡ÙŠÙƒÙ„ ÙˆØ§Ù„ÙØ±Ù‚ Ù„ØªØ­Ø³ÙŠÙ† Ù‚Ø±Ø§Ø±Ø§ØªÙ‡ Ø§Ù„Ù‚ÙŠØ§Ø¯ÙŠØ©.",
    baseRange: { low: 12000, mid: 18000, high: 26000 },
    defaultOutcome: "leadership"
  },
  consultant: {
    title: "Ø£Ù…Ø§Ø±Ø³ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª Ø£Ùˆ Ø£Ø±ÙŠØ¯ Ø¨Ù†Ø§Ø¡ Ù…Ø³Ø§Ø± Ø§Ø³ØªØ´Ø§Ø±ÙŠ",
    shortTitle: "Ù…Ø³Ø§Ø± Ø§Ø³ØªØ´Ø§Ø±ÙŠ",
    description:
      "Ù‡Ø°Ù‡ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ù† ÙŠØ±ÙŠØ¯ ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø¥Ù„Ù‰ Ù…Ù†Ù‡Ø¬ÙŠØ© ØªØ´Ø®ÙŠØµÙŠØ© ÙˆØªØ¯Ø®Ù„Ø§Øª ÙˆÙ…Ø®Ø±Ø¬Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø¨ÙŠØ¹ Ø£Ùˆ Ø§Ù„ØªØ£Ø«ÙŠØ±.",
    baseRange: { low: 10000, mid: 16000, high: 24000 },
    defaultOutcome: "consulting"
  }
};

const LEVELS_BY_RELATION = {
  outside: [
    {
      id: "explorer",
      title: "Ù…Ø³ØªÙƒØ´Ù",
      description: "Ù„Ø§ ØªØ¹Ø±Ù Ø§Ù„Ù…Ø¬Ø§Ù„ Ø¨Ø¹Ø¯ ÙˆØªØ±ÙŠØ¯ Ø¨Ù†Ø§Ø¡ ØªØµÙˆØ± ÙˆØ§Ø¶Ø­ Ù‚Ø¨Ù„ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ø³Ø§Ø±.",
      factor: 0.78,
      score: 8
    },
    {
      id: "career-switcher",
      title: "Ù…Ù†ØªÙ‚Ù„ Ù…Ù‡Ù†ÙŠØ§",
      description: "ØªØ¹Ù…Ù„ ÙÙŠ Ù…Ø¬Ø§Ù„ Ø¢Ø®Ø± ÙˆØªØ±ÙŠØ¯ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© Ø£Ùˆ Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ.",
      factor: 0.88,
      score: 12
    },
    {
      id: "first-job",
      title: "Ø¨Ø§Ø­Ø« Ø¹Ù† Ø£ÙˆÙ„ ÙØ±ØµØ©",
      description: "ØªØ³ØªÙ‡Ø¯Ù Ø£ÙˆÙ„ ÙˆØ¸ÙŠÙØ© Ø£Ùˆ ØªØ¯Ø±ÙŠØ¨ Ù…Ù‡Ù†ÙŠ ÙÙŠ Ø§Ù„Ù…Ø¬Ø§Ù„.",
      factor: 0.94,
      score: 15
    },
    {
      id: "competition-ready",
      title: "Ø¬Ø§Ù‡Ø² Ù„Ù„Ù…Ù†Ø§ÙØ³Ø©",
      description: "Ù„Ø¯ÙŠÙƒ Ù…Ø¹Ø±ÙØ© Ø£ÙˆÙ„ÙŠØ© ÙˆØªØ±ÙŠØ¯ ØªÙ‚ÙˆÙŠØ© Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø§Øª ÙˆØ§Ù„Ø£Ø¯ÙˆØ§Øª ÙˆØ§Ù„Ù„ØºØ© Ø§Ù„Ù…Ù‡Ù†ÙŠØ©.",
      factor: 1,
      score: 18
    }
  ],
  inside: [
    {
      id: "coordinator",
      title: "Ù…Ù†Ø³Ù‚ Ø£Ùˆ Ù…Ø³Ø§Ø¹Ø¯",
      description: "ØªØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø£Ø¹Ù…Ø§Ù„ ØªØ´ØºÙŠÙ„ÙŠØ© ÙˆØªØ±ÙŠØ¯ ÙÙ‡Ù… Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…Ù‡Ù†ÙŠØ© Ø§Ù„Ø£ÙƒØ¨Ø±.",
      factor: 0.9,
      score: 13
    },
    {
      id: "specialist",
      title: "Ø£Ø®ØµØ§Ø¦ÙŠ",
      description: "ØªÙ…Ø§Ø±Ø³ Ø£Ø¯ÙˆØ§Ø±Ø§ Ù…Ø­Ø¯Ø¯Ø© ÙˆØªØ±ÙŠØ¯ Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù…Ù† Ø§Ù„ØªÙ†ÙÙŠØ° Ø¥Ù„Ù‰ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ù‡Ù†ÙŠ.",
      factor: 1,
      score: 17
    },
    {
      id: "senior-specialist",
      title: "Ø£Ø®ØµØ§Ø¦ÙŠ Ø£ÙˆÙ„ Ø£Ùˆ Ù…Ø´Ø±Ù",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø±Ø¨Ø· Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø§Øª Ø¨Ø§Ù„Ù†ØªØ§Ø¦Ø¬ ÙˆØ§Ù„Ù…Ø¤Ø´Ø±Ø§Øª ÙˆÙ…Ø´ÙƒÙ„Ø§Øª Ø§Ù„Ø¹Ù…Ù„.",
      factor: 1.12,
      score: 21
    },
    {
      id: "business-partner",
      title: "Ø´Ø±ÙŠÙƒ Ø£Ø¹Ù…Ø§Ù„ Ø£Ùˆ Ù…Ø¯ÙŠØ± Ù‚Ø³Ù…",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù„ØºØ© Ø£Ø¹Ù…Ø§Ù„ ÙˆØªØ­Ù„ÙŠÙ„ Ù…Ù†Ø¸Ù…Ø© ÙˆØªØ¯Ø®Ù„Ø§Øª Ø£ÙƒØ«Ø± Ù†Ø¶Ø¬Ø§.",
      factor: 1.24,
      score: 24
    },
    {
      id: "hr-leader",
      title: "Ù…Ø¯ÙŠØ± Ù…ÙˆØ§Ø±Ø¯ Ø¨Ø´Ø±ÙŠØ© Ø£Ùˆ Ù‚Ø§Ø¦Ø¯ ÙˆØ¸ÙŠÙØ©",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© Ù„Ù„Ù…Ù†Ø¸Ù…Ø© ÙˆØ§Ù„Ù†Ø§Ø³ ÙˆØ§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ©.",
      factor: 1.38,
      score: 27
    }
  ],
  leader: [
    {
      id: "team-lead",
      title: "Ù‚Ø§Ø¦Ø¯ ÙØ±ÙŠÙ‚",
      description: "ØªØ¯ÙŠØ± Ù…Ø¬Ù…ÙˆØ¹Ø© ØµØºÙŠØ±Ø© ÙˆØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ÙÙ‡Ù… Ø§Ù„Ø³Ù„ÙˆÙƒ ÙˆØ§Ù„Ø£Ø¯Ø§Ø¡ ÙˆØ§Ù„ØªØºØ°ÙŠØ© Ø§Ù„Ø±Ø§Ø¬Ø¹Ø©.",
      factor: 0.95,
      score: 15
    },
    {
      id: "supervisor",
      title: "Ù…Ø´Ø±Ù ØªØ´ØºÙŠÙ„ÙŠ",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø±Ø¨Ø· Ø§Ù„Ù†Ø§Ø³ Ø¨Ø§Ù„Ø¹Ù…Ù„ÙŠØ© ÙˆØ§Ù„Ø§Ù†Ø¶Ø¨Ø§Ø· ÙˆØ§Ù„ØªØ¹Ù„Ù… Ø§Ù„ÙŠÙˆÙ…ÙŠ.",
      factor: 1.04,
      score: 18
    },
    {
      id: "department-manager",
      title: "Ù…Ø¯ÙŠØ± Ù‚Ø³Ù…",
      description: "ØªØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ù†ØªØ§Ø¦Ø¬ ÙˆÙØ±Ù‚ ÙˆØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ø£Ø¹Ù…Ù‚ Ù„Ù„Ø£Ø¯ÙˆØ§Ø± ÙˆØ§Ù„Ø«Ù‚Ø§ÙØ©.",
      factor: 1.16,
      score: 22
    },
    {
      id: "director",
      title: "Ù…Ø¯ÙŠØ± Ø¥Ø¯Ø§Ø±Ø©",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ÙÙ‡Ù… Ø§Ù„Ø¹Ù„Ø§Ù‚Ø© Ø¨ÙŠÙ† Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© ÙˆØ§Ù„Ù‡ÙŠÙƒÙ„ ÙˆØ§Ù„Ù‚Ø¯Ø±Ø§Øª.",
      factor: 1.3,
      score: 25
    },
    {
      id: "executive",
      title: "Ù‚Ø§Ø¦Ø¯ ØªÙ†ÙÙŠØ°ÙŠ",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù‚Ø±Ø§Ø¡Ø© Ù†Ø¸Ø§Ù…ÙŠØ© Ø¹Ø§Ù„ÙŠØ© ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ù‚Ø±Ø§Ø±Ø§Øª Ø£Ø«Ø±Ù‡Ø§ ÙˆØ§Ø³Ø¹.",
      factor: 1.5,
      score: 29
    }
  ],
  consultant: [
    {
      id: "consulting-learner",
      title: "Ù…ØªØ¹Ù„Ù… Ø§Ø³ØªØ´Ø§Ø±ÙŠ",
      description: "ØªØ±ÙŠØ¯ ØªØ¹Ù„Ù… Ù„ØºØ© Ø§Ù„ØªØ´Ø®ÙŠØµ ÙˆØµÙ†Ø§Ø¹Ø© Ø§Ù„ÙØ±Ø¶ÙŠØ§Øª Ù‚Ø¨Ù„ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ø­Ù„ÙˆÙ„.",
      factor: 0.9,
      score: 14
    },
    {
      id: "diagnostic-analyst",
      title: "Ù…Ø­Ù„Ù„ Ø£Ùˆ Ø¨Ø§Ø­Ø« ØªØ´Ø®ÙŠØµÙŠ",
      description: "ØªØ±ÙƒØ² Ø¹Ù„Ù‰ Ø¬Ù…Ø¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ù†Ù…Ø§Ø· ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ø§Ø³ØªÙ†ØªØ§Ø¬Ø§Øª.",
      factor: 1.05,
      score: 18
    },
    {
      id: "junior-consultant",
      title: "Ù…Ø³ØªØ´Ø§Ø± Ù…Ø¨ØªØ¯Ø¦",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø¥Ù„Ù‰ ØªÙˆØµÙŠØ§Øª ÙˆÙ…Ø®Ø±Ø¬Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ·Ø¨ÙŠÙ‚.",
      factor: 1.15,
      score: 22
    },
    {
      id: "practicing-consultant",
      title: "Ù…Ø³ØªØ´Ø§Ø± Ù…Ù…Ø§Ø±Ø³",
      description: "ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù„Ø§Ù‚Ø© Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© ÙˆØ§Ù„ØªØ¯Ø®Ù„ ÙˆÙ‚ÙŠØ§Ø³ Ø§Ù„Ø£Ø«Ø±.",
      factor: 1.32,
      score: 26
    },
    {
      id: "trusted-advisor",
      title: "Ù…Ø³ØªØ´Ø§Ø± Ø®Ø¨ÙŠØ± Ø£Ùˆ Ø´Ø±ÙŠÙƒ Ù…ÙˆØ«ÙˆÙ‚",
      description: "ØªØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ù‚Ø¶Ø§ÙŠØ§ ØºØ§Ù…Ø¶Ø© ÙˆØ³ÙŠØ§Ø³ÙŠØ© ÙˆØ§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© ÙˆØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ Ù†Ø²Ø§Ù‡Ø© ØªØ´Ø®ÙŠØµ Ø¹Ø§Ù„ÙŠØ©.",
      factor: 1.52,
      score: 30
    }
  ]
};

const LENSES = {
  hr_general: {
    title: "Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© Ø§Ù„Ø¹Ø§Ù…Ø©",
    description: "Ø³ÙŠØ§Ø³Ø§ØªØŒ Ø¥Ø¬Ø±Ø§Ø¡Ø§ØªØŒ Ø¹Ù…Ù„ÙŠØ§ØªØŒ ÙˆÙ‚Ø±Ø§Ø±Ø§Øª ÙŠÙˆÙ…ÙŠØ© Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†.",
    factor: 0.98,
    gap: "ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø§Øª ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø£Ø«Ø± ÙˆØ§Ø¶Ø­."
  },
  performance_rewards: {
    title: "Ø§Ù„Ø£Ø¯Ø§Ø¡ ÙˆØ§Ù„Ù…ÙƒØ§ÙØ¢Øª",
    description: "Ø§Ù„Ø£Ù‡Ø¯Ø§ÙØŒ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø§ØªØŒ Ø§Ù„Ù…Ø³Ø§Ø¡Ù„Ø©ØŒ Ø§Ù„Ø­ÙˆØ§ÙØ²ØŒ ÙˆØ§Ù„Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©.",
    factor: 1.04,
    gap: "Ø±Ø¨Ø· Ø§Ù„Ù‚ÙŠØ§Ø³ Ø¨Ø§Ù„Ø³Ù„ÙˆÙƒ Ù„Ø§ Ø¨Ø§Ù„Ù†Ù…Ø§Ø°Ø¬ ÙÙ‚Ø·."
  },
  learning_development: {
    title: "Ø§Ù„ØªØ¹Ù„Ù… ÙˆØ§Ù„ØªØ·ÙˆÙŠØ±",
    description: "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø§Ø­ØªÙŠØ§Ø¬ØŒ Ø¨Ù†Ø§Ø¡ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ØŒ Ù†Ù‚Ù„ Ø£Ø«Ø± Ø§Ù„ØªØ¹Ù„Ù… Ø¥Ù„Ù‰ Ø§Ù„Ø¹Ù…Ù„.",
    factor: 1.02,
    gap: "ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ù…Ù† Ø­Ø¶ÙˆØ± Ø¥Ù„Ù‰ Ø£Ø«Ø±."
  },
  employee_experience: {
    title: "ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ù…ÙˆØ¸Ù ÙˆØ§Ù„Ø«Ù‚Ø§ÙØ©",
    description: "Ø§Ù„Ø«Ù‚Ø©ØŒ Ø§Ù„Ù…Ù†Ø§Ø®ØŒ Ø§Ù„ØµÙ…Øª Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØŒ Ø§Ù„Ø³Ù„ÙˆÙƒ Ø§Ù„ÙŠÙˆÙ…ÙŠØŒ ÙˆÙ…Ø¹Ù†Ù‰ Ø§Ù„Ø¹Ù…Ù„.",
    factor: 1.03,
    gap: "Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø«Ù‚Ø§ÙØ© Ù…Ù† Ø§Ù„Ø³Ù„ÙˆÙƒ Ù„Ø§ Ù…Ù† Ø§Ù„Ø´Ø¹Ø§Ø±Ø§Øª."
  },
  od: {
    title: "Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ",
    description: "ØªØ´Ø®ÙŠØµØŒ ØªØ¯Ø®Ù„ØŒ ØªØºÙŠÙŠØ±ØŒ Ù‚Ø¯Ø±Ø© Ù…Ø¤Ø³Ø³ÙŠØ©ØŒ ÙˆØ§Ø³ØªØ¯Ø§Ù…Ø©.",
    factor: 1.08,
    gap: "Ø¨Ù†Ø§Ø¡ ÙØ±Ø¶ÙŠØ§Øª Ù†Ø¸Ø§Ù…ÙŠØ© Ù‚Ø¨Ù„ Ø§Ù‚ØªØ±Ø§Ø­ Ø§Ù„Ø­Ù„."
  },
  structures_roles: {
    title: "Ø§Ù„Ù‡ÙŠØ§ÙƒÙ„ ÙˆØ§Ù„Ø£Ø¯ÙˆØ§Ø± ÙˆØ§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª",
    description: "ØªØµÙ…ÙŠÙ… Ø§Ù„Ø¹Ù…Ù„ØŒ Ø­Ù‚ÙˆÙ‚ Ø§Ù„Ù‚Ø±Ø§Ø±ØŒ Ø§Ù„ØªØ¯Ø§Ø®Ù„ØŒ Ø§Ù„Ø­ÙˆÙƒÙ…Ø©ØŒ ÙˆØ§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ§Øª.",
    factor: 1.06,
    gap: "ØªÙˆØ¶ÙŠØ­ Ù…Ù† ÙŠÙ‚Ø±Ø± ÙˆÙ…ØªÙ‰ ÙˆÙƒÙŠÙ."
  },
  leadership_teams: {
    title: "Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±Ù‚",
    description: "Ø§Ù„Ù…Ø³Ø§Ø¡Ù„Ø©ØŒ Ø§Ù„ØªØ¹Ø§ÙˆÙ†ØŒ Ø§Ù„ØµØ±Ø§Ø¹ØŒ Ø§Ù„Ø£Ù…Ø§Ù† Ø§Ù„Ù†ÙØ³ÙŠØŒ ÙˆØ¬ÙˆØ¯Ø© Ø§Ù„Ù‚Ø±Ø§Ø±.",
    factor: 1.05,
    gap: "ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© Ù…Ù† Ù†ÙˆØ§ÙŠØ§ Ø¥Ù„Ù‰ Ø³Ù„ÙˆÙƒ Ù‚Ø§Ø¨Ù„ Ù„Ù„Ù…Ù„Ø§Ø­Ø¸Ø©."
  },
  strategy_transformation: {
    title: "Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ© ÙˆØ§Ù„ØªØ­ÙˆÙ„",
    description: "Ø§Ù„Ù…ÙˆØ§Ø¡Ù…Ø©ØŒ Ø§Ù„Ù…Ø¨Ø§Ø¯Ø±Ø§ØªØŒ Ø§Ù„ØªØ­ÙˆÙ„ØŒ Ø§Ù„Ù‚ÙŠØ§Ø³ØŒ ÙˆÙÙ‚Ø¯Ø§Ù† Ø§Ù„ØªØ±ÙƒÙŠØ².",
    factor: 1.1,
    gap: "Ø±Ø¨Ø· Ø§Ù„Ù…Ø¨Ø§Ø¯Ø±Ø§Øª Ø¨Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠØ© Ù„Ø§ Ø¨Ø§Ù„Ø®Ø·Ø© ÙÙ‚Ø·."
  },
  discover: {
    title: "Ù„Ø§ Ø£Ø¹Ø±Ù Ø¨Ø¹Ø¯ØŒ Ø§Ù‚ØªØ±Ø­ Ù„ÙŠ Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø£Ù†Ø³Ø¨",
    description: "Ù‚Ø±Ø§Ø¡Ø© Ø§Ø³ØªÙƒØ´Ø§ÙÙŠØ© ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ø±Ø¤ÙŠØ© Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„Ùƒ.",
    factor: 0.97,
    gap: "ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¹Ø¯Ø³Ø© Ø§Ù„Ø£Ù†Ø³Ø¨ Ù‚Ø¨Ù„ Ø§Ù„ØªØ®ØµØµ."
  }
};

const OUTCOMES = {
  enter: {
    title: "Ø¯Ø®ÙˆÙ„ Ø§Ù„Ù…Ø¬Ø§Ù„ Ù„Ø£ÙˆÙ„ Ù…Ø±Ø©",
    description: "Ù‡Ø¯ÙÙƒ Ø¨Ù†Ø§Ø¡ Ø¨ÙˆØ§Ø¨Ø© Ø¯Ø®ÙˆÙ„ ÙˆØ§Ø¶Ø­Ø© Ù„Ù„Ù…Ø¬Ø§Ù„.",
    factor: 0.95
  },
  interview: {
    title: "Ø±ÙØ¹ ÙØ±ØµÙŠ ÙÙŠ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø§Øª",
    description: "Ù‡Ø¯ÙÙƒ Ø¨Ù†Ø§Ø¡ Ù„ØºØ© Ù…Ù‡Ù†ÙŠØ© ÙˆØ£Ù…Ø«Ù„Ø© Ø¹Ù…Ù„ÙŠØ© ØªÙ‚Ù†Ø¹ Ø¬Ù‡Ø§Øª Ø§Ù„ØªÙˆØ¸ÙŠÙ.",
    factor: 1
  },
  promotion: {
    title: "ØªØ±Ù‚ÙŠØ© Ø£Ùˆ Ø§Ù†ØªÙ‚Ø§Ù„ Ù„Ø¯ÙˆØ± Ø£Ø¹Ù„Ù‰",
    description: "Ù‡Ø¯ÙÙƒ ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØªØ¹Ù„Ù… Ø¥Ù„Ù‰ Ø¬Ø§Ù‡Ø²ÙŠØ© Ù„Ø¯ÙˆØ± Ø£ÙˆØ³Ø¹ ÙˆÙ…Ø³Ø¤ÙˆÙ„ÙŠØ§Øª Ø£Ø¹Ù„Ù‰.",
    factor: 1.06
  },
  salary: {
    title: "ØªØ­Ø³ÙŠÙ† Ø§Ù„Ø±Ø§ØªØ¨",
    description: "Ù‡Ø¯ÙÙƒ Ù‚Ø±Ø§Ø¡Ø© Ù…ÙˆÙ‚Ø¹Ùƒ Ù…Ù† Ø§Ù„Ø³ÙˆÙ‚ ÙˆØ¨Ù†Ø§Ø¡ Ù…Ø¨Ø±Ø±Ø§Øª Ù…Ù‡Ù†ÙŠØ© Ù„Ù„ØªØ­Ø³Ù†.",
    factor: 1.03
  },
  tools: {
    title: "Ø¨Ù†Ø§Ø¡ Ø£Ø¯ÙˆØ§Øª ÙˆÙ†Ù…Ø§Ø°Ø¬ Ø¹Ù…Ù„ÙŠØ©",
    description: "Ù‡Ø¯ÙÙƒ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù‚ÙˆØ§Ù„Ø¨ ÙˆÙ…Ù†ØªØ¬Ø§Øª Ø¹Ù…Ù„ ÙŠÙ…ÙƒÙ† Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§.",
    factor: 1.04
  },
  leadership: {
    title: "ØªØ­Ø³ÙŠÙ† Ù‚Ø±Ø§Ø±Ø§ØªÙŠ ÙƒÙ‚Ø§Ø¦Ø¯",
    description: "Ù‡Ø¯ÙÙƒ ÙÙ‡Ù… Ø§Ù„Ù†Ø§Ø³ ÙˆØ§Ù„Ù…Ù†Ø¸Ù…Ø© Ù„Ø§ØªØ®Ø§Ø° Ù‚Ø±Ø§Ø±Ø§Øª Ø£ÙØ¶Ù„.",
    factor: 1.08
  },
  consulting: {
    title: "Ø¨Ù†Ø§Ø¡ Ù…Ø³Ø§Ø± Ø§Ø³ØªØ´Ø§Ø±ÙŠ",
    description: "Ù‡Ø¯ÙÙƒ ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø¥Ù„Ù‰ ØªØ´Ø®ÙŠØµ ÙˆØªÙˆØµÙŠØ© ÙˆÙ…Ø®Ø±Ø¬Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø¨ÙŠØ¹ Ø£Ùˆ Ø§Ù„ØªØ£Ø«ÙŠØ±.",
    factor: 1.1
  },
  deep_understanding: {
    title: "ÙÙ‡Ù… Ø§Ù„Ù…Ù†Ø¸Ù…Ø§Øª Ø¨Ø¹Ù…Ù‚",
    description: "Ù‡Ø¯ÙÙƒ Ø¨Ù†Ø§Ø¡ Ø¹Ø¯Ø³Ø© Ù…Ù‡Ù†ÙŠØ© ØªÙ‚Ø±Ø£ Ø§Ù„Ù†Ø¸Ø§Ù… Ø®Ù„Ù Ø§Ù„Ø³Ù„ÙˆÙƒ.",
    factor: 1.02
  }
};

const MARKET_CONTEXTS = {
  conservative: {
    title: "Ø¬Ù‡Ø© ØµØºÙŠØ±Ø© Ø£Ùˆ Ø¨Ø¯Ø§ÙŠØ© Ù…Ø­Ø§ÙØ¸Ø©",
    multiplier: 0.92,
    text: "Ù‚Ø±Ø§Ø¡Ø© Ø­Ø°Ø±Ø© ØªÙ†Ø§Ø³Ø¨ Ø§Ù„Ø¨Ø¯Ø§ÙŠØ§Øª Ø£Ùˆ Ø§Ù„Ø¬Ù‡Ø§Øª Ø°Ø§Øª Ø§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ§Øª Ø§Ù„Ù…Ø­Ø¯ÙˆØ¯Ø©."
  },
  balanced: {
    title: "Ø³ÙˆÙ‚ Ù…ØªÙˆØ§Ø²Ù†",
    multiplier: 1,
    text: "Ù‚Ø±Ø§Ø¡Ø© ÙˆØ³Ø·ÙŠØ© Ù…Ø­Ø§ÙØ¸Ø© ØªÙ†Ø§Ø³Ø¨ Ø£ØºÙ„Ø¨ Ø§Ù„ÙØ±Øµ Ø§Ù„Ù…Ù‡Ù†ÙŠØ©."
  },
  competitive: {
    title: "Ø¬Ù‡Ø© ÙƒØ¨Ø±Ù‰ Ø£Ùˆ Ø³ÙˆÙ‚ ØªÙ†Ø§ÙØ³ÙŠ",
    multiplier: 1.12,
    text: "Ù‚Ø±Ø§Ø¡Ø© Ø£Ø¹Ù„Ù‰ Ù‚Ù„ÙŠÙ„Ø§ØŒ Ù„ÙƒÙ†Ù‡Ø§ ØªØ¸Ù„ Ù…Ø´Ø±ÙˆØ·Ø© Ø¨Ø¬ÙˆØ¯Ø© Ø§Ù„Ø®Ø¨Ø±Ø© ÙˆØ§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø© ÙˆØ§Ù„ØªØ·Ø¨ÙŠÙ‚."
  }
};

const APPLICATION_LEVELS = [
  {
    value: 1,
    title: "Ø£Ù‚Ø±Ø£ ÙÙ‚Ø·",
    short: "Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ",
    description: "ØªØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø¯ÙˆÙ† ØªØ­ÙˆÙŠÙ„Ù‡Ø§ Ø¥Ù„Ù‰ Ù…Ù…Ø§Ø±Ø³Ø©.",
    multiplier: 0.62
  },
  {
    value: 2,
    title: "Ø£Ø¯ÙˆÙ† ÙˆØ£Ù„Ø®Øµ",
    short: "ØªÙ†Ø¸ÙŠÙ…",
    description: "ØªØ­ÙˆÙ„ Ø§Ù„ØªØ¹Ù„Ù… Ø¥Ù„Ù‰ Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆÙ„ØºØ© Ù…Ù‡Ù†ÙŠØ© Ù…Ø±ØªØ¨Ø©.",
    multiplier: 0.76
  },
  {
    value: 3,
    title: "Ø£Ø­Ù„Ù„ Ø­Ø§Ù„Ø§Øª",
    short: "ØªØ­Ù„ÙŠÙ„",
    description: "ØªØ³ØªØ®Ø¯Ù… Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… ÙÙŠ Ù‚Ø±Ø§Ø¡Ø© Ù…ÙˆØ§Ù‚Ù ÙˆÙ…Ø´ÙƒÙ„Ø§Øª Ø­Ù‚ÙŠÙ‚ÙŠØ©.",
    multiplier: 0.9
  },
  {
    value: 4,
    title: "Ø£Ø¨Ù†ÙŠ Ù†Ù…Ø§Ø°Ø¬ Ø¹Ù…Ù„",
    short: "Ø¥Ù†ØªØ§Ø¬",
    description: "ØªØ®Ø±Ø¬ Ù…Ù† Ø§Ù„ØªØ¹Ù„Ù… Ø¨Ù‚ÙˆØ§Ù„Ø¨ ÙˆØ£Ø¯ÙˆØ§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù….",
    multiplier: 1
  },
  {
    value: 5,
    title: "Ø£Ø·Ø¨Ù‚ ÙˆØ£ÙˆØ«Ù‚ Ø§Ù„Ø£Ø«Ø±",
    short: "Ø£Ø«Ø±",
    description: "ØªØ±Ø¨Ø· Ø§Ù„ØªØ¹Ù„Ù… Ø¨Ø³Ù„ÙˆÙƒ ÙˆÙ‚Ø±Ø§Ø± ÙˆÙ†ØªÙŠØ¬Ø© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ù‚ÙŠØ§Ø³.",
    multiplier: 1.12
  }
];

const SOURCES = [
  {
    name: "Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ø¥Ø­ØµØ§Ø¡",
    type: "Ø§Ù„Ù…Ø±Ø¬Ø¹ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ù„Ø¥Ø­ØµØ§Ø¡Ø§Øª ÙÙŠ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©",
    year: "2025 - 2026",
    url: "https://www.stats.gov.sa"
  },
  {
    name: "Ù†Ø´Ø±Ø© Ø³ÙˆÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ù…Ù† Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ø¥Ø­ØµØ§Ø¡",
    type: "Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø¹Ù…Ù„ ÙˆØ§Ù„Ø£Ø¬ÙˆØ± ÙˆØ§Ù„Ø¨Ø·Ø§Ù„Ø©",
    year: "2025",
    url: "https://www.stats.gov.sa/documents/d/guest/labor-market-statistics-q2-2025-en"
  },
  {
    name: "Ù…Ø¤Ø´Ø± Ø£Ø³Ø¹Ø§Ø± Ø§Ù„Ù…Ø³ØªÙ‡Ù„Ùƒ Ù…Ù† Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ù„Ø¥Ø­ØµØ§Ø¡",
    type: "ØªØ¶Ø®Ù… ÙˆÙ‚ÙŠÙ…Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù„Ù„Ø¯Ø®Ù„",
    year: "2025",
    url: "https://www.stats.gov.sa/en/w/news/116"
  },
  {
    name: "Ù…Ù†ØµØ© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©",
    type: "Ù…Ø¤Ø´Ø±Ø§Øª ÙˆØ·Ù†ÙŠØ© Ù…Ø³Ø§Ù†Ø¯Ø©",
    year: "2025 - 2026",
    url: "https://datasaudi.sa"
  },
  {
    name: "ÙˆØ²Ø§Ø±Ø© Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ÙˆØ§Ù„ØªÙ†Ù…ÙŠØ© Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠØ©",
    type: "ØªÙ†Ø¸ÙŠÙ…Ø§Øª Ø§Ù„Ø¹Ù…Ù„ ÙˆØ§Ù„ØªÙˆØ·ÙŠÙ†",
    year: "2025 - 2026",
    url: "https://hrsd.gov.sa"
  },
  {
    name: "Ù…Ù†ØµØ© Ù‚ÙˆÙ‰",
    type: "Ù…Ù†ØµØ© Ø±Ø³Ù…ÙŠØ© Ù„Ù„Ø¹Ù‚ÙˆØ¯ ÙˆØ§Ù„Ø¹Ù…Ù„ ÙˆØ§Ù„Ø®Ø¯Ù…Ø§Øª",
    year: "2025 - 2026",
    url: "https://www.qiwa.sa"
  },
  {
    name: "Ù‚Ø±Ø§Ø± Ø§Ø­ØªØ³Ø§Ø¨ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠ ÙÙŠ Ù†Ø·Ø§Ù‚Ø§Øª",
    type: "Ø­Ø¯ ØªÙ†Ø¸ÙŠÙ…ÙŠ Ù…Ø±Ø¬Ø¹ÙŠ Ù„Ø§ ÙŠØ¹Ø¨Ø± ÙˆØ­Ø¯Ù‡ Ø¹Ù† Ø±Ø§ØªØ¨ Ø§Ù„Ø³ÙˆÙ‚",
    year: "Ù…Ø±Ø¬Ø¹ ØªÙ†Ø¸ÙŠÙ…ÙŠ",
    url: "https://www.spa.gov.sa/2160616"
  },
  {
    name: "Cooper Fitch KSA Salary Guide",
    type: "Ø¯Ù„ÙŠÙ„ Ø±ÙˆØ§ØªØ¨ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©",
    year: "2026",
    url: "https://cooperfitch.ae/2026-ksa-salary-guide/"
  },
  {
    name: "Cooper Fitch Saudi Arabia Salary Guide",
    type: "Ù…Ù†Ù‡Ø¬ÙŠØ© ÙˆØªØ¹ÙˆÙŠØ¶Ø§Øª ÙˆØ³ÙˆÙ‚ Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©",
    year: "Ø³Ù†ÙˆÙŠ",
    url: "https://cooperfitch.ae/salary-guides/kingdom-of-saudi-arabia/"
  },
  {
    name: "Hays Saudi Arabia Salary Guide",
    type: "Ø£ÙƒØ«Ø± Ù…Ù† 200 Ø¯ÙˆØ± ÙˆÙ…Ø¤Ø´Ø±Ø§Øª ØªÙˆØ¸ÙŠÙ",
    year: "2026",
    url: "https://www.hays.ae/salary-guide/saudi-arabia-salary-guide"
  },
  {
    name: "Robert Walters Saudi Arabia Salary Survey",
    type: "Ø§Ø³ØªØ·Ù„Ø§Ø¹ Ø±ÙˆØ§ØªØ¨ ÙˆØ§ØªØ¬Ø§Ù‡Ø§Øª Ù…Ù‡Ù†ÙŠØ©",
    year: "2026",
    url: "https://www.robertwalters.ae/our-services/saudi-arabia-salary-survey.html"
  },
  {
    name: "Mercer Total Remuneration Survey",
    type: "ØªØ¹ÙˆÙŠØ¶Ø§Øª ÙˆÙ…Ø²Ø§ÙŠØ§ ÙˆÙ…Ù‚Ø§Ø±Ù†Ø§Øª Ø³ÙˆÙ‚ÙŠØ©",
    year: "2025 - 2026",
    url: "https://www.mercer.com/en-sa/insights/events/mercer-compensation-and-benefits-survey/"
  },
  {
    name: "Mercer Global Compensation Data",
    type: "Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ø§Ù„Ù…ÙŠØ© Ù„Ù„ØªØ¹ÙˆÙŠØ¶Ø§Øª ÙˆØ§Ù„Ù…Ø²Ø§ÙŠØ§",
    year: "2025 - 2026",
    url: "https://www.mercer.com/en-sa/solutions/talent-and-rewards/rewards-strategy/global-compensation-and-benefits-data/"
  },
  {
    name: "Michael Page Saudi Arabia Jobs and Salary Guide",
    type: "Ø³ÙˆÙ‚ Ø§Ù„ØªÙˆØ¸ÙŠÙ ÙˆØ±ÙˆØ§Ø¨Ø· Ø£Ø¯Ù„Ø© Ø§Ù„Ø±ÙˆØ§ØªØ¨",
    year: "2026",
    url: "https://www.michaelpage.ae/jobs/saudi-arabia"
  },
  {
    name: "CIPD Profession Map",
    type: "Ù…Ø³ØªÙˆÙŠØ§Øª Ø§Ù„Ø£Ø«Ø± Ø§Ù„Ù…Ù‡Ù†ÙŠ ÙˆØªØ·ÙˆØ± Ù…Ù‡Ù†Ø© Ø§Ù„Ù†Ø§Ø³",
    year: "2025 - 2026",
    url: "https://www.cipd.org/en/the-people-profession/the-profession-map/explore-the-profession-map/"
  },
  {
    name: "SHRM Certification",
    type: "Ø¥Ø·Ø§Ø± ÙƒÙØ§Ø¡Ø§Øª ÙˆÙ…Ù…Ø§Ø±Ø³Ø§Øª Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©",
    year: "2025 - 2026",
    url: "https://www.shrm.org/credentials/certification"
  }
];

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(number)));
}

function formatNumber(value) {
  return new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(Number(value || 0))));
}

function clamp(value, min, max) {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function getExperienceStage(years) {
  const value = clamp(years, 0, 25);

  if (value < 1) {
    return {
      label: "Ø¨Ø¯Ø§ÙŠØ© Ù…Ù‡Ù†ÙŠØ©",
      factor: 0.9,
      score: 8,
      description: "Ø®Ø¨Ø±ØªÙƒ Ù…Ø§ Ø²Ø§Ù„Øª ÙÙŠ Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©ØŒ Ù„Ø°Ù„Ùƒ ØªÙ‚Ø±Ø£ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ù†Ø·Ø§Ù‚ Ø¨Ø­Ø°Ø± Ø£ÙƒØ¨Ø±."
    };
  }

  if (value < 3) {
    return {
      label: "Ø®Ø¨Ø±Ø© Ù†Ø§Ø´Ø¦Ø©",
      factor: 0.98,
      score: 12,
      description: "Ù„Ø¯ÙŠÙƒ Ø¨Ø¯Ø§ÙŠØ© Ø®Ø¨Ø±Ø© ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ ÙÙ‡Ù… Ø¨ÙŠØ¦Ø© Ø§Ù„Ø¹Ù…Ù„ØŒ Ù„ÙƒÙ†Ù‡Ø§ ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªÙˆØ«ÙŠÙ‚ ÙˆØªØ·Ø¨ÙŠÙ‚."
    };
  }

  if (value < 6) {
    return {
      label: "Ø®Ø¨Ø±Ø© Ù…ØªÙˆØ³Ø·Ø©",
      factor: 1.08,
      score: 16,
      description: "Ø®Ø¨Ø±ØªÙƒ ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ø±Ø¨Ø· Ø§Ù„ØªØ¹Ù„Ù… Ø¨Ø³ÙŠØ§Ù‚Ø§Øª Ø§Ù„Ø¹Ù…Ù„ ÙˆÙ…Ø´ÙƒÙ„Ø§Øª Ø§Ù„Ù…Ù†Ø¸Ù…Ø§Øª."
    };
  }

  if (value < 10) {
    return {
      label: "Ø®Ø¨Ø±Ø© Ù†Ø§Ø¶Ø¬Ø©",
      factor: 1.18,
      score: 19,
      description: "Ù„Ø¯ÙŠÙƒ Ø±ØµÙŠØ¯ Ù…Ù‡Ù†ÙŠ ÙŠØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØªØ¹Ù„Ù… Ø¥Ù„Ù‰ Ø£Ø­ÙƒØ§Ù… Ø£Ø¹Ù…Ù‚ ÙˆÙ…Ø®Ø±Ø¬Ø§Øª Ø£Ù‚ÙˆÙ‰."
    };
  }

  return {
    label: "Ø®Ø¨Ø±Ø© Ù‚ÙŠØ§Ø¯ÙŠØ© Ø£Ùˆ Ù…Ù…ØªØ¯Ø©",
    factor: 1.28,
    score: 21,
    description: "Ø®Ø¨Ø±ØªÙƒ Ø§Ù„ÙƒØ¨ÙŠØ±Ø© ØªØ¬Ø¹Ù„ Ø£Ø«Ø± Ø§Ù„ØªØ¹Ù„Ù… Ø£Ø¹Ù„Ù‰ Ø¹Ù†Ø¯Ù…Ø§ ØªØ±Ø¨Ø·Ù‡ Ø¨Ø§Ù„ØªØ´Ø®ÙŠØµ ÙˆØ§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆØµÙ†Ø§Ø¹Ø© Ø§Ù„Ù‚Ø±Ø§Ø±."
  };
}

function getPositionLabel(currentSalary, range) {
  if (currentSalary <= 0) {
    return {
      label: "Ø±Ø§ØªØ¨ ØºÙŠØ± Ù…Ø¯Ø®Ù„",
      text: "Ø³ØªÙ‚Ø±Ø£ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø¯ÙˆÙ† Ù…Ù‚Ø§Ø±Ù†Ø© Ø±Ø§ØªØ¨ Ù…Ø¨Ø§Ø´Ø±Ø©. Ù‡Ø°Ø§ Ù…Ù†Ø§Ø³Ø¨ Ù„Ù„Ø®Ø±ÙŠØ¬ Ø£Ùˆ Ù…Ù† Ù„Ø§ ÙŠØ±ÙŠØ¯ Ù…Ø´Ø§Ø±ÙƒØ© Ø±Ø§ØªØ¨Ù‡."
    };
  }

  if (currentSalary < range.low) {
    return {
      label: "Ø£Ù‚Ù„ Ù…Ù† Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…Ø­Ø§ÙØ¸",
      text: "ØªÙˆØ¬Ø¯ ÙØ¬ÙˆØ© Ø¨ÙŠÙ† ÙˆØ¶Ø¹Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ ÙˆØ§Ù„Ø­Ø¯ Ø§Ù„Ø£Ø¯Ù†Ù‰ Ø§Ù„Ù…Ø­Ø§ÙØ¸ Ù„Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù."
    };
  }

  if (currentSalary <= range.high) {
    return {
      label: "Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø³ÙˆÙ‚ÙŠ",
      text: "Ø£Ù†Øª Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ ØªÙ‚Ø±ÙŠØ¨Ø§ØŒ ÙˆØ§Ù„Ø¹Ø§Ø¦Ø¯ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø§Ù†ØªÙ‚Ø§Ù„Ùƒ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ø·Ø§Ù‚ Ù„Ø§ Ù…Ø¬Ø±Ø¯ Ø¯Ø®ÙˆÙ„Ù‡."
    };
  }

  return {
    label: "Ø£Ø¹Ù„Ù‰ Ù…Ù† Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…Ø­Ø§ÙØ¸",
    text: "Ø±Ø§ØªØ¨Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ Ø£Ø¹Ù„Ù‰ Ù…Ù† Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ù…Ø­Ø§ÙØ¸ØŒ Ù„Ø°Ù„Ùƒ Ù„Ø§ ÙŠØµØ­ ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙƒØ²ÙŠØ§Ø¯Ø© Ù…Ø¨Ø§Ø´Ø±Ø©."
  };
}

function getCommitmentMessage(days) {
  if (days < 30) {
    return "ØªÙ‚Ø¯Ù…Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ ÙŠØ¹Ø·ÙŠ Ù„Ù…Ø­Ø© ØªØ£Ø³ÙŠØ³ÙŠØ©ØŒ Ù„ÙƒÙ†Ù‡ Ù„Ø§ ÙŠÙƒÙÙŠ ÙˆØ­Ø¯Ù‡ Ù„ØµÙ†Ø§Ø¹Ø© Ù†Ù‚Ù„Ø© Ù…Ù‡Ù†ÙŠØ© ÙˆØ§Ø¶Ø­Ø©.";
  }

  if (days < 90) {
    return "ØªÙ‚Ø¯Ù…Ùƒ Ø¬ÙŠØ¯ ÙƒØ¨Ø¯Ø§ÙŠØ©ØŒ Ù„ÙƒÙ†Ù‡ ÙŠØ­ØªØ§Ø¬ Ø§Ø³ØªÙ…Ø±Ø§Ø± Ø­ØªÙ‰ ÙŠØ¸Ù‡Ø± Ø£Ø«Ø± Ø£Ù‚ÙˆÙ‰ ÙÙŠ Ø§Ù„Ù„ØºØ© Ø§Ù„Ù…Ù‡Ù†ÙŠØ© ÙˆØ§Ù„Ø­ÙƒÙ… Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±ÙŠ.";
  }

  if (days < 180) {
    return "Ø£Ù†Øª ÙÙŠ Ù…Ù†Ø·Ù‚Ø© Ø¬Ø¯ÙŠØ©. Ø§Ù„Ø§Ù‚ØªØ±Ø§Ø¨ Ù…Ù† Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø±Ø­Ù„Ø© ÙŠØ²ÙŠØ¯ Ù…ÙˆØ«ÙˆÙ‚ÙŠØ© Ø§Ù„Ø£Ø«Ø± Ø§Ù„Ù…Ù‡Ù†ÙŠ Ø§Ù„Ù…ØªÙˆÙ‚Ø¹.";
  }

  return "Ø£ÙƒÙ…Ù„Øª Ø¹Ø§Ù…Ù„ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø§Ù„ÙƒØ§Ù…Ù„. Ù‡Ø°Ù‡ Ø£Ø¹Ù„Ù‰ Ø¬Ø§Ù‡Ø²ÙŠØ© ØªØ¹Ù„ÙŠÙ…ÙŠØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø­Ø§Ø³Ø¨Ø©.";
}

function getReadinessLabel(score) {
  if (score >= 86) return "Ø¬Ø§Ù‡Ø²ÙŠØ© Ø¹Ø§Ù„ÙŠØ©";
  if (score >= 70) return "Ø¬Ø§Ù‡Ø²ÙŠØ© Ù‚ÙˆÙŠØ©";
  if (score >= 54) return "Ø¬Ø§Ù‡Ø²ÙŠØ© Ù†Ø§Ù…ÙŠØ©";
  if (score >= 36) return "Ø¬Ø§Ù‡Ø²ÙŠØ© Ø£ÙˆÙ„ÙŠØ©";
  return "Ø¬Ø§Ù‡Ø²ÙŠØ© Ù…Ø­Ø¯ÙˆØ¯Ø©";
}

function getNextMove(score, relation, outcome, lens) {
  if (score < 36) {
    return "Ø§Ø¨Ø¯Ø£ Ø¨ØªØ«Ø¨ÙŠØª Ø§Ù„Ø£Ø³Ø§Ø³: Ø£ÙƒÙ…Ù„ Ø£ÙˆÙ„ Ø´Ù‡Ø±ØŒ ÙˆØ§ÙƒØªØ¨ Ù…Ù„Ø®ØµØ§ Ø¹Ù…Ù„ÙŠØ§ Ø¨Ø¹Ø¯ ÙƒÙ„ Ø¯Ø±Ø³ØŒ ÙˆÙ„Ø§ ØªØªØ¹Ø¬Ù„ Ù…Ù‚Ø§Ø±Ù†Ø© Ù†ÙØ³Ùƒ Ø¨Ø§Ù„Ø³ÙˆÙ‚.";
  }

  if (score < 54) {
    return "Ø§Ù†ØªÙ‚Ù„ Ù…Ù† Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø¥Ù„Ù‰ Ø§Ù„ØªØ­Ù„ÙŠÙ„: Ø§Ø®ØªØ± Ø­Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø© ÙŠÙˆÙ…ÙŠØ§ØŒ ÙˆØ§ÙƒØªØ¨ ÙØ±Ø¶ÙŠØ© ÙˆØ¨ÙŠØ§Ù†Ø§Øª ÙˆØªØ¯Ø®Ù„ ÙˆÙ…Ø¤Ø´Ø± Ø£Ø«Ø±.";
  }

  if (score < 70) {
    return "Ø§Ø¨Ù† Ù…Ù„ÙØ§ Ù…Ù‡Ù†ÙŠØ§ ØµØºÙŠØ±Ø§: ÙˆØµÙ ÙˆØ¸ÙŠÙÙŠØŒ Ù†Ù…ÙˆØ°Ø¬ ØªØ´Ø®ÙŠØµØŒ Ù…ØµÙÙˆÙØ© ØµÙ„Ø§Ø­ÙŠØ§ØªØŒ ÙˆÙ…Ø¤Ø´Ø± Ù‚ÙŠØ§Ø³ Ø£Ø«Ø±.";
  }

  if (relation === "outside" && outcome === "enter") {
    return "Ø¬Ù‡Ø² Ù‚ØµØ© Ø¯Ø®ÙˆÙ„Ùƒ Ù„Ù„Ù…Ø¬Ø§Ù„: Ù„Ù…Ø§Ø°Ø§ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³Ø§Ø±ØŸ Ù…Ø§ Ø§Ù„Ø°ÙŠ ØªØ¹Ù„Ù…ØªÙ‡ØŸ ÙˆÙ…Ø§ Ø£ÙˆÙ„ Ø¯ÙˆØ± ØªØ³ØªÙ‡Ø¯ÙÙ‡ØŸ";
  }

  if (relation === "consultant" || outcome === "consulting") {
    return "Ø§Ø¨Ù† Ù…Ø­ÙØ¸Ø© Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© ØµØºÙŠØ±Ø©: Ø­Ø§Ù„Ø© ØªØ´Ø®ÙŠØµØŒ Ø®Ø±ÙŠØ·Ø© Ø£ØµØ­Ø§Ø¨ Ù…ØµÙ„Ø­Ø©ØŒ ØªÙˆØµÙŠØ©ØŒ ÙˆÙ…Ø¤Ø´Ø± Ø£Ø«Ø±.";
  }

  if (lens === "od" || lens === "structures_roles") {
    return "ÙˆØ«Ù‚ Ø£Ø¯Ø§Ø© ÙˆØ§Ø­Ø¯Ø© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: Ù†Ù…ÙˆØ°Ø¬ ØªØ´Ø®ÙŠØµØŒ Ù…ØµÙÙˆÙØ© Ø£Ø¯ÙˆØ§Ø±ØŒ Ø£Ùˆ Ø®Ø±ÙŠØ·Ø© ØªØ¯Ø®Ù„ ØªÙ†Ø¸ÙŠÙ…ÙŠ.";
  }

  return "Ø±ÙƒØ² Ø§Ù„Ø¢Ù† Ø¹Ù„Ù‰ Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ù…Ù‡Ù†ÙŠØ©ØŒ Ø£Ù…Ø«Ù„Ø© Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø§ØªØŒ ÙˆØªÙˆØ«ÙŠÙ‚ ØªØ·Ø¨ÙŠÙ‚Ø§Øª ØµØºÙŠØ±Ø© ØªØ«Ø¨Øª ÙÙ‡Ù…Ùƒ.";
}

function getDefaultLevel(relation) {
  const levels = LEVELS_BY_RELATION[relation] || LEVELS_BY_RELATION.outside;
  return levels[0]?.id || "";
}

function getLevelObject(relation, levelId) {
  const levels = LEVELS_BY_RELATION[relation] || LEVELS_BY_RELATION.outside;
  return levels.find((item) => item.id === levelId) || levels[0];
}

export default function LearningROICalculator({
  completedDays = 0,
  totalDays = TOTAL_JOURNEY_DAYS
}) {
  const safeTotalDays = Math.max(1, Number(totalDays || TOTAL_JOURNEY_DAYS));
  const actualCompletedDays = clamp(completedDays, 0, safeTotalDays);

  const [relation, setRelation] = useState("inside");
  const [levelId, setLevelId] = useState(getDefaultLevel("inside"));
  const [lens, setLens] = useState("od");
  const [outcome, setOutcome] = useState("promotion");
  const [yearsOfExperience, setYearsOfExperience] = useState(2);
  const [currentSalary, setCurrentSalary] = useState(8000);
  const [applicationLevel, setApplicationLevel] = useState(3);
  const [marketContext, setMarketContext] = useState("balanced");
  const [useActualProgress, setUseActualProgress] = useState(true);
  const [scenarioDays, setScenarioDays] = useState(actualCompletedDays || 30);
  const [showSources, setShowSources] = useState(false);

  const activeRelation = RELATION_GROUPS[relation];
  const activeLevel = getLevelObject(relation, levelId);
  const activeLens = LENSES[lens];
  const activeOutcome = OUTCOMES[outcome];
  const activeMarket = MARKET_CONTEXTS[marketContext];
  const activeApplication =
    APPLICATION_LEVELS.find((item) => item.value === Number(applicationLevel)) ||
    APPLICATION_LEVELS[2];

  const effectiveDays = useActualProgress
    ? actualCompletedDays
    : clamp(scenarioDays, 1, safeTotalDays);

  function changeRelation(nextRelation) {
    setRelation(nextRelation);
    setLevelId(getDefaultLevel(nextRelation));

    const defaultOutcome = RELATION_GROUPS[nextRelation]?.defaultOutcome;
    if (defaultOutcome && OUTCOMES[defaultOutcome]) {
      setOutcome(defaultOutcome);
    }
  }

  const result = useMemo(() => {
    const progressFactor = clamp(effectiveDays / safeTotalDays, 0, 1);
    const experienceStage = getExperienceStage(yearsOfExperience);

    const rawRange = activeRelation.baseRange;
    const progressLift = 0.74 + progressFactor * 0.26;
    const inflationFactor = 1 + DEFAULT_INFLATION_RATE;

    const combinedFactor =
      experienceStage.factor *
      activeLevel.factor *
      activeLens.factor *
      activeOutcome.factor *
      activeApplication.multiplier *
      activeMarket.multiplier;

    const adjustedLow = rawRange.low * combinedFactor * progressLift;
    const adjustedMid =
      rawRange.mid * combinedFactor * (0.8 + progressFactor * 0.2);
    const adjustedHigh =
      rawRange.high * combinedFactor * (0.82 + progressFactor * 0.18);

    const realLow = adjustedLow / inflationFactor;
    const realMid = adjustedMid / inflationFactor;
    const realHigh = adjustedHigh / inflationFactor;

    const current = Number(currentSalary || 0);

    let monthlyOpportunity = Math.max(0, realLow - current);
    let valueMode = "direct";

    if ((relation === "outside" || relation === "leader") && current > realLow) {
      valueMode = "non-direct";
      monthlyOpportunity = 0;
    }

    const position = getPositionLabel(current, {
      low: realLow,
      mid: realMid,
      high: realHigh
    });

    const progressScore = progressFactor * 34;
    const experienceScore = experienceStage.score;
    const levelScore = Math.min(22, activeLevel.score);
    const applicationScore = (Number(applicationLevel) / 5) * 18;
    const marketScore = current <= realHigh ? 5 : 3;

    const readinessScore = Math.round(
      clamp(
        progressScore + experienceScore + levelScore + applicationScore + marketScore,
        0,
        100
      )
    );

    return {
      progressFactor,
      readinessPercent: Math.round(progressFactor * 100),
      readinessScore,
      readinessLabel: getReadinessLabel(readinessScore),
      nextMove: getNextMove(readinessScore, relation, outcome, lens),
      experienceStage,
      nominalLow: adjustedLow,
      nominalMid: adjustedMid,
      nominalHigh: adjustedHigh,
      realLow,
      realMid,
      realHigh,
      monthlyOpportunity,
      annualOpportunity: monthlyOpportunity * 12,
      valueMode,
      position,
      commitmentMessage: getCommitmentMessage(effectiveDays)
    };
  }, [
    activeApplication,
    activeLevel,
    activeLens,
    activeMarket,
    activeOutcome,
    activeRelation,
    applicationLevel,
    currentSalary,
    effectiveDays,
    lens,
    outcome,
    relation,
    safeTotalDays,
    yearsOfExperience
  ]);

  const professionalPosition = `${activeLevel.title} Â· ${activeLens.title}`;

  return (
    <section className="roi-page" dir="rtl">
      <style>{`
        .roi-page {
          min-height: 100vh;
          padding: 34px 16px 70px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246,.12), transparent 30%),
            radial-gradient(circle at 94% 14%, rgba(245,158,11,.13), transparent 28%),
            radial-gradient(circle at 48% 96%, rgba(16,185,129,.10), transparent 34%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 54%, #fff7ed 100%);
        }

        .roi-wrap {
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .roi-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 15% 18%, rgba(129,140,248,.26), transparent 32%),
            radial-gradient(circle at 85% 15%, rgba(245,158,11,.17), transparent 30%),
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 26px 80px rgba(28, 17, 48, 0.20);
        }

        .roi-hero::before {
          content: "";
          position: absolute;
          inset: -60px;
          opacity: .30;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 48px 48px;
          transform: rotate(-8deg);
        }

        .roi-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 24px;
          align-items: center;
        }

        .roi-kicker {
          display: inline-flex;
          padding: 8px 13px;
          border-radius: 999px;
          color: #fde68a;
          background: rgba(255, 255, 255, .11);
          border: 1px solid rgba(255, 255, 255, .16);
          font-size: 12px;
          font-weight: 950;
        }

        .roi-hero h1 {
          margin: 16px 0 12px;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.16;
          font-weight: 950;
          letter-spacing: -1.1px;
          padding-top: 4px;
          overflow: visible;
        }

        .roi-hero h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c3b5e8, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          padding-top: 3px;
        }

        .roi-hero p {
          margin: 0;
          max-width: 780px;
          color: rgba(196, 181, 253,.9);
          font-size: 15px;
          line-height: 2.05;
          font-weight: 750;
        }

        .roi-orbit {
          display: grid;
          place-items: center;
          min-height: 310px;
        }

        .roi-orbit-card {
          position: relative;
          width: min(300px, 100%);
          aspect-ratio: 1;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#10b981 ${result.readinessScore * 3.6}deg, rgba(255,255,255,.13) 0deg);
          box-shadow:
            inset 0 0 0 15px rgba(28, 17, 48,.42),
            0 24px 70px rgba(0,0,0,.20);
        }

        .roi-orbit-inner {
          width: 205px;
          height: 205px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          text-align: center;
          background: #18102e;
          border: 1px solid rgba(255,255,255,.14);
          padding: 18px;
        }

        .roi-orbit-inner span {
          color: #9d8fc0;
          font-size: 12px;
          font-weight: 900;
        }

        .roi-orbit-inner strong {
          display: block;
          color: #fff;
          font-size: 48px;
          line-height: 1;
          font-weight: 950;
          margin: 8px 0;
        }

        .roi-orbit-inner b {
          color: #fde68a;
          font-size: 13px;
          font-weight: 950;
        }

        .roi-grid {
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          gap: 18px;
          margin-top: 18px;
        }

        .roi-panel {
          border-radius: 32px;
          padding: 24px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter: blur(18px);
        }

        .roi-panel h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 26px;
          font-weight: 950;
          line-height: 1.35;
        }

        .roi-panel > p {
          margin: 0 0 18px;
          color: #7a6c9a;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .roi-field {
          margin-bottom: 16px;
        }

        .roi-field label {
          display: block;
          margin-bottom: 8px;
          color: #463c63;
          font-size: 13px;
          font-weight: 950;
        }

        .roi-field select,
        .roi-field input[type="number"] {
          width: 100%;
          min-height: 48px;
          border-radius: 18px;
          border: 1px solid #c9bdf0;
          background: #fff;
          color: #18102e;
          padding: 0 14px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          outline: none;
        }

        .roi-field select:focus,
        .roi-field input[type="number"]:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .roi-range {
          width: 100%;
          accent-color: #8b5cf6;
        }

        .roi-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 7px;
          border-radius: 22px;
          background: #efe9fb;
          margin-bottom: 16px;
        }

        .roi-switch button {
          border: 0;
          cursor: pointer;
          border-radius: 16px;
          min-height: 42px;
          padding: 10px 12px;
          color: #5b4f78;
          background: transparent;
          font-family: inherit;
          font-weight: 950;
        }

        .roi-switch button.active {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          box-shadow: 0 12px 28px rgba(139, 92, 246,.20);
        }

        .application-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .application-pill {
          border: 1px solid rgba(167, 139, 250,.22);
          border-radius: 16px;
          padding: 10px 8px;
          background: #fff;
          color: #463c63;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 950;
          line-height: 1.5;
          min-height: 58px;
        }

        .application-pill.active {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          border-color: transparent;
        }

        .roi-result-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .roi-result-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 14px 38px rgba(28, 17, 48,.06);
        }

        .roi-result-card::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -70px;
          width: 150px;
          height: 150px;
          border-radius: 999px;
          background: rgba(139, 92, 246,.10);
        }

        .roi-result-card.gold::before {
          background: rgba(245,158,11,.15);
        }

        .roi-result-card.green::before {
          background: rgba(16,185,129,.14);
        }

        .roi-result-card.red::before {
          background: rgba(244,63,94,.13);
        }

        .roi-result-card span {
          position: relative;
          z-index: 1;
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 9px;
        }

        .roi-result-card strong {
          position: relative;
          z-index: 1;
          display: block;
          color: #18102e;
          font-size: 21px;
          line-height: 1.35;
          font-weight: 950;
        }

        .roi-result-card p {
          position: relative;
          z-index: 1;
          margin: 9px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 750;
        }

        .value-map {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .value-step {
          border-radius: 22px;
          padding: 15px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.20);
        }

        .value-step b {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          color: white;
          background: #8b5cf6;
          margin-bottom: 8px;
          font-size: 11px;
          line-height: 1;
        }

        .value-step strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.6;
        }

        .value-step span {
          display: block;
          margin-top: 5px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.75;
          font-weight: 750;
        }

        .roi-reading {
          margin-top: 14px;
          border-radius: 26px;
          padding: 18px;
          color: #281748;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 34%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250,.22);
        }

        .roi-reading h3 {
          margin: 0 0 10px;
          color: #18102e;
          font-size: 19px;
          font-weight: 950;
        }

        .roi-reading p {
          margin: 0;
          color: #5b4f78;
          line-height: 2;
          font-size: 13px;
          font-weight: 800;
        }

        .roi-sources {
          margin-top: 18px;
        }

        .roi-sources-toggle {
          display: flex;
          justify-content: center;
          margin-top: 14px;
        }

        .roi-sources-toggle button {
          border: 0;
          cursor: pointer;
          border-radius: 18px;
          padding: 12px 16px;
          color: #fff;
          background: #18102e;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
        }

        .roi-sources-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .roi-source {
          text-decoration: none;
          border-radius: 20px;
          padding: 13px;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(167, 139, 250,.22);
          color: #18102e;
          transition: .2s ease;
        }

        .roi-source:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(28, 17, 48,.08);
        }

        .roi-source strong {
          display: block;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 950;
        }

        .roi-source span {
          display: block;
          margin-top: 5px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 750;
        }

        .roi-source small {
          display: inline-flex;
          margin-top: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 10px;
          font-weight: 950;
        }

        .roi-disclaimer {
          margin-top: 16px;
          border-radius: 24px;
          padding: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
          font-size: 12px;
          line-height: 1.95;
          font-weight: 850;
        }

        @media (max-width: 980px) {
          .roi-hero-inner,
          .roi-grid,
          .roi-result-grid,
          .roi-sources-grid,
          .value-map {
            grid-template-columns: 1fr;
          }

          .application-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .roi-page {
            padding: 18px 10px 46px;
          }

          .roi-hero,
          .roi-panel {
            border-radius: 26px;
            padding: 20px;
          }

          .roi-switch {
            grid-template-columns: 1fr;
          }

          .roi-orbit-card {
            width: 240px;
          }

          .roi-orbit-inner {
            width: 165px;
            height: 165px;
          }
        }
      `}</style>

      <div className="roi-wrap">
        <header className="roi-hero">
          <div className="roi-hero-inner">
            <div>
              <span className="roi-kicker">Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ø§Ø¦Ø¯ Ù…Ù† Ø§Ù„ØªØ¹Ù„Ù…</span>

              <h1>
                Ø§Ù„ØªØ¹Ù„Ù… Ù…Ø¬Ø§Ù†ÙŠ
                <span>Ù„ÙƒÙ† Ù‚ÙŠÙ…ØªÙ‡ Ø§Ù„Ù…Ù‡Ù†ÙŠØ© ØªÙ‚Ø±Ø£ Ø¨Ø°ÙƒØ§Ø¡</span>
              </h1>

              <p>
                ØªØ¨Ø¯Ø£ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ù…Ù† Ø¹Ù„Ø§Ù‚ØªÙƒ Ø¨Ù…Ø¬Ø§Ù„ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ÙˆØ§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØŒ
                Ø«Ù… ØªÙ‚Ø±Ø£ Ù…Ø³ØªÙˆØ§Ùƒ ÙˆØ¹Ø¯Ø³ØªÙƒ ÙˆÙ‡Ø¯ÙÙƒ ÙˆØªÙ‚Ø¯Ù…Ùƒ Ø§Ù„ÙØ¹Ù„ÙŠ Ù„ØªÙ†ØªØ¬ Ù‚Ø±Ø§Ø¡Ø© Ù…Ù‡Ù†ÙŠØ©
                Ù…Ø­Ø§ÙØ¸Ø©ØŒ Ù„Ø§ ÙˆØ¹Ø¯Ø§ ÙˆØ¸ÙŠÙÙŠØ§.
              </p>
            </div>

            <div className="roi-orbit" aria-label="مؤشر الجاهزية المهنية">
              <NeoMetricGauge
                className="roi-readiness-gauge"
                value={result.readinessScore}
                max={100}
                displayValue={`${result.readinessScore}%`}
                label="مؤشر الجاهزية"
                subLabel={result.readinessLabel}
                status="readiness"
                size="hero"
              />
            </div>
          </div>
        </header>

        <div className="roi-grid">
          <aside className="roi-panel">
            <h2>Ù…Ø¯Ø®Ù„Ø§Øª Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©</h2>
            <p>
              Ø§Ø®ØªØ± Ø¹Ù„Ø§Ù‚ØªÙƒ Ø¨Ø§Ù„Ù…Ø¬Ø§Ù„ Ø£ÙˆÙ„Ø§ØŒ Ø«Ù… Ø³ÙŠØ¸Ù‡Ø± Ù…Ø³ØªÙˆÙ‰ Ù…Ù†Ø§Ø³Ø¨ Ù„Ù‡Ø°Ù‡ Ø§Ù„Ø¹Ù„Ø§Ù‚Ø© Ø¨Ø¯ÙˆÙ†
              ØªÙƒØ±Ø§Ø± Ø£Ùˆ Ø®Ù„Ø· Ø¨ÙŠÙ† Ø§Ù„Ù…Ø³Ø§Ø±Ø§Øª.
            </p>

            <div className="roi-field">
              <label>Ø£ÙˆÙ„Ø§: Ø£ÙŠÙ† ØªÙ‚Ù Ù…Ù† Ù…Ø¬Ø§Ù„ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ÙˆØ§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØŸ</label>
              <select
                value={relation}
                onChange={(event) => changeRelation(event.target.value)}
              >
                {Object.entries(RELATION_GROUPS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>Ø«Ø§Ù†ÙŠØ§: Ù…Ø§ Ø§Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„ÙˆØ¶Ø¹Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠØŸ</label>
              <select value={levelId} onChange={(event) => setLevelId(event.target.value)}>
                {(LEVELS_BY_RELATION[relation] || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>Ø«Ø§Ù„Ø«Ø§: Ù…Ø§ Ø§Ù„Ø¹Ø¯Ø³Ø© Ø§Ù„ØªÙŠ ØªØ±ÙŠØ¯ ØªÙ‚ÙˆÙŠØªÙ‡Ø§ØŸ</label>
              <select value={lens} onChange={(event) => setLens(event.target.value)}>
                {Object.entries(LENSES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>Ø±Ø§Ø¨Ø¹Ø§: Ù…Ø§ Ø§Ù„Ø¹Ø§Ø¦Ø¯ Ø§Ù„Ø°ÙŠ ØªØ¨Ø­Ø« Ø¹Ù†Ù‡ Ù…Ù† Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø­Ù„Ø©ØŸ</label>
              <select value={outcome} onChange={(event) => setOutcome(event.target.value)}>
                {Object.entries(OUTCOMES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ©</label>
              <input
                type="number"
                min="0"
                max="25"
                value={yearsOfExperience}
                onChange={(event) => setYearsOfExperience(Number(event.target.value))}
              />
            </div>

            <div className="roi-field">
              <label>Ø±Ø§ØªØ¨Ùƒ Ø§Ù„Ø´Ù‡Ø±ÙŠ Ø§Ù„Ø­Ø§Ù„ÙŠ - Ø§Ø®ØªÙŠØ§Ø±ÙŠ</label>
              <input
                type="number"
                min="0"
                max="50000"
                value={currentSalary}
                onChange={(event) => setCurrentSalary(Number(event.target.value))}
              />
            </div>

            <div className="roi-field">
              <label>Ø¨ÙŠØ¦Ø© Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯ÙØ©</label>
              <select
                value={marketContext}
                onChange={(event) => setMarketContext(event.target.value)}
              >
                {Object.entries(MARKET_CONTEXTS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>ÙƒÙŠÙ ØªØ·Ø¨Ù‚ Ù…Ø§ ØªØªØ¹Ù„Ù…Ù‡ØŸ</label>
              <div className="application-grid">
                {APPLICATION_LEVELS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`application-pill ${
                      item.value === Number(applicationLevel) ? "active" : ""
                    }`}
                    onClick={() => setApplicationLevel(item.value)}
                    title={item.description}
                  >
                    {item.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="roi-switch" aria-label="Ù…ØµØ¯Ø± Ø¹Ø§Ù…Ù„ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù…">
              <button
                type="button"
                className={useActualProgress ? "active" : ""}
                onClick={() => setUseActualProgress(true)}
              >
                ØªÙ‚Ø¯Ù…ÙŠ Ø§Ù„ÙØ¹Ù„ÙŠ
              </button>

              <button
                type="button"
                className={!useActualProgress ? "active" : ""}
                onClick={() => setUseActualProgress(false)}
              >
                Ø³ÙŠÙ†Ø§Ø±ÙŠÙˆ Ø§ÙØªØ±Ø§Ø¶ÙŠ
              </button>
            </div>

            {!useActualProgress && (
              <div className="roi-field">
                <label>Ø£ÙŠØ§Ù… Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©: {formatNumber(effectiveDays)} ÙŠÙˆÙ…</label>
                <input
                  className="roi-range"
                  type="range"
                  min="1"
                  max={safeTotalDays}
                  value={scenarioDays}
                  onChange={(event) => setScenarioDays(Number(event.target.value))}
                />
              </div>
            )}

            <div className="roi-reading">
              <h3>{activeRelation.shortTitle}</h3>
              <p>{activeRelation.description}</p>
            </div>
          </aside>

          <main className="roi-panel">
            <h2>Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù†ØªÙŠØ¬Ø©</h2>
            <p>
              Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ù…Ø­Ø§ÙØ¸Ø©ØŒ ÙˆØªØ³ØªØ®Ø¯Ù… ØªØ¶Ø®Ù…Ø§ Ø§ÙØªØ±Ø§Ø¶ÙŠØ§ Ù‚Ø¯Ø±Ù‡{" "}
              {(DEFAULT_INFLATION_RATE * 100).toFixed(1)}% Ù„Ø¹Ø±Ø¶ Ø§Ù„Ù‚ÙŠÙ…Ø© Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©.
            </p>

            <div className="roi-result-grid">
              <div className="roi-result-gauge-card">
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={professionalPosition}
                  label="تموضعك المهني"
                  status="progress"
                  size="default"
                />
                <p>{activeLevel.description}</p>
              </div>

              <div className="roi-result-gauge-card">
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={activeLens.gap}
                  label="فجوة التعلم الأقرب"
                  status="warning"
                  size="default"
                />
                <p>{activeLens.description}</p>
              </div>

              <div className="roi-result-gauge-card">
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={`${formatCurrency(result.realLow)} - ${formatCurrency(result.realHigh)}`}
                  label="النطاق الحقيقي المحافظ"
                  status="complete"
                  size="default"
                />
                <p>نطاق تقديري بعد أثر التضخم، وليس ضمانا للدخل.</p>
              </div>

              <div className="roi-result-gauge-card">
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={result.position.label}
                  label="موقعك الحالي من النطاق"
                  status="progress"
                  size="default"
                />
                <p>{result.position.text}</p>
              </div>

              <div className="roi-result-gauge-card">
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={formatCurrency(result.monthlyOpportunity)}
                  label="فرصة التحسن الشهرية المحافظة"
                  status="complete"
                  size="default"
                />
                <p>تظهر عندما يكون الراتب الحالي أقل من الحد المحافظ للنطاق.</p>
              </div>

              <div className="roi-result-gauge-card">
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={result.annualOpportunity > 0 ? formatCurrency(result.annualOpportunity) : "قيمة غير مالية مباشرة"}
                  label="قيمة التعلم المجاني"
                  status={result.annualOpportunity > 0 ? "complete" : "readiness"}
                  size="default"
                />
                <p>القيمة قد تكون مالية، أو مهنية مثل تقليل التخبط ورفع الجاهزية.</p>
              </div>
            </div>
            <div className="roi-reading">
              <h3>Ø§Ù„ØªÙØ³ÙŠØ± Ø§Ù„Ù…Ù‡Ù†ÙŠ</h3>
              <p>
                {result.valueMode === "non-direct"
                  ? "Ù„Ø£Ù† ÙˆØ¶Ø¹Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ Ù„Ø§ ÙŠÙ‚Ø±Ø£ ÙƒØ²ÙŠØ§Ø¯Ø© Ø±Ø§ØªØ¨ Ù…Ø¨Ø§Ø´Ø±Ø©ØŒ ÙØ§Ù„Ù‚ÙŠÙ…Ø© Ù‡Ù†Ø§ ØªØ¸Ù‡Ø± ÙÙŠ ÙˆØ¶ÙˆØ­ Ø§Ù„Ù…Ø³Ø§Ø±ØŒ ÙˆÙ†Ø¶Ø¬ Ø§Ù„Ø­ÙƒÙ… Ø§Ù„Ù…Ù‡Ù†ÙŠØŒ ÙˆØªÙ‚Ù„ÙŠÙ„ Ø§Ù„ØªØ®Ø¨Ø·ØŒ ÙˆØ¨Ù†Ø§Ø¡ Ù„ØºØ© ÙˆÙ…Ø®Ø±Ø¬Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…."
                  : `${activeOutcome.description} ${activeMarket.text}`}
              </p>
            </div>

            <div className="roi-reading">
              <h3>Ø­Ø±ÙƒØ© ÙˆØ§Ø­Ø¯Ø© ØªØ±ÙØ¹ Ù†ØªÙŠØ¬ØªÙƒ</h3>
              <p>{result.nextMove}</p>
            </div>

            <div className="roi-reading">
              <h3>Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ù‚ÙŠÙ…Ø©</h3>
              <div className="value-map">
                <div className="value-step">
                  <b>01</b>
                  <strong>Ø¹Ù„Ø§Ù‚Ø© Ø¨Ø§Ù„Ù…Ø¬Ø§Ù„</strong>
                  <span>{activeRelation.shortTitle}</span>
                </div>

                <div className="value-step">
                  <b>02</b>
                  <strong>Ù…Ø³ØªÙˆÙ‰ Ù…Ù‡Ù†ÙŠ</strong>
                  <span>{activeLevel.title}</span>
                </div>

                <div className="value-step">
                  <b>03</b>
                  <strong>Ø¹Ø¯Ø³Ø© Ø§Ù„ØªØ¹Ù„Ù…</strong>
                  <span>{activeLens.title}</span>
                </div>

                <div className="value-step">
                  <b>04</b>
                  <strong>ØªÙ‚Ø¯Ù… ÙØ¹Ù„ÙŠ</strong>
                  <span>{formatNumber(effectiveDays)} Ù…Ù† {formatNumber(safeTotalDays)} ÙŠÙˆÙ…</span>
                </div>
              </div>
            </div>
          </main>
        </div>

        <section className="roi-panel roi-sources">
          <h2>Ù…Ù†Ù‡Ø¬ÙŠØ© Ø§Ù„Ø­Ø§Ø³Ø¨Ø© ÙˆÙ…ØµØ§Ø¯Ø± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</h2>
          <p>
            Ù‡Ø°Ù‡ Ø§Ù„Ù…ØµØ§Ø¯Ø± Ù„Ø§ ØªØ¹Ù†ÙŠ Ø£Ù† Ø§Ù„Ø£Ø±Ù‚Ø§Ù… ÙˆØ¹Ø¯ Ù†Ù‡Ø§Ø¦ÙŠØŒ Ù„ÙƒÙ†Ù‡Ø§ ØªØ¬Ø¹Ù„ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø£Ù‚Ø±Ø¨
            Ø¥Ù„Ù‰ Ø§Ù„Ø³ÙˆÙ‚ ÙˆØ£ÙƒØ«Ø± ØªØ­ÙØ¸Ø§. Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ« Ù…Ù†Ù‡Ø¬ÙŠ Ù…Ø³ØªÙ‡Ø¯Ù: 2025 - 2026.
          </p>

          <div className="roi-sources-toggle">
            <button type="button" onClick={() => setShowSources((value) => !value)}>
              {showSources ? "Ø¥Ø®ÙØ§Ø¡ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹" : "Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹ Ø§Ù„Ù…ÙˆØ³Ø¹Ø©"}
            </button>
          </div>

          {showSources && (
            <div className="roi-sources-grid">
              {SOURCES.map((source) => (
                <a
                  className="roi-source"
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <strong>{source.name}</strong>
                  <span>{source.type}</span>
                  <small>{source.year}</small>
                </a>
              ))}
            </div>
          )}

          <div className="roi-disclaimer">
            ØªÙ†ÙˆÙŠÙ‡: Ù‡Ø°Ù‡ Ø§Ù„Ø­Ø§Ø³Ø¨Ø© Ø£Ø¯Ø§Ø© ØªÙ‚Ø¯ÙŠØ±ÙŠØ© Ù…Ø­Ø§ÙØ¸Ø©ØŒ ÙˆÙ„Ø§ ØªÙ…Ø«Ù„ ÙˆØ¹Ø¯Ø§ ÙˆØ¸ÙŠÙÙŠØ§ Ø£Ùˆ
            Ø¶Ù…Ø§Ù†Ø§ Ù„Ù„Ø¯Ø®Ù„. Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ÙØ¹Ù„ÙŠØ© ØªØªØ£Ø«Ø± Ø¨ØªÙˆÙÙŠÙ‚ Ø§Ù„Ù„Ù‡ØŒ Ø«Ù… Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©ØŒ Ù†ÙˆØ¹
            Ø§Ù„Ø¬Ù‡Ø©ØŒ Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø©ØŒ Ø¬ÙˆØ¯Ø© Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©ØŒ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„Ø§ØªØŒ Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ØŒ
            ÙˆØ§Ù„Ø¸Ø±ÙˆÙ Ø§Ù„Ø³ÙˆÙ‚ÙŠØ© ÙˆÙ‚Øª Ø§Ù„ØªÙ‚Ø¯ÙŠÙ….
          </div>
        </section>
      </div>
    </section>
  );
}


