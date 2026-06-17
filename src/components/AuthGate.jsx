import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import VisitorTestimonialsMarquee from "./VisitorTestimonialsMarquee";
import SiteLogo from "./SiteLogo";
import BrandMeta from "./BrandMeta";
import ExperienceDesignSkin from "./ExperienceDesignSkin";
import ThemeToggle from "./ThemeToggle";
import { LegalFooterLinks } from "./LegalLinks";
import NeoMetricGauge from "./NeoMetricGauge";

const MONTHS = [
  {
    number: "01",
    title: "ØªØ£Ø³ÙŠØ³ Ø§Ù„Ø¹Ù‚Ù„ Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ",
    output: "Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù†Ø¸Ù…Ø© ÙƒÙ†Ø¸Ø§Ù… Ø­ÙŠ Ù‚Ø¨Ù„ Ø§Ù„Ù‚ÙØ² Ø¥Ù„Ù‰ Ø§Ù„Ø­Ù„ÙˆÙ„."
  },
  {
    number: "02",
    title: "ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…Ù†Ø¸Ù…Ø© ÙˆØ§Ù„Ù‡ÙŠØ§ÙƒÙ„ ÙˆØ§Ù„Ø£Ø¯ÙˆØ§Ø±",
    output: "ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØªØ´Ø®ÙŠØµ Ø¥Ù„Ù‰ Ø£Ø¯ÙˆØ§Ø± ÙˆØµÙ„Ø§Ø­ÙŠØ§Øª ÙˆÙ†Ø¸Ø§Ù… Ø¹Ù…Ù„ ÙˆØ§Ø¶Ø­."
  },
  {
    number: "03",
    title: "ØªØµÙ…ÙŠÙ… Ø§Ù„ØªØ¯Ø®Ù„Ø§Øª Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØ©",
    output: "Ø§Ø®ØªÙŠØ§Ø± ØªØ¯Ø®Ù„ Ù…Ù†Ø§Ø³Ø¨ ÙŠØ¹Ø§Ù„Ø¬ Ø§Ù„Ø³Ø¨Ø¨ Ù„Ø§ Ø§Ù„Ø¹Ø±Ø¶."
  },
  {
    number: "04",
    title: "Ù‚ÙŠØ§Ø¯Ø© Ø§Ù„ØªØºÙŠÙŠØ± ÙˆØ§Ù„ØªØ­ÙˆÙ„",
    output: "Ø¨Ù†Ø§Ø¡ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù‚Ø§ÙˆÙ…Ø© ÙˆØ§Ø³ØªØ¯Ø§Ù…Ø© Ø§Ù„ØªØºÙŠÙŠØ±."
  },
  {
    number: "05",
    title: "Ø§Ù„Ø«Ù‚Ø§ÙØ© ÙˆØ§Ù„ØªØ¹Ù„Ù… ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ù‚Ø¯Ø±Ø©",
    output: "Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø«Ù‚Ø© ÙˆØ§Ù„Ø³Ù„ÙˆÙƒ ÙˆØ§Ù„ØªØ¹Ù„Ù… Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠ ÙƒÙ‚Ø¯Ø±Ø© Ù…Ø³ØªÙ…Ø±Ø©."
  },
  {
    number: "06",
    title: "Ù‚ÙŠØ§Ø³ Ø§Ù„Ø£Ø«Ø± ÙˆØ§Ù„Ø§Ø­ØªØ±Ø§Ù",
    output: "Ø±Ø¨Ø· Ø§Ù„ØªØ¯Ø®Ù„Ø§Øª Ø¨Ù…Ø¤Ø´Ø±Ø§Øª Ø£Ø«Ø± ÙˆÙ…Ù…Ø§Ø±Ø³Ø© Ù…Ù‡Ù†ÙŠØ© Ù†Ø§Ø¶Ø¬Ø©."
  }
];

const FAQ = [
  {
    q: "Ù‡Ù„ Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø¬Ø§Ù†ÙŠØ©ØŸ",
    a: "Ù†Ø¹Ù…ØŒ Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø¬Ø§Ù†ÙŠØ© Ù„ÙˆØ¬Ù‡ Ø§Ù„Ù„Ù‡ØŒ ÙˆÙ‡Ø¯ÙÙ‡Ø§ Ù†Ø´Ø± Ù…Ø¹Ø±ÙØ© Ù…Ù‡Ù†ÙŠØ© Ù†Ø§ÙØ¹Ø© ÙÙŠ Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ÙˆØ§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ."
  },
  {
    q: "ÙƒÙ… Ù…Ø¯Ø© Ø§Ù„Ø±Ø­Ù„Ø©ØŸ",
    a: "Ø§Ù„Ø±Ø­Ù„Ø© Ù…ØµÙ…Ù…Ø© Ø¹Ù„Ù‰ 180 ÙŠÙˆÙ…Ù‹Ø§ØŒ Ù…ÙˆØ²Ø¹Ø© Ø¹Ù„Ù‰ 6 Ø£Ø´Ù‡Ø±ØŒ Ù…Ø¹ Ø¯Ø±ÙˆØ³ ÙˆØ§Ø®ØªØ¨Ø§Ø±Ø§Øª ÙˆÙ…Ø­Ø§ÙƒØ§Ø© ØªØ·Ø¨ÙŠÙ‚ÙŠØ©."
  },
  {
    q: "ÙƒÙŠÙ Ø£ØªØ¹Ù„Ù… Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©ØŸ",
    a: "ØªØªÙ‚Ø¯Ù… Ø¹Ø¨Ø± Ù…Ø³Ø§Ø± Ø´Ù‡Ø±ÙŠ ÙˆØ£Ø³Ø¨ÙˆØ¹ÙŠ ÙˆÙŠÙˆÙ…ÙŠØŒ ÙˆØªØ­Ù„ Ø§Ø®ØªØ¨Ø§Ø±Ù‹Ø§ Ù‚ØµÙŠØ±Ù‹Ø§ Ø¨Ø¹Ø¯ ÙƒÙ„ Ø¯Ø±Ø³ØŒ Ø«Ù… ØªØ³ØªØ®Ø¯Ù… Ø§Ù„Ø±Ø§Ø¯Ø§Ø± ÙˆØ§Ù„Ù…Ø­Ø§ÙƒØ§Ø© Ù„Ø±Ø¨Ø· Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø¨Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø©."
  },
  {
    q: "Ù‡Ù„ ØªÙˆØ¬Ø¯ Ø´Ù‡Ø§Ø¯Ø©ØŸ",
    a: "ØªØ¸Ù‡Ø± ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù† Ø¨Ø¹Ø¯ Ø§ÙƒØªÙ…Ø§Ù„ Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ø±Ø­Ù„Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©. Ù‡ÙŠ ÙˆØ«ÙŠÙ‚Ø© Ø¥Ù†Ø¬Ø§Ø² Ù„Ù„Ø±Ø­Ù„Ø© ÙˆÙ„ÙŠØ³Øª Ø´Ù‡Ø§Ø¯Ø© Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø±Ø³Ù…ÙŠØ©."
  },
  {
    q: "Ù‡Ù„ Ø£Ø­ØªØ§Ø¬ Ø®Ø¨Ø±Ø© Ø³Ø§Ø¨Ù‚Ø©ØŸ",
    a: "Ù„Ø§. ÙŠÙ…ÙƒÙ† Ù„Ù„Ø®Ø±ÙŠØ¬ ÙˆØ§Ù„Ù…Ù…Ø§Ø±Ø³ ÙˆØ§Ù„Ù‚Ø§Ø¦Ø¯ ÙˆØ§Ù„Ù…Ø³ØªØ´Ø§Ø± Ø§Ù„Ø§Ø³ØªÙØ§Ø¯Ø© Ù…Ù† Ø§Ù„Ø±Ø­Ù„Ø©ØŒ Ù„ÙƒÙ† Ø£Ø«Ø±Ù‡Ø§ ÙŠØ²ÙŠØ¯ ÙƒÙ„Ù…Ø§ Ø±Ø¨Ø·Øª Ø§Ù„Ø¯Ø±ÙˆØ³ Ø¨Ø­Ø§Ù„Ø§Øª ÙˆØ§Ù‚Ø¹ÙŠØ©."
  },
  {
    q: "Ù‡Ù„ ÙŠÙˆØ¬Ø¯ Ø¯Ø¹Ù… Ø£Ùˆ Ù…ØªØ§Ø¨Ø¹Ø©ØŸ",
    a: "ØªØ­ØªÙˆÙŠ Ø§Ù„Ù…Ù†ØµØ© Ø¹Ù„Ù‰ Ø£Ø¯ÙˆØ§Øª Ù…Ø³Ø§Ø¹Ø¯Ø© Ù…Ø«Ù„ Ø±Ø§Ø¯Ø§Ø± Ø§Ù„Ø¬Ø¯Ø§Ø±Ø§ØªØŒ Ù…Ø®ØªØ¨Ø± Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø©ØŒ ÙˆØ­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ø§Ø¦Ø¯ Ù…Ù† Ø§Ù„ØªØ¹Ù„Ù…. Ø£ÙŠ Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ø¨Ø§Ø´Ø±Ø© ÙŠØªÙ… Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø¹Ù†Ù‡Ø§ ÙÙŠ Ø§Ù„Ù…Ù†ØµØ© Ø¹Ù†Ø¯ ØªÙˆÙØ±Ù‡Ø§."
  },
  {
    q: "Ù‡Ù„ ØªØ­ÙØ¸ Ø§Ù„Ù…Ù†ØµØ© ØªÙ‚Ø¯Ù…ÙŠØŸ",
    a: "Ù†Ø¹Ù…ØŒ Ø¹Ù†Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙŠØªÙ… Ø­ÙØ¸ ØªÙ‚Ø¯Ù…Ùƒ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ Ø­ØªÙ‰ ØªØ³ØªØ·ÙŠØ¹ Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Ø¢Ø®Ø± Ù…Ø­Ø·Ø© ÙˆØµÙ„Øª Ø¥Ù„ÙŠÙ‡Ø§."
  },
  {
    q: "Ù…Ø§ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙŠ Ø£Ø­ØªØ§Ø¬ Ø¥Ø¯Ø®Ø§Ù„Ù‡Ø§ØŸ",
    a: "ØªØ­ØªØ§Ø¬ Ø¨Ø±ÙŠØ¯Ù‹Ø§ Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠÙ‹Ø§ ÙˆÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± ÙˆØ§Ø³Ù…Ù‹Ø§ Ø¹Ù†Ø¯ Ø§Ù„ØªØ³Ø¬ÙŠÙ„. Ù„Ø§ ØªØ¯Ø®Ù„ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø³Ø±ÙŠØ© Ø£Ùˆ Ø­Ø³Ø§Ø³Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø¹Ø§Ù…Ø©."
  }
];


const LESSON_SAMPLES = [
  {
    title: "Ù„Ù…Ø§Ø°Ø§ Ù„Ø§ ØªØ¨Ø¯Ø£ Ù…Ù† Ø§Ù„Ø­Ù„ØŸ",
    intro:
      "ÙÙŠ Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØŒ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø§Ù„ØªÙŠ ØªØ³Ù…Ø¹Ù‡Ø§ Ø£ÙˆÙ„Ù‹Ø§ ØºØ§Ù„Ø¨Ù‹Ø§ Ù„ÙŠØ³Øª Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø§Ù„ØªÙŠ ÙŠØ¬Ø¨ Ø£Ù† ØªØ¹Ø§Ù„Ø¬Ù‡Ø§ Ø£ÙˆÙ„Ù‹Ø§. Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙ‚ÙˆÙ„ Ø§Ù„Ù…Ø¯ÙŠØ±: Ù†Ø­ØªØ§Ø¬ ÙˆØ±Ø´Ø© Ø§Ù„ØªØ²Ø§Ù…ØŒ ÙÙ‚Ø¯ ÙŠÙƒÙˆÙ† ÙŠØµÙ Ø¹Ù„Ø§Ø¬Ù‹Ø§ ÙŠØ±ÙŠØ¯Ù‡ØŒ Ù„Ø§ Ø¹Ø±Ø¶Ù‹Ø§ ØªÙ… ØªØ´Ø®ÙŠØµÙ‡.",
    cards: [
      {
        label: "01",
        title: "Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø¸Ø§Ù‡Ø±",
        text: "Ø§Ù†Ø®ÙØ§Ø¶ Ø§Ù„Ø§Ù„ØªØ²Ø§Ù…ØŒ ØªØ£Ø®Ø± Ø§Ù„ØªØ³Ù„ÙŠÙ…ØŒ Ù…Ù‚Ø§ÙˆÙ…Ø© Ù…Ø¨Ø§Ø¯Ø±Ø©ØŒ Ø£Ùˆ Ø¯ÙˆØ±Ø§Ù† ÙˆØ¸ÙŠÙÙŠ."
      },
      {
        label: "02",
        title: "Ø§Ù„Ù†Ù…Ø· Ø§Ù„Ù…ØªÙƒØ±Ø±",
        text: "Ù‡Ù„ ÙŠØ­Ø¯Ø« ÙÙŠ ÙØ±ÙŠÙ‚ ÙˆØ§Ø­Ø¯ØŒ Ø£Ù… ÙŠØªÙƒØ±Ø± Ù…Ø¹ ÙƒÙ„ Ù…Ø¨Ø§Ø¯Ø±Ø© Ø£Ùˆ ÙƒÙ„ Ù‚Ø§Ø¦Ø¯ØŸ"
      },
      {
        label: "03",
        title: "Ø§Ù„ÙØ±Ø¶ÙŠØ© Ø§Ù„Ù…Ù‡Ù†ÙŠØ©",
        text: "Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ø§Ù„Ø³Ø¨Ø¨ ÙÙŠ Ø§Ù„Ø£Ø¯ÙˆØ§Ø±ØŒ Ø§Ù„Ù‚ÙŠØ§Ø¯Ø©ØŒ Ø§Ù„Ø­ÙˆØ§ÙØ²ØŒ Ø§Ù„Ø«Ù‚Ø©ØŒ Ø£Ùˆ Ø¶ØºØ· Ø§Ù„Ø¹Ù…Ù„."
      }
    ],
    takeaway:
      "Ø§Ù„ÙÙƒØ±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ©: Ù„Ø§ ØªØ³Ø£Ù„: Ù…Ø§ Ø§Ù„Ø­Ù„ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨ØŸ Ù‚Ø¨Ù„ Ø£Ù† ØªØ³Ø£Ù„: Ù…Ø§ Ø§Ù„Ø°ÙŠ ÙŠØ¬Ø¹Ù„ Ù‡Ø°Ø§ Ø§Ù„Ø³Ù„ÙˆÙƒ Ù…Ù†Ø·Ù‚ÙŠÙ‹Ø§ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…ØŸ Ù‡Ù†Ø§ ÙŠØ¨Ø¯Ø£ Ø§Ù„ÙØ±Ù‚ Ø¨ÙŠÙ† Ù…Ù†ÙØ° Ø­Ù„ÙˆÙ„ ÙˆÙ…Ù…Ø§Ø±Ø³ ØªØ·ÙˆÙŠØ± ØªÙ†Ø¸ÙŠÙ…ÙŠ."
  },
  {
    title: "ÙƒÙŠÙ ØªÙØ±Ù‘Ù‚ Ø¨ÙŠÙ† Ø§Ù„Ø¹Ø±Ø¶ ÙˆØ§Ù„Ø³Ø¨Ø¨ Ø§Ù„Ø¬Ø°Ø±ÙŠØŸ",
    intro:
      "Ù„ÙŠØ³ ÙƒÙ„ Ø±Ù‚Ù… Ù…Ù†Ø®ÙØ¶ ÙŠØ¹Ù†ÙŠ Ø£Ù† Ø§Ù„Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†. Ø§Ù†Ø®ÙØ§Ø¶ Ø§Ù„Ø¥Ù†ØªØ§Ø¬ÙŠØ© Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ù†ØªÙŠØ¬Ø© ØªØ¯Ø§Ø®Ù„ ØµÙ„Ø§Ø­ÙŠØ§ØªØŒ Ø£Ùˆ Ù‡Ø¯Ù ØºØ§Ù…Ø¶ØŒ Ø£Ùˆ Ø£Ø¯Ø§Ø© Ø¹Ù…Ù„ Ø³ÙŠØ¦Ø©ØŒ Ø£Ùˆ Ù‚ÙŠØ§Ø¯Ø© Ù„Ø§ ØªØ¹Ø·ÙŠ ØªØºØ°ÙŠØ© Ø±Ø§Ø¬Ø¹Ø© ÙˆØ§Ø¶Ø­Ø©.",
    cards: [
      {
        label: "01",
        title: "Ø§Ø³Ø£Ù„ Ø¹Ù† Ø§Ù„Ù…ÙƒØ§Ù†",
        text: "Ù‡Ù„ ÙŠØ¸Ù‡Ø± Ø§Ù„Ø¹Ø±Ø¶ ÙÙŠ ÙƒÙ„ Ø§Ù„Ù…Ù†Ø¸Ù…Ø© Ø£Ù… ÙÙŠ Ø¥Ø¯Ø§Ø±Ø© Ù…Ø­Ø¯Ø¯Ø©ØŸ Ø§Ù„Ù…ÙƒØ§Ù† ÙŠÙƒØ´Ù Ø·Ø¨ÙŠØ¹Ø© Ø§Ù„Ø³Ø¨Ø¨."
      },
      {
        label: "02",
        title: "Ø§Ø³Ø£Ù„ Ø¹Ù† Ø§Ù„ØªÙˆÙ‚ÙŠØª",
        text: "Ù…ØªÙ‰ Ø¨Ø¯Ø£ Ø§Ù„Ø¹Ø±Ø¶ØŸ Ø¨Ø¹Ø¯ ØªØºÙŠÙŠØ± Ù‚Ø§Ø¦Ø¯ØŸ Ø¨Ø¹Ø¯ Ù†Ø¸Ø§Ù… Ø¬Ø¯ÙŠØ¯ØŸ Ø¨Ø¹Ø¯ ØªØ¹Ø¯ÙŠÙ„ Ø­ÙˆØ§ÙØ²ØŸ"
      },
      {
        label: "03",
        title: "Ø§Ø³Ø£Ù„ Ø¹Ù† Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ ÙˆØ§Ù„Ù…ØªØ¶Ø±Ø±",
        text: "Ù…Ù† ÙŠØ±ØªØ§Ø­ Ù„Ø¨Ù‚Ø§Ø¡ Ø§Ù„ÙˆØ¶Ø¹ ÙƒÙ…Ø§ Ù‡ÙˆØŸ ÙˆÙ…Ù† ÙŠØ¯ÙØ¹ Ø«Ù…Ù† Ø§Ù„Ø®Ù„Ù„ØŸ"
      }
    ],
    takeaway:
      "Ø§Ù„ÙÙƒØ±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ©: Ø§Ù„Ø³Ø¨Ø¨ Ø§Ù„Ø¬Ø°Ø±ÙŠ Ù„ÙŠØ³ Ø£Ø¹Ù…Ù‚ Ø¥Ø¬Ø§Ø¨Ø© ØªØ³Ù…Ø¹Ù‡Ø§ØŒ Ø¨Ù„ Ø£ÙƒØ«Ø± ÙØ±Ø¶ÙŠØ© ØªÙØ³Ù‘Ø± Ø§Ù„Ù†Ù…Ø· ÙˆØªØªØ£ÙƒØ¯ Ù…Ù†Ù‡Ø§ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª."
  },
  {
    title: "Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ Ù‚Ø¨Ù„ Ø§Ù„ØªØ´Ø®ÙŠØµ",
    intro:
      "Ø£ÙˆÙ„ Ø®Ø·ÙˆØ© Ù…Ù‡Ù†ÙŠØ© Ù„ÙŠØ³Øª Ø¬Ù…Ø¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§ØªØŒ Ø¨Ù„ Ø¶Ø¨Ø· Ø§Ù„Ø¹Ù„Ø§Ù‚Ø©: Ù…Ù† Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØŸ Ù…Ø§ Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø³Ø±ÙŠØ©ØŸ Ù…Ø§ Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø°ÙŠ Ø³ÙŠØªØ£Ø«Ø± Ø¨Ø§Ù„ØªØ´Ø®ÙŠØµØŸ ÙˆÙ…Ø§ Ø§Ù„Ø°ÙŠ Ù„Ù† Ù†ØªØ¯Ø®Ù„ ÙÙŠÙ‡ØŸ",
    cards: [
      {
        label: "01",
        title: "Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ",
        text: "Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ø·Ø§Ù„Ø¨ Ø§Ù„Ø®Ø¯Ù…Ø© Ù…Ø¯ÙŠØ±Ù‹Ø§ØŒ Ù„ÙƒÙ† Ø§Ù„Ù…ØªØ£Ø«Ø± Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠ ÙØ±ÙŠÙ‚ ÙƒØ§Ù…Ù„ Ø£Ùˆ Ø¥Ø¯Ø§Ø±Ø© Ø£Ø®Ø±Ù‰."
      },
      {
        label: "02",
        title: "Ø­Ø¯ÙˆØ¯ Ø§Ù„Ø³Ø±ÙŠØ©",
        text: "Ù„Ø§ ÙŠØ¨Ø¯Ø£ Ø§Ù„ØªØ´Ø®ÙŠØµ Ø§Ù„Ø¬Ø§Ø¯ Ø¯ÙˆÙ† Ø§ØªÙØ§Ù‚ ÙˆØ§Ø¶Ø­ Ø­ÙˆÙ„ Ù…Ø§ Ø³ÙŠÙØ´Ø§Ø±Ùƒ ÙˆÙ…Ø§ Ø³ÙŠØ¨Ù‚Ù‰ Ù…Ø¬Ù‡ÙˆÙ„ Ø§Ù„Ù…ØµØ¯Ø±."
      },
      {
        label: "03",
        title: "Ù‚Ø±Ø§Ø± Ù…Ø§ Ø¨Ø¹Ø¯ Ø§Ù„ØªØ´Ø®ÙŠØµ",
        text: "Ø¥Ø°Ø§ Ù„Ù… ÙŠÙƒÙ† Ù‡Ù†Ø§Ùƒ Ø§Ø³ØªØ¹Ø¯Ø§Ø¯ Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù†ØªØ§Ø¦Ø¬ØŒ Ø³ÙŠØªØ­ÙˆÙ„ Ø§Ù„ØªØ´Ø®ÙŠØµ Ø¥Ù„Ù‰ Ù†Ø´Ø§Ø· Ø¨Ù„Ø§ Ø£Ø«Ø±."
      }
    ],
    takeaway:
      "Ø§Ù„ÙÙƒØ±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ©: Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ ÙŠØ­Ù…ÙŠÙƒ Ù…Ù† Ø£Ù† ØªÙØ³ØªØ®Ø¯Ù… ÙƒÙ…Ù†ÙØ° Ù„Ø±ÙˆØ§ÙŠØ© Ø·Ø±Ù ÙˆØ§Ø­Ø¯ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…."
  }
];

const SIMULATION_SAMPLES = [
  {
    title: "Ø§Ø¬ØªÙ…Ø§Ø¹ Ø¹Ø§Ø¬Ù„ Ù‚Ø¨Ù„ Ù…Ø¨Ø§Ø¯Ø±Ø© ØªØºÙŠÙŠØ±",
    context:
      "ÙˆØµÙ„ØªÙƒ Ø±Ø³Ø§Ù„Ø© Ù…Ù† Ù…Ø¯ÙŠØ± Ø¥Ø¯Ø§Ø±Ø©: Ø¹Ù†Ø¯Ù†Ø§ Ù…Ù‚Ø§ÙˆÙ…Ø© Ø¹Ø§Ù„ÙŠØ© Ù„Ù…Ø¨Ø§Ø¯Ø±Ø© Ø§Ù„ØªØ­ÙˆÙ„. Ù†Ø­ØªØ§Ø¬ Ù†Ø´Ø§Ø·Ù‹Ø§ Ø³Ø±ÙŠØ¹Ù‹Ø§ Ù‚Ø¨Ù„ Ø§Ø¬ØªÙ…Ø§Ø¹ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©. ÙˆÙÙŠ Ø§Ù„Ù…Ù‚Ø§Ø¨Ù„ØŒ ÙŠØ°ÙƒØ± Ø£Ø­Ø¯ Ø§Ù„Ù…Ø´Ø±ÙÙŠÙ† Ø£Ù† Ø§Ù„ÙØ±ÙŠÙ‚ Ù„Ø§ ÙŠØ±ÙØ¶ Ø§Ù„ØªØºÙŠÙŠØ±ØŒ Ù„ÙƒÙ†Ù‡ Ù„Ø§ ÙŠÙÙ‡Ù… Ù„Ù…Ø§Ø°Ø§ ØªØºÙŠØ±Øª Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª Ø«Ù„Ø§Ø« Ù…Ø±Ø§Øª Ø®Ù„Ø§Ù„ Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯.",
    signals: [
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø£ÙˆÙ„", title: "Ø±ÙˆØ§ÙŠØ© Ø¥Ø¯Ø§Ø±ÙŠØ©", text: "Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ØªÙØ³Ø± Ø§Ù„Ø³Ù„ÙˆÙƒ Ø¨ÙˆØµÙÙ‡ Ù…Ù‚Ø§ÙˆÙ…Ø©." },
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø«Ø§Ù†ÙŠ", title: "Ø±ÙˆØ§ÙŠØ© Ù…ÙŠØ¯Ø§Ù†ÙŠØ©", text: "Ø§Ù„ÙØ±ÙŠÙ‚ ÙŠØªØ­Ø¯Ø« Ø¹Ù† ØºÙ…ÙˆØ¶ ÙˆØªØ¶Ø§Ø±Ø¨ ÙÙŠ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª." },
      { label: "Ø§Ù„ØªÙˆØªØ± Ø§Ù„ØªØ´Ø®ÙŠØµÙŠ", title: "Ø¯Ø§ÙØ¹ÙŠØ© Ø£Ù… ØªØµÙ…ÙŠÙ…ØŸ", text: "Ù†ÙˆØ¹ Ø§Ù„ØªØ¯Ø®Ù„ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ ØªÙØ³ÙŠØ± Ø§Ù„Ù†Ù…Ø· Ù„Ø§ Ø¹Ù„Ù‰ Ø£ÙˆÙ„ Ø±ÙˆØ§ÙŠØ©." }
    ],
    options: [
      { id: "scope_first", title: "Ø£Ø¨Ø¯Ø£ Ø¨Ø¬Ù„Ø³Ø© ØªØ¹Ø§Ù‚Ø¯ Ù‚ØµÙŠØ±Ø© Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø³Ø¤Ø§Ù„ Ø§Ù„ØªØ´Ø®ÙŠØµÙŠ ÙˆÙ…ØµØ§Ø¯Ø± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª", feedback: "ØµØ­ÙŠØ­. Ù‡Ø°Ø§ ÙŠØ­Ù…ÙŠÙƒ Ù…Ù† ØªØ¨Ù†ÙŠ Ø±ÙˆØ§ÙŠØ© ÙˆØ§Ø­Ø¯Ø©ØŒ ÙˆÙŠØ­ÙˆÙ‘Ù„ Ø§Ù„Ø·Ù„Ø¨ Ù…Ù† Ù†Ø´Ø§Ø· Ø³Ø±ÙŠØ¹ Ø¥Ù„Ù‰ ØªØ´Ø®ÙŠØµ Ù…Ù†Ø¶Ø¨Ø·." },
      { id: "workshop_now", title: "Ø£Ù†ÙØ° Ø§Ù„Ù†Ø´Ø§Ø· Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ø«Ù… Ø£Ø±Ø§Ø¬Ø¹ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø¨Ø¹Ø¯ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹", feedback: "Ù‡Ø°Ø§ Ù‚Ø¯ ÙŠØ¨Ø¯Ùˆ Ø¹Ù…Ù„ÙŠÙ‹Ø§ØŒ Ù„ÙƒÙ†Ù‡ ÙŠØ¬Ø¹Ù„ Ø§Ù„ØªØ¯Ø®Ù„ ÙŠØ³Ø¨Ù‚ Ø§Ù„ØªØ´Ø®ÙŠØµØŒ ÙˆÙ‚Ø¯ ÙŠØ«Ø¨Øª ØªÙØ³ÙŠØ±Ù‹Ø§ ØºÙŠØ± Ù…Ø®ØªØ¨Ø±." },
      { id: "survey_only", title: "Ø£Ø±Ø³Ù„ Ø§Ø³ØªØ¨ÙŠØ§Ù†Ù‹Ø§ Ø¹Ø§Ù…Ù‹Ø§ Ø¹Ù† Ø§Ù„Ø±Ø¶Ø§ ÙˆØ§Ù„Ø§Ù„ØªØ²Ø§Ù… Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†", feedback: "Ø§Ù„Ø§Ø³ØªØ¨ÙŠØ§Ù† Ù‚Ø¯ ÙŠØ³Ø§Ø¹Ø¯ Ù„Ø§Ø­Ù‚Ù‹Ø§ØŒ Ù„ÙƒÙ†Ù‡ ÙˆØ­Ø¯Ù‡ Ù„Ø§ ÙŠÙƒØ´Ù Ø³Ø¨Ø¨ ØªØ¶Ø§Ø±Ø¨ Ø§Ù„Ø±ÙˆØ§ÙŠØ§Øª ÙˆØªØºÙŠØ± Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª." }
    ],
    correctOptionId: "scope_first"
  },
  {
    title: "Ø¯ÙˆØ±Ø§Ù† Ù…Ø±ØªÙØ¹ ÙÙŠ ÙØ±ÙŠÙ‚ ÙˆØ§Ø­Ø¯",
    context:
      "Ø§Ø±ØªÙØ¹ Ø®Ø±ÙˆØ¬ Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ† ÙÙŠ ÙØ±ÙŠÙ‚ Ø®Ø¯Ù…Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø®Ù„Ø§Ù„ Ø´Ù‡Ø±ÙŠÙ†. Ø§Ù„Ù…Ø¯ÙŠØ± ÙŠØµÙ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø¨Ø£Ù†Ù‡Ø§ Ø¶Ø¹Ù ØªØ­Ù…Ù„ Ù„Ù„Ø¶ØºØ·ØŒ Ù„ÙƒÙ† Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ØªØ¸Ù‡Ø± Ø£Ù† Ù…Ø¹Ø¸Ù… Ø§Ù„Ù…ØºØ§Ø¯Ø±ÙŠÙ† ÙƒØ§Ù†ÙˆØ§ Ù…Ù† Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø£Ø¹Ù„Ù‰ ÙÙŠ Ø¢Ø®Ø± ØªÙ‚ÙŠÙŠÙ…ÙŠÙ†.",
    signals: [
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø£ÙˆÙ„", title: "Ø®Ø±ÙˆØ¬ Ø§Ù†ØªÙ‚Ø§Ø¦ÙŠ", text: "Ø§Ù„Ø®Ø±ÙˆØ¬ ÙŠØªØ±ÙƒØ² Ø¨ÙŠÙ† Ø£ØµØ­Ø§Ø¨ Ø£Ø¯Ø§Ø¡ Ø¹Ø§Ù„." },
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø«Ø§Ù†ÙŠ", title: "ØªÙØ³ÙŠØ± Ø¬Ø§Ù‡Ø²", text: "Ø§Ù„Ù…Ø¯ÙŠØ± ÙŠØ±Ø¨Ø· Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø¨Ù‚Ø¯Ø±Ø© Ø§Ù„Ø£ÙØ±Ø§Ø¯ Ø¹Ù„Ù‰ Ø§Ù„ØªØ­Ù…Ù„." },
      { label: "Ø§Ù„ØªÙˆØªØ± Ø§Ù„ØªØ´Ø®ÙŠØµÙŠ", title: "Ø¶ØºØ· Ø£Ù… Ø¹Ø¯Ø§Ù„Ø©ØŸ", text: "Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ø§Ù„Ø®Ù„Ù„ ÙÙŠ Ø§Ù„Ø­Ù…Ù„ Ø£Ùˆ Ø§Ù„ØªÙ‚Ø¯ÙŠØ± Ø£Ùˆ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª." }
    ],
    options: [
      { id: "stress_training", title: "Ø£Ù‚ØªØ±Ø­ ØªØ¯Ø±ÙŠØ¨Ù‹Ø§ Ø¹Ù„Ù‰ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¶ØºØ· Ù„Ù„ÙØ±ÙŠÙ‚ Ø®Ù„Ø§Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ù‚Ø§Ø¯Ù…", feedback: "Ù‡Ø°Ø§ ÙŠÙØªØ±Ø¶ Ø£Ù† Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø£ÙØ±Ø§Ø¯ Ù‚Ø¨Ù„ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø­Ù…Ù„ ÙˆØ§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆÙ†Ù…Ø· Ø§Ù„Ø¹Ù…Ù„." },
      { id: "exit_pattern", title: "Ø£Ø­Ù„Ù„ Ù…Ù‚Ø§Ø¨Ù„Ø§Øª Ø§Ù„Ø®Ø±ÙˆØ¬ ÙˆØ­Ù…Ù„ Ø§Ù„Ø¹Ù…Ù„ ÙˆÙ†Ù…Ø· Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© Ù‚Ø¨Ù„ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØªØ¯Ø®Ù„", feedback: "ØµØ­ÙŠØ­. Ø®Ø±ÙˆØ¬ Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„ÙŠ ÙŠØ­ØªØ§Ø¬ Ù‚Ø±Ø§Ø¡Ø© Ù†Ù…Ø·ÙŠØ© Ù„Ø§ ØªÙØ³ÙŠØ±Ù‹Ø§ Ø³Ø±ÙŠØ¹Ù‹Ø§." },
      { id: "quick_bonus", title: "Ø£ÙˆØµÙŠ Ø¨Ø­Ø§ÙØ² Ù…Ø¤Ù‚Øª Ù„Ù„ÙØ±ÙŠÙ‚ Ø­ØªÙ‰ ÙŠÙ†Ø®ÙØ¶ Ø§Ù„Ø®Ø±ÙˆØ¬", feedback: "Ø§Ù„Ø­Ø§ÙØ² Ù‚Ø¯ ÙŠØ®ÙÙ Ø£Ø«Ø±Ù‹Ø§ Ù…Ø¤Ù‚ØªÙ‹Ø§ØŒ Ù„ÙƒÙ†Ù‡ Ù„Ø§ ÙŠÙØ³Ø± Ù„Ù…Ø§Ø°Ø§ ÙŠØºØ§Ø¯Ø± Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„ÙŠ." }
    ],
    correctOptionId: "exit_pattern"
  },
  {
    title: "Ù†Ø¸Ø§Ù… Ø£Ø¯Ø§Ø¡ Ø¬Ø¯ÙŠØ¯ Ø¨Ù„Ø§ Ø«Ù‚Ø©",
    context:
      "Ø£Ø·Ù„Ù‚Øª Ø§Ù„Ø´Ø±ÙƒØ© Ù†Ù…ÙˆØ°Ø¬ ØªÙ‚ÙŠÙŠÙ… Ø£Ø¯Ø§Ø¡ Ø¬Ø¯ÙŠØ¯. Ø¨Ø¹Ø¯ Ø´Ù‡Ø±ØŒ Ø¨Ø¯Ø£ Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ† ÙŠÙƒØªØ¨ÙˆÙ† Ø£Ù‡Ø¯Ø§ÙÙ‹Ø§ Ø³Ù‡Ù„Ø© Ø¬Ø¯Ù‹Ø§. Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ØªØ±Ù‰ Ø°Ù„Ùƒ Ø§Ù†Ø®ÙØ§Ø¶Ù‹Ø§ ÙÙŠ Ø§Ù„Ø·Ù…ÙˆØ­ØŒ ÙˆØ§Ù„Ù…ÙˆØ¸ÙÙˆÙ† ÙŠØ¹ØªÙ‚Ø¯ÙˆÙ† Ø£Ù† Ø§Ù„ØªÙ‚ÙŠÙŠÙ… Ø³ÙŠØ³ØªØ®Ø¯Ù… Ø¶Ø¯Ù‡Ù… ÙÙŠ Ø§Ù„Ù…ÙƒØ§ÙØ¢Øª.",
    signals: [
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø£ÙˆÙ„", title: "Ø³Ù„ÙˆÙƒ Ø§Ø­ØªØ±Ø§Ø²ÙŠ", text: "Ø§Ù„Ø£Ù‡Ø¯Ø§Ù Ø£ØµØ¨Ø­Øª Ø£Ø³Ù‡Ù„ Ø¨Ø¹Ø¯ Ø¥Ø·Ù„Ø§Ù‚ Ø§Ù„Ù†Ø¸Ø§Ù…." },
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø«Ø§Ù†ÙŠ", title: "Ù‚Ù„Ù‚ Ù…Ù† Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…", text: "Ø§Ù„Ù…ÙˆØ¸ÙÙˆÙ† Ù„Ø§ ÙŠØ«Ù‚ÙˆÙ† ÙÙŠ Ø·Ø±ÙŠÙ‚Ø© ØªÙˆØ¸ÙŠÙ Ø§Ù„Ù†ØªØ§Ø¦Ø¬." },
      { label: "Ø§Ù„ØªÙˆØªØ± Ø§Ù„ØªØ´Ø®ÙŠØµÙŠ", title: "Ø£Ø¯Ø§Ø© Ø£Ù… Ù…Ù†Ø§Ø®ØŸ", text: "Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ù‚Ø¯ ÙŠÙØ´Ù„ Ø¥Ø°Ø§ Ø§Ø±ØªØ¨Ø· Ø¨Ø§Ù„Ø¹Ù‚Ø§Ø¨ Ø£Ùˆ Ø§Ù„ØºÙ…ÙˆØ¶." }
    ],
    options: [
      { id: "force_targets", title: "Ø£Ø·Ù„Ø¨ Ø±ÙØ¹ Ø§Ù„Ø£Ù‡Ø¯Ø§Ù Ø¨Ù†Ø³Ø¨Ø© Ù…ÙˆØ­Ø¯Ø© Ù„Ø¶Ù…Ø§Ù† Ø§Ù„Ø·Ù…ÙˆØ­", feedback: "Ù‡Ø°Ø§ ÙŠØ¹Ø§Ù„Ø¬ Ø´ÙƒÙ„ Ø§Ù„Ø±Ù‚Ù…ØŒ Ù„ÙƒÙ†Ù‡ Ù„Ø§ ÙŠØ¹Ø§Ù„Ø¬ Ø§Ù„Ø«Ù‚Ø© ÙˆÙ‚Ø¯ ÙŠØ²ÙŠØ¯ Ø§Ù„Ø³Ù„ÙˆÙƒ Ø§Ù„Ø¯ÙØ§Ø¹ÙŠ." },
      { id: "old_system", title: "Ø£ÙˆØµÙŠ Ø¨Ø¥ÙŠÙ‚Ø§Ù Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ ÙˆØ§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø³Ø§Ø¨Ù‚ Ù…Ø¤Ù‚ØªÙ‹Ø§", feedback: "Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ù…Ø¨ÙƒØ±Ù‹Ø§. Ù„Ù… Ù†Ø¹Ø±Ù Ø¨Ø¹Ø¯ Ù‡Ù„ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø£Ø¯Ø§Ø© Ø£Ù… ÙÙŠ Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚ ÙˆØ§Ù„Ø±Ø³Ø§Ø¦Ù„." },
      { id: "trust_governance", title: "Ø£Ø±Ø§Ø¬Ø¹ Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚ ÙˆØ­ÙˆÙƒÙ…Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù‚Ø¨Ù„ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬", feedback: "ØµØ­ÙŠØ­. Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ù‡Ù†Ø§ Ù‚Ø¯ ØªÙƒÙˆÙ† ÙÙŠ Ø§Ù„Ø«Ù‚Ø© ÙˆØ·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù„Ø§ ÙÙŠ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ ÙˆØ­Ø¯Ù‡." }
    ],
    correctOptionId: "trust_governance"
  },
  {
    title: "ØµØ±Ø§Ø¹ Ø¨ÙŠÙ† Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ ÙˆØ§Ù„Ø¹Ù…Ù„ÙŠØ§Øª",
    context:
      "ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª ÙŠØ´ØªÙƒÙŠ Ø£Ù† Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ØªØ¤Ø®Ø± Ø§Ù„ØªÙˆØ¸ÙŠÙØŒ ÙˆØ§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© ØªØ¤ÙƒØ¯ Ø£Ù† Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª ØªØºÙŠØ± Ø§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª ÙÙŠ ÙƒÙ„ Ù…Ù‚Ø§Ø¨Ù„Ø©. Ø§Ù„Ø±Ø¦ÙŠØ³ Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ ÙŠØ±ÙŠØ¯ Ù…Ø¹Ø±ÙØ© Ø§Ù„Ø·Ø±Ù Ø§Ù„Ù…Ù‚ØµØ± Ø¨Ø³Ø±Ø¹Ø©.",
    signals: [
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø£ÙˆÙ„", title: "Ø§ØªÙ‡Ø§Ù… Ù…ØªØ¨Ø§Ø¯Ù„", text: "ÙƒÙ„ Ø·Ø±Ù ÙŠÙ…Ù„Ùƒ Ø±ÙˆØ§ÙŠØ© ØªØ¶Ø¹ Ø§Ù„Ø®Ù„Ù„ Ø¹Ù†Ø¯ Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø¢Ø®Ø±." },
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø«Ø§Ù†ÙŠ", title: "ØªØºÙŠØ± Ù…ØªØ·Ù„Ø¨Ø§Øª", text: "Ø§Ù„Ø®Ù„Ù„ Ù‚Ø¯ ÙŠÙƒÙˆÙ† ÙÙŠ ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø¯ÙˆØ± ÙˆØ­Ù‚ÙˆÙ‚ Ø§Ù„Ù‚Ø±Ø§Ø±." },
      { label: "Ø§Ù„ØªÙˆØªØ± Ø§Ù„ØªØ´Ø®ÙŠØµÙŠ", title: "Ø£Ø¯Ø§Ø¡ Ø£Ù… Ø¹Ù…Ù„ÙŠØ©ØŸ", text: "Ù‚Ø¨Ù„ Ù„ÙˆÙ… Ø·Ø±ÙØŒ ÙŠØ¬Ø¨ ÙÙ‡Ù… Ù…Ø³Ø§Ø± Ø§Ù„Ù‚Ø±Ø§Ø±." }
    ],
    options: [
      { id: "fault_report", title: "Ø£Ø¹Ø¯ ØªÙ‚Ø±ÙŠØ±Ù‹Ø§ Ø³Ø±ÙŠØ¹Ù‹Ø§ ÙŠØ­Ø¯Ø¯ Ø§Ù„Ø·Ø±Ù Ø§Ù„Ø£ÙƒØ«Ø± ØªØ³Ø¨Ø¨Ù‹Ø§ ÙÙŠ Ø§Ù„ØªØ£Ø®ÙŠØ±", feedback: "Ù‡Ø°Ø§ Ù‚Ø¯ ÙŠØ±Ø¶ÙŠ Ø·Ù„Ø¨Ù‹Ø§ Ø³Ø±ÙŠØ¹Ù‹Ø§ØŒ Ù„ÙƒÙ†Ù‡ ÙŠØ²ÙŠØ¯ Ø§Ù„ØµØ±Ø§Ø¹ Ø¥Ø°Ø§ Ù„Ù… Ù†ÙÙ‡Ù… ØªØµÙ…ÙŠÙ… Ø§Ù„Ø¹Ù…Ù„ÙŠØ©." },
      { id: "add_recruiters", title: "Ø£Ù‚ØªØ±Ø­ Ø²ÙŠØ§Ø¯Ø© Ø¹Ø¯Ø¯ Ù…ÙˆØ¸ÙÙŠ Ø§Ù„Ø§Ø³ØªÙ‚Ø·Ø§Ø¨ Ù„ØªØ³Ø±ÙŠØ¹ Ø§Ù„Ø·Ù„Ø¨Ø§Øª", feedback: "Ù‚Ø¯ Ù„Ø§ ÙŠØ­Ù„ Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„ØªØ£Ø®ÙŠØ± Ø¨Ø³Ø¨Ø¨ ØªØºÙŠØ± Ø§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª ÙˆØºÙ…ÙˆØ¶ Ø§Ù„Ù‚Ø±Ø§Ø±." },
      { id: "process_map", title: "Ø£Ø±Ø³Ù… Ø±Ø­Ù„Ø© Ø§Ù„ØªÙˆØ¸ÙŠÙ ÙˆÙ†Ù‚Ø§Ø· ØªØºÙŠÙŠØ± Ø§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª ÙˆØ­Ù‚ÙˆÙ‚ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯", feedback: "ØµØ­ÙŠØ­. Ù‡Ø°Ø§ ÙŠØ­ÙˆÙ„ Ø§Ù„Ø§ØªÙ‡Ø§Ù… Ø¥Ù„Ù‰ Ø®Ø±ÙŠØ·Ø© Ø¹Ù…Ù„ÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ­Ø³ÙŠÙ†." }
    ],
    correctOptionId: "process_map"
  },
  {
    title: "Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¯Ø±ÙŠØ¨ Ø¨Ù„Ø§ Ø£Ø«Ø±",
    context:
      "ØªÙ… ØªÙ†ÙÙŠØ° Ø¨Ø±Ù†Ø§Ù…Ø¬ Ù‚ÙŠØ§Ø¯ÙŠ Ù„Ù…Ø¯ÙŠØ±ÙŠ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø§ØªØŒ ÙˆÙƒØ§Ù†Øª Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ù…ØªØ§Ø²Ø©. Ø¨Ø¹Ø¯ Ø´Ù‡Ø±ÙŠÙ†ØŒ Ù„Ù… ÙŠØªØºÙŠØ± Ø´ÙŠØ¡ ÙÙŠ Ø§Ø¬ØªÙ…Ø§Ø¹Ø§Øª Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø£Ùˆ ØªÙÙˆÙŠØ¶ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª. Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ØªØ³Ø£Ù„: Ù„Ù…Ø§Ø°Ø§ Ù„Ù… ÙŠÙ†Ø¬Ø­ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ØŸ",
    signals: [
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø£ÙˆÙ„", title: "Ø±Ø¶Ø§ Ù…Ø±ØªÙØ¹", text: "Ø§Ù„Ø­Ø¶ÙˆØ± Ø£Ø­Ø¨ÙˆØ§ Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ ÙˆÙ‚ÙŠÙ‘Ù…ÙˆÙ‡ Ø¬ÙŠØ¯Ù‹Ø§." },
      { label: "Ø§Ù„Ù…Ø¹Ø·Ù‰ Ø§Ù„Ø«Ø§Ù†ÙŠ", title: "Ø³Ù„ÙˆÙƒ Ø«Ø§Ø¨Øª", text: "Ù…Ù…Ø§Ø±Ø³Ø§Øª Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© Ø¨Ø¹Ø¯ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ù„Ù… ØªØªØºÙŠØ±." },
      { label: "Ø§Ù„ØªÙˆØªØ± Ø§Ù„ØªØ´Ø®ÙŠØµÙŠ", title: "ØªØ¹Ù„Ù… Ø£Ù… Ù†Ù‚Ù„ Ø£Ø«Ø±ØŸ", text: "Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ù‚Ø¯ Ù„Ø§ ØªÙƒÙˆÙ† ÙÙŠ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ØŒ Ø¨Ù„ ÙÙŠ Ø¨ÙŠØ¦Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚." }
    ],
    options: [
      { id: "repeat_training", title: "Ø£Ù‚ØªØ±Ø­ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø¨ØµÙŠØºØ© Ø£Ø·ÙˆÙ„ ÙˆØ£ÙƒØ«Ø± ØªÙØµÙŠÙ„Ù‹Ø§", feedback: "Ø²ÙŠØ§Ø¯Ø© Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù„Ø§ ØªØ¹Ù†ÙŠ Ø£Ø«Ø±Ù‹Ø§ Ø£Ø¹Ù„Ù‰ Ø¥Ø°Ø§ ÙƒØ§Ù†Øª Ø¨ÙŠØ¦Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù„Ø§ ØªØ¯Ø¹Ù… Ø§Ù„Ø³Ù„ÙˆÙƒ Ø§Ù„Ø¬Ø¯ÙŠØ¯." },
      { id: "transfer_system", title: "Ø£Ø±Ø¨Ø· Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ø¨Ù…ØªØ§Ø¨Ø¹Ø© ØªØ·Ø¨ÙŠÙ‚ ÙˆÙ…Ø¤Ø´Ø±Ø§Øª ÙˆØ³Ù„ÙˆÙƒÙŠØ§Øª Ù…Ø·Ù„ÙˆØ¨Ø© Ù…Ù† Ø§Ù„Ù‚Ø§Ø¯Ø©", feedback: "ØµØ­ÙŠØ­. Ø£Ø«Ø± Ø§Ù„ØªØ¹Ù„Ù… ÙŠØ­ØªØ§Ø¬ Ù†Ø¸Ø§Ù… Ù†Ù‚Ù„ Ø£Ø«Ø±ØŒ Ù„Ø§ Ø±Ø¶Ø§ Ø¹Ù† Ø§Ù„Ù‚Ø§Ø¹Ø© ÙÙ‚Ø·." },
      { id: "change_vendor", title: "Ø£ØºÙŠÙ‘Ø± Ù…Ø²ÙˆØ¯ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ù„Ø£Ù† Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ù„Ù… ØªØ¸Ù‡Ø± Ø¨Ø¹Ø¯ Ø´Ù‡Ø±ÙŠÙ†", feedback: "Ù‚Ø¯ ÙŠÙƒÙˆÙ† Ø§Ù„Ù…Ø²ÙˆØ¯ Ø¬Ø²Ø¡Ù‹Ø§ Ù…Ù† Ø§Ù„Ù…Ø´ÙƒÙ„Ø©ØŒ Ù„ÙƒÙ† Ø§Ù„Ø­ÙƒÙ… Ù‚Ø¨Ù„ ÙØ­Øµ Ø¨ÙŠØ¦Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù…ØªØ³Ø±Ø¹." }
    ],
    correctOptionId: "transfer_system"
  }
];

const DEFAULT_STATS = {
  total_joined: 0,
  active_now: 0,
  completed_count: 0
};

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function passwordIssue(password) {
  if (!password || password.length < 8) return "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªÙ‚Ù„ Ø¹Ù† 8 Ø£Ø­Ø±Ù.";
  if (!/[A-Za-z]/.test(password)) return "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø­Ø±Ù ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.";
  if (!/[0-9]/.test(password)) return "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø±Ù‚Ù… ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.";
  return "";
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(number);
}

function shuffleArray(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function normalizeStats(payload) {
  const row = Array.isArray(payload) ? payload[0] : payload;

  return {
    total_joined: Number(row?.total_joined || 0),
    active_now: Number(row?.active_now || 0),
    completed_count: Number(row?.completed_count || 0)
  };
}

export default function AuthGate({
  onEnter,
  onAuthenticated,
  recoveryMode = false,
  onPasswordUpdated
}) {
  const [mode, setMode] = useState(recoveryMode ? "recover" : "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsReady, setStatsReady] = useState(false);
  const [activeSample, setActiveSample] = useState({ type: "", index: 0, selectedOption: "", optionOrder: [] });
  const [openFaq, setOpenFaq] = useState("Ù‡Ù„ Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø¬Ø§Ù†ÙŠØ©ØŸ");

  const passwordHint = useMemo(() => passwordIssue(password), [password]);
  const recoveryPasswordHint = useMemo(() => passwordIssue(newPassword), [newPassword]);

  useEffect(() => {
    setMode(recoveryMode ? "recover" : "signin");
  }, [recoveryMode]);

  async function loadPublicStats() {
    if (!isSupabaseConfigured || !supabase) {
      setStatsReady(true);
      return;
    }

    const { data, error } = await supabase.rpc("get_public_platform_stats");

    if (!error && data) {
      setStats(normalizeStats(data));
    }

    setStatsReady(true);
  }

  useEffect(() => {
    loadPublicStats();

    const timer = window.setInterval(() => {
      loadPublicStats();
    }, 30000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function touchActivity() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.rpc("touch_user_activity");
  }


  function openSample(type) {
    const bank = type === "lesson" ? LESSON_SAMPLES : SIMULATION_SAMPLES;

    setActiveSample((current) => {
      let nextIndex = Math.floor(Math.random() * bank.length);

      if (bank.length > 1 && current.type === type && current.index === nextIndex) {
        nextIndex = (nextIndex + 1) % bank.length;
      }

      const selectedSimulation = type === "simulation" ? bank[nextIndex] : null;

      return {
        type,
        index: nextIndex,
        selectedOption: "",
        optionOrder: selectedSimulation
          ? shuffleArray(selectedSimulation.options.map((option) => option.id))
          : []
      };
    });
  }

  function closeSample() {
    setActiveSample({ type: "", index: 0, selectedOption: "", optionOrder: [] });
  }

  useEffect(() => {
    if (!activeSample.type) return undefined;
    function handleKey(event) {
      if (event.key === "Escape") closeSample();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeSample.type]);

  function chooseSimulationOption(optionId) {
    setActiveSample((current) => ({
      ...current,
      selectedOption: optionId
    }));
  }

  function showNotice(message) {
    setNotice(message);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setNotice("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (nextMode === "signin") {
      setFullName("");
    }
  }

  async function handleForgotPassword() {
    setNotice("");

    if (!isSupabaseConfigured || !supabase) {
      showNotice("Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØªØ­ØªØ§Ø¬ ØªÙØ¹ÙŠÙ„ Supabase.");
      return;
    }

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      showNotice("Ø§ÙƒØªØ¨ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£ÙˆÙ„Ù‹Ø§ØŒ Ø«Ù… Ø§Ø¶ØºØ· Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
      return;
    }

    setBusy(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo
      });

      if (error) throw error;

      showNotice("Ø£Ø±Ø³Ù„Ù†Ø§ Ø±Ø§Ø¨Ø· Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¥Ù„Ù‰ Ø¨Ø±ÙŠØ¯Ùƒ. Ø§ÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø· ÙˆØ³ÙŠØ¸Ù‡Ø± Ù„Ùƒ Ù†Ù…ÙˆØ°Ø¬ ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø©.");
    } catch (error) {
      showNotice(error?.message || "ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· Ø§Ø³ØªØ¹Ø§Ø¯Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRecoverySubmit(event) {
    event.preventDefault();
    setNotice("");

    const issue = passwordIssue(newPassword);
    if (issue) {
      showNotice(issue);
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotice("ÙƒÙ„Ù…ØªØ§ Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…ØªØ·Ø§Ø¨Ù‚ØªÙŠÙ†.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showNotice("ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ­ØªØ§Ø¬ ØªÙØ¹ÙŠÙ„ Supabase.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      const { data } = await supabase.auth.getSession();
      await touchActivity();

      showNotice("ØªÙ… ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­.");

      window.history.replaceState({}, document.title, window.location.origin + "/");

      onPasswordUpdated?.(data?.session || null);

      if (data?.session) {
        onEnter?.({
          session: data.session,
          name:
            data.session?.user?.user_metadata?.full_name ||
            data.session?.user?.email ||
            "Ø²Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‡Ù†Ø©"
        });
        onAuthenticated?.(data.session);
      }
    } catch (error) {
      showNotice(error?.message || "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (mode === "recover") {
      await handleRecoverySubmit(event);
      return;
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();

    if (!isSupabaseConfigured || !supabase) {
      const demoName = cleanName || "Ø²Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‡Ù†Ø©";
      localStorage.setItem("od_demo_name", demoName);
      onEnter?.({ name: demoName, demo: true });
      return;
    }

    if (mode === "signup" && !cleanName) {
      showNotice("Ø§ÙƒØªØ¨ Ø§Ø³Ù…Ùƒ ÙƒÙ…Ø§ ØªØ­Ø¨ Ø£Ù† ØªØ±Ø§Ù‡ ÙÙŠ Ø´Ù‡Ø§Ø¯ØªÙƒ.");
      return;
    }

    if (!cleanEmail) {
      showNotice("Ø£Ø¯Ø®Ù„ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.");
      return;
    }

    if (passwordIssue(password)) {
      showNotice(passwordIssue(password));
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: { full_name: cleanName }
          }
        });

        if (error) throw error;

        if (data?.session) {
          await supabase.auth.signOut();
        }

        showNotice("ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨. Ø£Ø±Ø³Ù„Ù†Ø§ Ù„Ùƒ Ø±Ø§Ø¨Ø· ØªØ£ÙƒÙŠØ¯ Ø¹Ù„Ù‰ Ø§Ù„Ø¨Ø±ÙŠØ¯. Ø§ÙØªØ­ Ø§Ù„Ø±Ø§Ø¨Ø· Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø«Ù… Ø³Ø¬Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw error;

      await touchActivity();
      await loadPublicStats();

      const session = data?.session;
      const name =
        session?.user?.user_metadata?.full_name ||
        session?.user?.email ||
        "Ø²Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‡Ù†Ø©";

      onEnter?.({ session, name });
      onAuthenticated?.(session);
    } catch (error) {
      showNotice(error?.message || "ØªØ¹Ø°Ø± ØªÙ†ÙÙŠØ° Ø§Ù„Ø¹Ù…Ù„ÙŠØ©. ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.");
    } finally {
      setBusy(false);
    }
  }

  function enterDemo() {
    const demoName = fullName.trim() || "Ø²Ù…ÙŠÙ„ Ø§Ù„Ù…Ù‡Ù†Ø©";
    localStorage.setItem("od_demo_name", demoName);
    onEnter?.({ name: demoName, demo: true });
  }


  const activeLesson =
    activeSample.type === "lesson" ? LESSON_SAMPLES[activeSample.index] : null;

  const activeSimulation =
    activeSample.type === "simulation" ? SIMULATION_SAMPLES[activeSample.index] : null;

  const activeSimulationOptions =
    activeSimulation && activeSample.optionOrder.length
      ? activeSample.optionOrder
          .map((optionId) =>
            activeSimulation.options.find((option) => option.id === optionId)
          )
          .filter(Boolean)
      : activeSimulation?.options || [];

  return (
    <main className="public-gate" dir="rtl">
      <BrandMeta />
      <ExperienceDesignSkin />
      <style>{`
        /*
          Ù…Ù†Ø³Ù‚Ø© â€” ØªØ­Ø³ÙŠÙ† Ø¨ØµØ±ÙŠ Ù„Ù„ÙˆØ§Ø¬Ù‡Ø©
          Ù…Ø®ØªØ¨Ø± Ø§Ù„ØªØ´Ø®ÙŠØµ Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ | Organizational Diagnostic Lab
          - Ù„Ø§ ÙŠØºÙŠÙ‘Ø± Ø§Ù„Ù†ØµÙˆØµ ÙˆÙ„Ø§ Ø§Ù„Ù…Ù†Ø·Ù‚ ÙˆÙ„Ø§ Supabase/Auth/API/RPC/Routes.
          - ØªØ¹Ø¯ÙŠÙ„ CSS ÙÙ‚Ø· Ø¯Ø§Ø®Ù„ Ù†ÙØ³ Ø§Ù„Ø¨Ù„ÙˆÙƒ.
        */

        .public-gate {
          --ink: #0c0717;
          --ink-2: #120a22;
          --navy: #160c2a;
          --panel: rgba(28, 17, 50, 0.72);
          --panel-2: rgba(34, 20, 60, 0.66);
          --line: rgba(167, 139, 250, 0.14);
          --line-2: rgba(167, 139, 250, 0.26);
          --indigo: #8b5cf6;
          --indigo-2: #a78bfa;
          --indigo-soft: rgba(139, 92, 246, 0.14);
          --gold: #a855f7;
          --gold-2: #c4b5fd;
          --gold-soft: rgba(168, 85, 247, 0.13);
          --teal: #7c3aed;
          --teal-2: #c4b5fd;
          --teal-soft: rgba(124, 58, 237, 0.12);
          --warm: #f1ecfb;
          --text: #ece6f8;
          --muted: #b6a8d6;
          --muted-2: #7a6c9a;

          position: relative;
          min-height: 100vh;
          color: var(--text);
          padding: 26px 14px 72px;
          font-family: var(--font-body, inherit);
          background:
            radial-gradient(circle at 14% 6%, rgba(139, 92, 246, 0.12), transparent 32%),
            radial-gradient(circle at 88% 10%, rgba(124, 58, 237, 0.08), transparent 30%),
            linear-gradient(180deg, #0c0717 0%, #120a22 48%, #0c0717 100%);
        }

        /* blueprint grid texture for the whole gate */
        .public-gate::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.55;
          background-image:
            linear-gradient(rgba(167, 139, 250, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167, 139, 250, 0.05) 1px, transparent 1px);
          background-size: 46px 46px, 46px 46px;
          -webkit-mask-image: radial-gradient(130% 90% at 50% 0%, #000 35%, transparent 80%);
                  mask-image: radial-gradient(130% 90% at 50% 0%, #000 35%, transparent 80%);
        }

        .public-wrap {
          position: relative;
          z-index: 1;
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        /* ===== Hero â€” Ù…Ø®ØªØ¨Ø± Ø§Ù„ÙÙ‡Ù… ===== */
        .public-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 26px;
          align-items: center;
          border-radius: 30px;
          padding: clamp(24px, 4vw, 44px);
          color: var(--text);
          border: 1px solid var(--line-2);
          background:
            radial-gradient(120% 150% at 88% -20%, rgba(139, 92, 246, 0.18), transparent 52%),
            radial-gradient(90% 130% at -5% 120%, rgba(124, 58, 237, 0.10), transparent 55%),
            linear-gradient(155deg, #160c2a 0%, #130a24 55%, #1a1030 100%);
          box-shadow: 0 40px 120px rgba(8, 5, 18, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .public-hero > * {
          position: relative;
          z-index: 2;
        }

        .public-brand-logo {
          margin-bottom: 20px;
          width: fit-content;
          max-width: 100%;
          border-radius: 16px;
          padding: 9px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--line);
          box-shadow: 0 12px 34px rgba(8, 5, 18, 0.4);
        }

        .public-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 15px 8px 13px;
          border-radius: 999px;
          background: var(--indigo-soft);
          border: 1px solid rgba(139, 92, 246, 0.32);
          color: #d6c9fb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .public-badge::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.18);
          animation: labPulse 2.6s ease-in-out infinite;
        }

        .public-hero h1 {
          margin: 20px 0 16px;
          font-family: var(--font-display, inherit);
          font-size: clamp(34px, 5.2vw, 66px);
          line-height: 1.16;
          font-weight: 800;
          letter-spacing: 0;
          color: var(--warm);
          text-wrap: balance;
        }

        .public-hero p {
          margin: 0;
          max-width: 540px;
          color: var(--muted);
          line-height: 2.05;
          font-size: clamp(14px, 1.4vw, 16px);
          font-weight: 600;
        }

        .hero-points {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 26px;
        }

        .hero-point {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          padding: 16px 16px 18px;
          background: var(--panel);
          border: 1px solid var(--line);
          backdrop-filter: blur(8px);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .hero-point::before {
          content: "";
          position: absolute;
          inset-inline: 16px;
          top: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--indigo), var(--teal));
          opacity: 0.5;
        }

        .hero-point:hover {
          transform: translateY(-3px);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 18px 44px rgba(8, 5, 18, 0.5);
        }

        .hero-point b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 16px;
          margin-bottom: 12px;
          color: var(--gold-2);
          background: var(--gold-soft);
          border: 1px solid rgba(168, 85, 247, 0.3);
          font-size: 13px;
          font-weight: 900;
          font-family: var(--font-display, inherit);
        }

        .hero-point strong {
          display: block;
          color: var(--text);
          font-size: 15px;
          line-height: 1.6;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .hero-point span {
          display: block;
          color: var(--muted-2);
          font-size: 12.5px;
          line-height: 1.9;
          font-weight: 600;
        }

        /* ===== Access panel â€” Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„ÙˆØµÙˆÙ„ ===== */
        .auth-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: clamp(20px, 2.4vw, 26px);
          background:
            linear-gradient(180deg, rgba(36, 22, 66, 0.92), rgba(26, 15, 48, 0.96));
          color: var(--text);
          border: 1px solid var(--line-2);
          box-shadow: 0 36px 90px rgba(8, 5, 18, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .auth-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, var(--indigo), var(--teal) 60%, var(--gold));
          opacity: 0.85;
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 6px;
          border-radius: 16px;
          background: rgba(16, 9, 30, 0.6);
          border: 1px solid var(--line);
          margin-bottom: 18px;
        }

        .auth-tabs button {
          border: 0;
          cursor: pointer;
          border-radius: 12px;
          padding: 12px;
          font-family: inherit;
          color: var(--muted);
          font-weight: 800;
          background: transparent;
          transition: 0.2s ease;
        }

        .auth-tabs button:hover {
          color: var(--text);
        }

        .auth-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #3b1d6e);
          box-shadow: 0 10px 26px rgba(124, 58, 237, 0.32);
        }

        .auth-title {
          margin: 0 0 16px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: 22px;
          line-height: 1.5;
          font-weight: 800;
        }

        .auth-field {
          margin-bottom: 13px;
        }

        .auth-field label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .auth-field input {
          width: 100%;
          min-height: 50px;
          border-radius: 14px;
          border: 1px solid var(--line-2);
          padding: 0 14px;
          font-family: inherit;
          font-weight: 700;
          color: var(--text);
          background: rgba(16, 9, 30, 0.7);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .auth-field input::placeholder {
          color: #6f6391;
          font-weight: 600;
        }

        .auth-field input:focus {
          border-color: var(--indigo);
          background: rgba(18, 11, 34, 0.92);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.16);
        }

        .password-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .toggle-password {
          border: 1px solid var(--line-2);
          border-radius: 14px;
          padding: 0 16px;
          background: var(--indigo-soft);
          color: #d6c9fb;
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .toggle-password:hover {
          background: rgba(139, 92, 246, 0.22);
        }

        .hint {
          display: block;
          margin-top: 8px;
          color: var(--muted-2);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 600;
        }

        .forgot-button {
          border: 0;
          background: transparent;
          color: var(--teal-2);
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          padding: 6px 0 0;
          text-align: right;
        }

        .forgot-button:hover {
          color: var(--teal);
          text-decoration: underline;
        }

        .auth-notice {
          margin: 11px 0;
          border-radius: 14px;
          padding: 12px 14px;
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.32);
          color: var(--gold-2);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 700;
        }

        .auth-actions {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .auth-actions button {
          border: 0;
          border-radius: 15px;
          min-height: 52px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 900;
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .auth-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-primary {
          position: relative;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #3b1d6e);
          box-shadow: 0 16px 38px rgba(59, 29, 110, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .auth-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 22px 50px rgba(59, 29, 110, 0.5);
        }

        .auth-ghost {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line-2);
        }

        .auth-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
        }

        /* ===== Sections ===== */
        .public-section {
          position: relative;
          margin-top: 16px;
          border-radius: 26px;
          padding: clamp(22px, 3vw, 34px);
          background: linear-gradient(180deg, rgba(26, 15, 48, 0.86), rgba(22, 13, 42, 0.9));
          border: 1px solid var(--line);
          box-shadow: 0 26px 70px rgba(8, 5, 18, 0.4);
        }

        .section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--line);
        }

        .section-head h2 {
          position: relative;
          margin: 0;
          padding-inline-start: 18px;
          font-family: var(--font-display, inherit);
          font-size: clamp(23px, 3vw, 36px);
          color: var(--warm);
          font-weight: 800;
          line-height: 1.3;
        }

        .section-head h2::before {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          top: 0.12em;
          bottom: 0.12em;
          width: 4px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--indigo), var(--teal));
        }

        .section-head p {
          margin: 7px 0 0;
          color: var(--muted);
          line-height: 1.9;
          font-size: 13px;
          font-weight: 600;
        }

        /* ===== Counters â€” Ù„ÙˆØ­Ø© Ù…Ø¤Ø´Ø±Ø§Øª Ø­ÙŠØ© ===== */
        .counter-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .counter-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 22px 22px 20px;
          background:
            radial-gradient(120% 140% at 100% 0%, rgba(124, 58, 237, 0.1), transparent 50%),
            linear-gradient(180deg, rgba(30, 18, 55, 0.9), rgba(22, 13, 42, 0.94));
          border: 1px solid var(--line);
        }

        .counter-card::before {
          content: "";
          position: absolute;
          inset-inline: 0;
          top: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--teal), transparent);
          opacity: 0.7;
          animation: labScanX 4.5s linear infinite;
        }

        .counter-card::after {
          content: "";
          position: absolute;
          top: 16px;
          inset-inline-end: 16px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.16);
          animation: labPulse 2.6s ease-in-out infinite;
        }

        .counter-card strong {
          position: relative;
          display: block;
          font-family: var(--font-display, inherit);
          font-size: clamp(30px, 4vw, 40px);
          color: var(--warm);
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.1;
        }

        .counter-card span {
          position: relative;
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-size: 12.5px;
          line-height: 1.8;
          font-weight: 700;
        }

        /* ===== Path â€” Ø³Ù„Ù‘Ù… Ø§Ù„Ù†Ø¶Ø¬ Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ ===== */
        .path-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .path-card,
        .info-card,
        .faq-card {
          position: relative;
          border-radius: 20px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(30, 18, 55, 0.78), rgba(22, 13, 42, 0.85));
          border: 1px solid var(--line);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .path-card {
          padding-top: 22px;
        }

        .path-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 22px 54px rgba(8, 5, 18, 0.5);
        }

        .path-card b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          margin-bottom: 14px;
          padding: 0 6px;
          border-radius: 13px;
          background: var(--indigo-soft);
          border: 1px solid rgba(139, 92, 246, 0.34);
          color: var(--indigo-2);
          font-family: var(--font-display, inherit);
          font-size: 16px;
          font-weight: 900;
          box-shadow: 0 0 0 5px rgba(139, 92, 246, 0.07);
        }

        .path-card strong,
        .info-card strong {
          display: block;
          margin-bottom: 9px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: 16.5px;
          line-height: 1.55;
          font-weight: 800;
        }

        .path-card span,
        .info-card span {
          display: block;
          color: var(--muted);
          line-height: 1.9;
          font-size: 13px;
          font-weight: 600;
        }

        /* ===== Free sample â€” Ù…Ø¹Ø§ÙŠÙ†Ø© ØºØ±ÙØ© ØªØ´Ø®ÙŠØµ ===== */
        .two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .sample-box {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 24px;
          background: linear-gradient(180deg, rgba(30, 18, 55, 0.86), rgba(22, 13, 42, 0.92));
          border: 1px solid var(--line-2);
        }

        .sample-box::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          opacity: 0.85;
        }

        .sample-lesson::before {
          background: linear-gradient(90deg, var(--indigo), transparent);
        }

        .sample-simulation::before {
          background: linear-gradient(90deg, var(--teal), transparent);
        }

        .sample-lesson {
          background:
            radial-gradient(120% 130% at 100% 0%, rgba(139, 92, 246, 0.12), transparent 48%),
            linear-gradient(180deg, rgba(30, 18, 55, 0.86), rgba(22, 13, 42, 0.92));
        }

        .sample-simulation {
          background:
            radial-gradient(120% 130% at 100% 0%, rgba(124, 58, 237, 0.12), transparent 48%),
            linear-gradient(180deg, rgba(30, 18, 55, 0.86), rgba(22, 13, 42, 0.92));
        }

        .sample-box h3 {
          margin: 0 0 12px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: 20px;
          line-height: 1.5;
          font-weight: 800;
        }

        .sample-box p {
          margin: 0;
          color: var(--muted);
          line-height: 2;
          font-size: 13px;
          font-weight: 600;
        }

        .sample-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(16, 9, 30, 0.6);
          border: 1px solid var(--line-2);
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .sample-kicker::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--gold);
        }

        .sample-bullets {
          margin: 16px 0 0;
          padding: 0;
          list-style: none;
          color: var(--muted);
          line-height: 1.9;
          font-size: 12.5px;
          font-weight: 700;
        }

        .sample-bullets li {
          position: relative;
          padding-inline-start: 22px;
          margin-bottom: 8px;
        }

        .sample-bullets li::before {
          content: "";
          position: absolute;
          inset-inline-start: 4px;
          top: 0.55em;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 2px solid var(--teal);
        }

        .sample-button {
          margin-top: 18px;
          border: 0;
          border-radius: 15px;
          padding: 14px 20px;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #3b1d6e);
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 16px 36px rgba(59, 29, 110, 0.34);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sample-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 48px rgba(59, 29, 110, 0.46);
        }

        /* ===== About â€” Ù…Ù„Ù Ø§Ù„Ø­Ø¶ÙˆØ± Ø§Ù„Ù…Ù‡Ù†ÙŠ ===== */
        .about-panel {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 14px;
        }

        .info-card strong {
          font-size: 19px;
        }

        .about-links {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 18px;
        }

        .about-links a {
          text-decoration: none;
          border-radius: 999px;
          padding: 10px 16px;
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line-2);
          font-size: 12.5px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .about-links a.social-link {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
        }

        .about-links a.social-link svg {
          width: 17px;
          height: 17px;
          flex: none;
        }

        .about-links a.social-linkedin {
          color: #ffffff !important;
          background: #0a66c2 !important;
          border: 1px solid #0a66c2 !important;
        }

        .about-links a.social-linkedin:hover {
          background: #0958a8 !important;
          border-color: #0958a8 !important;
          transform: translateY(-2px);
        }

        .about-links a.social-x {
          color: #ffffff !important;
          background: #18102e !important;
          border: 1px solid rgba(196, 181, 253, 0.26) !important;
        }

        .about-links a.social-x:hover {
          background: #24143f !important;
          transform: translateY(-2px);
        }

        body.od-theme-dark .about-links a.social-x {
          color: #f7f3fc !important;
          background: #18102e !important;
          border-color: rgba(196, 181, 253, 0.30) !important;
        }

        .about-links a.social-mail {
          color: #7c3aed !important;
          background: rgba(139, 92, 246, 0.12) !important;
          border: 1px solid rgba(139, 92, 246, 0.28) !important;
        }

        body.od-theme-dark .about-links a.social-mail {
          color: #d6c9fb !important;
          background: rgba(139, 92, 246, 0.16) !important;
          border-color: rgba(167, 139, 250, 0.34) !important;
        }

        .about-links a.social-mail:hover {
          transform: translateY(-2px);
        }

        .cred-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .info-card .cred-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.01em;
          color: #7c3aed;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.28);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.1);
        }

        .info-card .cred-badge svg {
          width: 14px;
          height: 14px;
          flex: none;
          opacity: 0.95;
        }

        body.od-theme-dark .info-card .cred-badge {
          color: #d6c9fb !important;
          background: rgba(139, 92, 246, 0.16) !important;
          border-color: rgba(167, 139, 250, 0.34) !important;
        }

        .about-links a:hover {
          color: #fff;
          border-color: rgba(139, 92, 246, 0.45);
          background: var(--indigo-soft);
          transform: translateY(-2px);
        }

        /* ===== FAQ â€” Ø£Ø³Ø¦Ù„Ø© Ù…Ø§ Ù‚Ø¨Ù„ Ø§Ù„Ø±Ø­Ù„Ø© ===== */
        .faq-list {
          display: grid;
          gap: 11px;
        }

        .faq-item {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(30, 18, 55, 0.7), rgba(22, 13, 42, 0.82));
          border: 1px solid var(--line);
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
        }

        .faq-item:hover {
          border-color: var(--line-2);
        }

        .faq-item:has(.faq-question[aria-expanded="true"]) {
          border-color: rgba(139, 92, 246, 0.42);
          box-shadow: 0 18px 44px rgba(8, 5, 18, 0.4);
        }

        .faq-item:has(.faq-question[aria-expanded="true"])::before {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--indigo), var(--teal));
        }

        .faq-question {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 17px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          color: var(--text);
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 800;
          text-align: right;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .faq-question:hover {
          color: var(--warm);
        }

        .faq-question > span:last-child {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: none;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          background: rgba(16, 9, 30, 0.6);
          border: 1px solid var(--line-2);
          color: var(--teal-2);
          font-size: 18px;
          font-weight: 900;
          line-height: 1;
        }

        .faq-question[aria-expanded="true"] > span:last-child {
          color: var(--gold-2);
          background: var(--gold-soft);
          border-color: rgba(168, 85, 247, 0.34);
        }

        .faq-question:focus-visible {
          outline: 2px solid var(--indigo);
          outline-offset: -2px;
        }

        .faq-answer {
          padding: 2px 20px 18px;
          color: var(--muted);
          line-height: 2;
          font-size: 13px;
          font-weight: 600;
          animation: faqReveal 0.28s ease both;
        }

        /* ===== Legal â€” Ø·Ù…Ø£Ù†ÙŠÙ†Ø© ÙˆØ«Ù‚Ø© ===== */
        .legal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .legal-card {
          position: relative;
          border-radius: 18px;
          padding: 20px;
          padding-inline-start: 22px;
          background: linear-gradient(180deg, rgba(28, 17, 50, 0.7), rgba(22, 13, 42, 0.82));
          border: 1px solid var(--line);
        }

        .legal-card::before {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          top: 18px;
          bottom: 18px;
          width: 3px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--gold), rgba(168, 85, 247, 0.2));
        }

        .legal-card strong {
          display: block;
          color: var(--warm);
          font-weight: 800;
          font-size: 15px;
          margin-bottom: 9px;
        }

        .legal-card span {
          color: var(--muted);
          line-height: 1.9;
          font-size: 13px;
          font-weight: 600;
        }

        /* ===== Footer â€” ØªÙˆÙ‚ÙŠØ¹ ÙØ§Ø®Ø± ===== */
        .public-footer-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .public-footer-tagline {
          max-width: 640px;
          margin: 0 auto;
          color: inherit;
          line-height: 2;
          font-size: 13px;
          font-weight: 700;
        }

        .public-footer {
          position: relative;
          overflow: hidden;
          margin-top: 16px;
          text-align: center;
          color: var(--muted);
          line-height: 2;
          font-size: 13px;
          font-weight: 700;
          border-radius: 24px;
          padding: 34px 26px;
          background:
            radial-gradient(120% 160% at 50% -40%, rgba(139, 92, 246, 0.1), transparent 55%),
            linear-gradient(180deg, rgba(26, 15, 48, 0.92), rgba(16, 9, 28, 0.96));
          border: 1px solid var(--line-2);
        }

        .public-footer::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--indigo), var(--teal), transparent);
          opacity: 0.7;
        }

        .public-footer span {
          display: block;
          color: var(--muted-2);
          margin-top: 6px;
          font-size: 12px;
        }

        /* ===== Sample modal â€” Ù…Ù„Ù Ø§Ù„Ø­Ø§Ù„Ø© ===== */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(10, 6, 20, 0.72);
          backdrop-filter: blur(12px);
          animation: faqReveal 0.2s ease both;
        }

        .sample-modal {
          position: relative;
          width: min(900px, 100%);
          max-height: 88vh;
          overflow: auto;
          border-radius: 26px;
          background: linear-gradient(180deg, #1a1030, #130a24);
          border: 1px solid var(--line-2);
          box-shadow: 0 40px 110px rgba(0, 0, 0, 0.6);
          padding: clamp(22px, 3vw, 30px);
          color: var(--text);
        }

        .sample-modal::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, var(--indigo), var(--teal) 55%, var(--gold));
        }

        .sample-modal h2 {
          margin: 0 0 12px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: clamp(22px, 3vw, 28px);
          line-height: 1.45;
          font-weight: 800;
        }

        .sample-modal p,
        .sample-modal li {
          color: var(--muted);
          line-height: 2;
          font-size: 14px;
          font-weight: 600;
        }

        .sample-modal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
          margin: 18px 0;
        }

        .sample-modal-card {
          border-radius: 16px;
          padding: 16px;
          background: rgba(16, 9, 30, 0.55);
          border: 1px solid var(--line);
        }

        .sample-modal-card b {
          display: inline-flex;
          margin-bottom: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          background: var(--indigo-soft);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: var(--indigo-2);
          font-size: 11px;
          font-weight: 900;
        }

        .sample-modal-card strong {
          display: block;
          color: var(--text);
          line-height: 1.7;
          font-size: 13px;
          font-weight: 800;
        }

        .sample-modal-card span {
          display: block;
          margin-top: 7px;
          color: var(--muted-2);
          line-height: 1.8;
          font-size: 12px;
          font-weight: 600;
        }

        .simulation-choice {
          width: 100%;
          border-radius: 16px;
          padding: 15px 16px;
          margin-top: 11px;
          background: rgba(16, 9, 30, 0.5);
          border: 1px solid var(--line-2);
          text-align: right;
          font-family: inherit;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .simulation-choice:hover {
          transform: translateY(-1px);
          border-color: rgba(139, 92, 246, 0.42);
          box-shadow: 0 14px 32px rgba(8, 5, 18, 0.5);
        }

        .simulation-choice.correct {
          border-color: rgba(34, 197, 94, 0.5);
          background: rgba(34, 197, 94, 0.1);
        }

        .simulation-choice.warning {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.1);
        }

        .simulation-choice.wrong {
          border-color: rgba(244, 99, 122, 0.55);
          background: rgba(244, 99, 122, 0.1);
        }

        .simulation-choice strong {
          display: block;
          color: var(--text);
          font-size: 13px;
          line-height: 1.7;
          font-weight: 800;
        }

        .simulation-choice span {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 600;
        }

        .simulation-feedback {
          margin-top: 16px;
          border-radius: 16px;
          padding: 15px 16px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.26);
          color: var(--text);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 700;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .modal-actions button {
          border: 1px solid var(--line-2);
          border-radius: 14px;
          padding: 12px 18px;
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .modal-actions button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* ===== Motion keyframes ===== */
        @keyframes labPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.16); opacity: 1; }
          50% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0.04); opacity: 0.78; }
        }

        @keyframes labScanX {
          0% { transform: translateX(-60%); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translateX(60%); opacity: 0; }
        }

        @keyframes faqReveal {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== Responsive ===== */
        @media (max-width: 980px) {
          .public-hero,
          .about-panel {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 920px) {
          .counter-grid,
          .path-grid,
          .two-grid,
          .legal-grid,
          .hero-points,
          .sample-modal-grid {
            grid-template-columns: 1fr;
          }

          .section-head {
            display: block;
          }
        }

        @media (max-width: 560px) {
          .public-gate {
            padding: 18px 11px 56px;
          }

          .hero-points {
            gap: 10px;
          }

          .auth-tabs {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .public-badge::before,
          .counter-card::before,
          .counter-card::after,
          .faq-answer,
          .modal-backdrop {
            animation: none !important;
          }
        }

        /* Final visitor contrast layer: surface decides text, not inherited theme color. */
        body:not(.od-theme-dark) .public-gate {
          --visitor-heading: #2b155f;
          --visitor-text: #46345f;
          --visitor-muted: #6a5d85;
          --visitor-surface: linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,247,255,.92));
          --visitor-soft: rgba(124, 58, 237, .11);
          --visitor-border: rgba(124, 58, 237, .20);
          color: var(--visitor-text) !important;
          background:
            radial-gradient(circle at 12% 8%, rgba(139, 92, 246, .15), transparent 30%),
            radial-gradient(circle at 88% 12%, rgba(16, 185, 129, .08), transparent 28%),
            linear-gradient(180deg, #f7f3fc 0%, #efe9fb 48%, #f7f3fc 100%) !important;
        }

        body:not(.od-theme-dark) .public-gate :is(
          .public-hero,
          .public-section,
          .auth-card,
          .hero-point,
          .counter-card,
          .path-card,
          .info-card,
          .legal-card,
          .faq-item,
          .sample-box,
          .sample-modal,
          .sample-modal-card
        ) {
          background: var(--visitor-surface) !important;
          border-color: var(--visitor-border) !important;
          color: var(--visitor-text) !important;
          box-shadow: 0 18px 48px rgba(74, 45, 132, .10) !important;
        }

        body:not(.od-theme-dark) .public-gate :is(
          .public-hero h1,
          .section-head h2,
          .auth-title,
          .counter-card strong,
          .path-card strong,
          .info-card strong,
          .legal-card strong,
          .sample-box h3,
          .sample-modal h2,
          .sample-modal-card strong,
          .faq-question > span:first-child
        ) {
          color: var(--visitor-heading) !important;
          -webkit-text-fill-color: var(--visitor-heading) !important;
          background-image: none !important;
          text-shadow: none !important;
        }

        body:not(.od-theme-dark) .public-gate :is(
          .public-hero p,
          .section-head p,
          .hero-point span,
          .counter-card span,
          .path-card span,
          .info-card span,
          .legal-card span,
          .sample-box p,
          .sample-bullets li,
          .sample-modal p,
          .sample-modal-card span,
          .faq-answer,
          .public-footer,
          .public-footer p,
          .public-footer span
        ) {
          color: var(--visitor-text) !important;
          -webkit-text-fill-color: var(--visitor-text) !important;
          opacity: 1 !important;
        }

        body:not(.od-theme-dark) .public-gate :is(
          .public-badge,
          .sample-kicker,
          .hero-point b,
          .path-card b,
          .legal-footer-link
        ) {
          color: #6d28d9 !important;
          -webkit-text-fill-color: #6d28d9 !important;
          background: var(--visitor-soft) !important;
          border-color: rgba(124, 58, 237, .28) !important;
        }

        body:not(.od-theme-dark) .public-gate :is(
          .auth-field label,
          .hint,
          .auth-tabs button,
          .auth-ghost,
          .toggle-password,
          .forgot-button
        ) {
          color: var(--visitor-text) !important;
          -webkit-text-fill-color: var(--visitor-text) !important;
        }

        body:not(.od-theme-dark) .public-gate :is(.auth-field input, .password-row input) {
          color: var(--visitor-heading) !important;
          -webkit-text-fill-color: var(--visitor-heading) !important;
          background: rgba(255,255,255,.98) !important;
          border-color: var(--visitor-border) !important;
        }

        body:not(.od-theme-dark) .public-gate :is(
          .auth-tabs button.active,
          .auth-primary,
          .sample-button
        ),
        body.od-theme-dark .public-gate :is(
          .auth-tabs button.active,
          .auth-primary,
          .sample-button
        ) {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        /* ============================================================
           Ø¥ØµÙ„Ø§Ø­ ØªØ¨Ø§ÙŠÙ† Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„ÙØ§ØªØ­ Ø¯Ø§Ø®Ù„ Ù†Ø§ÙØ°Ø© Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø© (ÙƒØ§Ù† Ù†Ø§Ù‚ØµÙ‹Ø§):
           Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø© + Ø­Ø§Ù„ØªØ§ Ø§Ù„ØµÙˆØ§Ø¨/Ø§Ù„Ø®Ø·Ø£ + ØµÙ†Ø¯ÙˆÙ‚ Ø§Ù„ØªØµØ­ÙŠØ­ + Ø²Ø± Ø§Ù„Ø¥ØºÙ„Ø§Ù‚.
           Ø¨Ø¯ÙˆÙ† Ù‡Ø°Ù‡ Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ ÙŠØ¨Ù‚Ù‰ Ø§Ù„Ù†Øµ ÙØ§ØªØ­Ù‹Ø§ Ø¹Ù„Ù‰ Ø®Ù„ÙÙŠØ© ÙØ§ØªØ­Ø© ÙÙŠØ®ØªÙÙŠ.
        ============================================================ */
        body:not(.od-theme-dark) .public-gate .simulation-choice {
          background: var(--visitor-surface) !important;
          border-color: var(--visitor-border) !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice strong {
          color: var(--visitor-heading) !important;
          -webkit-text-fill-color: var(--visitor-heading) !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice span {
          color: var(--visitor-text) !important;
          -webkit-text-fill-color: var(--visitor-text) !important;
          opacity: 1 !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice.correct {
          background: rgba(16, 122, 87, .12) !important;
          border-color: rgba(16, 122, 87, .42) !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice.correct strong {
          color: #0f6b58 !important;
          -webkit-text-fill-color: #0f6b58 !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice.wrong {
          background: rgba(164, 22, 58, .10) !important;
          border-color: rgba(164, 22, 58, .40) !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice.wrong strong {
          color: #a4163a !important;
          -webkit-text-fill-color: #a4163a !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-choice.warning {
          background: var(--visitor-soft) !important;
          border-color: rgba(124, 58, 237, .42) !important;
        }

        body:not(.od-theme-dark) .public-gate .simulation-feedback {
          background: var(--visitor-soft) !important;
          border-color: rgba(124, 58, 237, .30) !important;
          color: var(--visitor-heading) !important;
          -webkit-text-fill-color: var(--visitor-heading) !important;
        }

        body:not(.od-theme-dark) .public-gate .modal-actions button {
          background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
          border-color: transparent !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        body.od-theme-dark .public-gate :is(
          .public-section,
          .auth-card,
          .hero-point,
          .counter-card,
          .path-card,
          .info-card,
          .legal-card,
          .faq-item,
          .sample-box,
          .sample-modal,
          .sample-modal-card
        ) {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .10), transparent 30%),
            rgba(28, 17, 48, .94) !important;
          border-color: rgba(196, 181, 253, .24) !important;
          color: #e7ddfb !important;
        }

        body.od-theme-dark .public-gate :is(
          .public-hero h1,
          .section-head h2,
          .auth-title,
          .counter-card strong,
          .path-card strong,
          .info-card strong,
          .legal-card strong,
          .sample-box h3,
          .sample-modal h2,
          .sample-modal-card strong,
          .faq-question > span:first-child
        ) {
          color: #f7f3fc !important;
          -webkit-text-fill-color: #f7f3fc !important;
          background-image: none !important;
        }

        body.od-theme-dark .public-gate :is(
          .public-hero p,
          .section-head p,
          .hero-point span,
          .counter-card span,
          .path-card span,
          .info-card span,
          .legal-card span,
          .sample-box p,
          .sample-bullets li,
          .sample-modal p,
          .sample-modal-card span,
          .faq-answer
        ) {
          color: #cfc3ee !important;
          -webkit-text-fill-color: #cfc3ee !important;
          opacity: 1 !important;
        }

        /* Final polish after the global skin: quieter headings and locked icon colors. */
        html body .public-gate .public-hero h1 {
          max-width: 760px !important;
          font-size: clamp(2rem, 4vw, 3.35rem) !important;
          line-height: 1.22 !important;
          font-weight: 850 !important;
          letter-spacing: 0 !important;
          text-wrap: balance;
        }

        html body .public-gate :is(.section-head h2, .auth-title, .sample-box h3) {
          font-weight: 820 !important;
          letter-spacing: 0 !important;
        }

        html body .public-gate :is(
          .public-hero p,
          .section-head p,
          .hero-point span,
          .counter-card span,
          .path-card span,
          .info-card span,
          .sample-box p,
          .sample-bullets li
        ) {
          font-weight: 650 !important;
        }

        html body .public-gate .about-links a.social-linkedin {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: #0a66c2 !important;
          border-color: rgba(10, 102, 194, .95) !important;
          box-shadow: 0 14px 32px rgba(10, 102, 194, .20) !important;
        }

        html body .public-gate .about-links a.social-x {
          color: #f7f3fc !important;
          -webkit-text-fill-color: #f7f3fc !important;
          background: #18102e !important;
          border-color: rgba(196, 181, 253, .26) !important;
          box-shadow: 0 14px 32px rgba(24, 16, 46, .18) !important;
        }

        html body .public-gate .about-links a.social-mail {
          color: #5b21b6 !important;
          -webkit-text-fill-color: #5b21b6 !important;
          background: rgba(124, 58, 237, .10) !important;
          border-color: rgba(124, 58, 237, .28) !important;
        }

        html body.od-theme-dark .public-gate .about-links a.social-mail {
          color: #e7ddfb !important;
          -webkit-text-fill-color: #e7ddfb !important;
          background: rgba(167, 139, 250, .16) !important;
          border-color: rgba(196, 181, 253, .30) !important;
        }

        html body .public-gate .about-links a.social-link :is(span, svg, path) {
          color: currentColor !important;
          fill: currentColor !important;
          stroke: currentColor;
          -webkit-text-fill-color: currentColor !important;
        }

      `}</style>

      <div className="public-wrap">
        <div
          className="visitor-theme-toggle"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
            position: "relative",
            zIndex: 3
          }}
        >
          <ThemeToggle />
        </div>
        <section className="public-hero">
          <div>
            <div className="public-brand-logo">
              <SiteLogo variant="horizontal" context="hero" />
            </div>
            <span className="public-badge">Ø±Ø­Ù„Ø© Ù…Ø¹Ø±ÙÙŠØ© Ù…ØªÙƒØ§Ù…Ù„Ø© ÙÙŠ Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ</span>
            <h1>Ø­ÙŠØ§Ùƒ ÙÙŠ Ù…Ø³Ø§Ø­Ø© Ø§Ù„ÙÙ‡Ù… Ù‚Ø¨Ù„ Ø§Ù„Ø­Ù„</h1>
            <p>
              Ù‡Ù†Ø§ Ù„Ø§ ØªØ¯Ø®Ù„ Ù„ØªÙ‚Ø±Ø£ Ù…Ø­ØªÙˆÙ‰ Ù…ØªØ±Ø§ÙƒÙ…Ù‹Ø§ØŒ Ø¨Ù„ Ù„ØªØªÙ‚Ø¯Ù… Ø¹Ø¨Ø± Ù…Ø³Ø§Ø± Ù…ØµÙ…Ù… Ø¨Ø¹Ù‚Ù„ÙŠØ©
              Ø§Ø³ØªØ´Ø§Ø±ÙŠØ©: ØªØ´Ø®ÙŠØµØŒ ØªØµÙ…ÙŠÙ…ØŒ ØªØºÙŠÙŠØ±ØŒ Ø«Ù‚Ø§ÙØ©ØŒ Ù‚ÙŠØ§Ø³ØŒ ÙˆØ§Ø³ØªØ¯Ø§Ù…Ø©.
            </p>

            <div className="hero-points" aria-label="Ù…Ø±ØªÙƒØ²Ø§Øª Ø§Ù„Ø±Ø­Ù„Ø©">
              <div className="hero-point">
                <b>01</b>
                <strong>Ø§Ù‚Ø±Ø£ Ø§Ù„Ù…Ù†Ø¸Ù…Ø© ÙƒÙ†Ø¸Ø§Ù…</strong>
                <span>
                  Ø§ÙÙ‡Ù… Ø§Ù„Ø¹Ù„Ø§Ù‚Ø§Øª Ø¨ÙŠÙ† Ø§Ù„Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ©ØŒ Ø§Ù„Ù‡ÙŠÙƒÙ„ØŒ Ø§Ù„Ø£Ø¯ÙˆØ§Ø±ØŒ Ø§Ù„Ø«Ù‚Ø§ÙØ©ØŒ
                  ÙˆØ§Ù„Ø­ÙˆØ§ÙØ² Ù‚Ø¨Ù„ Ø¨Ù†Ø§Ø¡ Ø£ÙŠ ØªØ¯Ø®Ù„.
                </span>
              </div>

              <div className="hero-point">
                <b>02</b>
                <strong>Ø§Ø¨Ù†Ù Ø­ÙƒÙ…Ù‹Ø§ Ù…Ù‡Ù†ÙŠÙ‹Ø§</strong>
                <span>
                  ØªØ¯Ø±Ù‘Ø¨ Ø¹Ù„Ù‰ ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø£Ø¹Ø±Ø§Ø¶ØŒ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙØ±Ø¶ÙŠØ§ØªØŒ ÙˆØ·Ù„Ø¨ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª
                  Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù‚Ø¨Ù„ Ø¥ØµØ¯Ø§Ø± Ø§Ù„ØªÙˆØµÙŠØ©.
                </span>
              </div>

              <div className="hero-point">
                <b>03</b>
                <strong>Ø­ÙˆÙ‘Ù„ Ø§Ù„ØªØ¹Ù„Ù… Ø¥Ù„Ù‰ Ø£Ø«Ø±</strong>
                <span>
                  Ø§Ù†ØªÙ‚Ù„ Ù…Ù† ÙÙ‡Ù… Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø¥Ù„Ù‰ ØªØ·Ø¨ÙŠÙ‚Ù‡Ø§ ÙÙŠ Ù‚Ø±Ø§Ø±Ø§Øª ØªÙ†Ø¸ÙŠÙ…ÙŠØ© Ø£ÙˆØ¶Ø­
                  ÙˆØ£ÙƒØ«Ø± Ù‚Ø§Ø¨Ù„ÙŠØ© Ù„Ù„Ù‚ÙŠØ§Ø³.
                </span>
              </div>
            </div>
          </div>

          <form className="auth-card" onSubmit={mode === "recover" ? handleRecoverySubmit : handleSubmit}>
            {mode !== "recover" && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={mode === "signin" ? "active" : ""}
                  onClick={() => switchMode("signin")}
                >
                  Ø¯Ø®ÙˆÙ„
                </button>
                <button
                  type="button"
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => switchMode("signup")}
                >
                  ØªØ³Ø¬ÙŠÙ„ Ø¬Ø¯ÙŠØ¯
                </button>
              </div>
            )}

            {mode === "recover" && (
              <>
                <h2 className="auth-title">ØªØ¹ÙŠÙŠÙ† ÙƒÙ„Ù…Ø© Ù…Ø±ÙˆØ± Ø¬Ø¯ÙŠØ¯Ø©</h2>

                <div className="auth-field">
                  <label htmlFor="newPassword">ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©</label>
                  <div className="password-row">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ ÙˆÙÙŠÙ‡Ø§ Ø­Ø±Ù ÙˆØ±Ù‚Ù…"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      aria-label={showNewPassword ? "Ø¥Ø®ÙØ§Ø¡ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©" : "Ø¥Ø¸Ù‡Ø§Ø± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©"}
                      aria-pressed={showNewPassword}
                      onClick={() => setShowNewPassword((value) => !value)}
                    >
                      {showNewPassword ? "Ø¥Ø®ÙØ§Ø¡" : "Ø¥Ø¸Ù‡Ø§Ø±"}
                    </button>
                  </div>
                  <span className="hint">{recoveryPasswordHint || "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ù†Ø§Ø³Ø¨Ø©."}</span>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©</label>
                  <input
                    id="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ø£Ø¹Ø¯ ÙƒØªØ§Ø¨Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </>
            )}

            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="fullName">Ø§ÙƒØªØ¨ Ø§Ø³Ù…Ùƒ ÙƒÙ…Ø§ ØªØ­Ø¨ Ø£Ù† ØªØ±Ø§Ù‡ ÙÙŠ Ø´Ù‡Ø§Ø¯ØªÙƒ</label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Ø§ÙƒØªØ¨ Ø§Ù„Ø§Ø³Ù… Ù‡Ù†Ø§"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {mode !== "recover" && isSupabaseConfigured && (
              <>
                <div className="auth-field">
                  <label htmlFor="email">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password">ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±</label>
                  <div className="password-row">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ ÙˆÙÙŠÙ‡Ø§ Ø­Ø±Ù ÙˆØ±Ù‚Ù…"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      aria-label={showPassword ? "Ø¥Ø®ÙØ§Ø¡ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" : "Ø¥Ø¸Ù‡Ø§Ø± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? "Ø¥Ø®ÙØ§Ø¡" : "Ø¥Ø¸Ù‡Ø§Ø±"}
                    </button>
                  </div>

                  {mode === "signup" && (
                    <span className="hint">
                      {passwordHint || "ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ù…Ù†Ø§Ø³Ø¨Ø©."}
                    </span>
                  )}

                  {mode === "signin" && (
                    <button
                      type="button"
                      className="forgot-button"
                      onClick={handleForgotPassword}
                      disabled={busy}
                    >
                      Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ
                    </button>
                  )}
                </div>
              </>
            )}

            {notice && (
              <div className="auth-notice" role="alert" aria-live="assertive">
                {notice}
              </div>
            )}

            <div className="auth-actions">
              <button className="auth-primary" type="submit" disabled={busy}>
                {busy
                  ? "Ø¬Ø§Ø± Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©..."
                  : mode === "recover"
                    ? "ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
                    : mode === "signin"
                      ? "Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø­Ù„Ø©"
                      : "Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨"}
              </button>

              {mode === "recover" && (
                <button className="auth-ghost" type="button" onClick={() => switchMode("signin")}>
                  Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
                </button>
              )}

              {!isSupabaseConfigured && mode !== "recover" && (
                <button className="auth-ghost" type="button" onClick={enterDemo}>
                  Ø¯Ø®ÙˆÙ„ ØªØ¬Ø±ÙŠØ¨ÙŠ
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø±Ø­Ù„Ø©</h2>
              <p>Ù†Ø¨Ø¶ Ø­ÙŠ ÙŠÙˆØ¶Ø­ Ø­Ø±ÙƒØ© Ø§Ù„Ù…ØªØ¹Ù„Ù…ÙŠÙ† Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø³Ø§Ø±.</p>
            </div>
          </div>

          <div className="counter-grid" aria-live="polite">
            <NeoMetricGauge
              value={statsReady ? stats.total_joined : 0}
              max={Math.max(1, statsReady ? stats.total_joined : 1)}
              progress={statsReady ? 100 : 0}
              displayValue={statsReady ? formatNumber(stats.total_joined) : "..."}
              label="متدرب ومتدربة بدأوا رحلتهم"
              status="progress"
              size="default"
            />
            <NeoMetricGauge
              value={statsReady ? stats.active_now : 0}
              max={Math.max(1, statsReady ? stats.active_now : 1)}
              progress={statsReady ? 100 : 0}
              displayValue={statsReady ? formatNumber(stats.active_now) : "..."}
              label="يدرسون معك في هذه اللحظة"
              status="readiness"
              size="default"
            />
            <NeoMetricGauge
              value={statsReady ? stats.completed_count : 0}
              max={Math.max(1, statsReady ? stats.completed_count : 1)}
              progress={statsReady ? 100 : 0}
              displayValue={statsReady ? formatNumber(stats.completed_count) : "..."}
              label="أتموا الـ 180 يوما بنجاح"
              status="complete"
              size="default"
            />
          </div>
        </section>

        <VisitorTestimonialsMarquee />

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>Ø®Ø±ÙŠØ·Ø© Ù…Ø®ØªØµØ±Ø© Ù„Ù„Ù…Ø³Ø§Ø±</h2>
              <p>Ø³ØªØ© Ø£Ø´Ù‡Ø± ØªØ¨Ù†ÙŠ Ù‚Ø¯Ø±Ø© Ù…ØªØ¯Ø±Ø¬Ø© ÙÙŠ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù†Ø¸Ù…Ø© ÙˆØªØµÙ…ÙŠÙ… Ø§Ù„ØªØ¯Ø®Ù„ ÙˆÙ‚ÙŠØ§Ø³ Ø§Ù„Ø£Ø«Ø±.</p>
            </div>
          </div>

          <div className="path-grid">
            {MONTHS.map((month) => (
              <div className="path-card" key={month.number}>
                <b>{month.number}</b>
                <strong>{month.title}</strong>
                <span>{month.output}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>Ø¹ÙŠÙ†Ø© Ù…Ø¬Ø§Ù†ÙŠØ© Ù…Ù† Ø§Ù„ØªØ¬Ø±Ø¨Ø©</h2>
              <p>Ø¬Ø±Ù‘Ø¨ Ù„Ù…Ø­Ø© Ù‚ØµÙŠØ±Ø© Ù…Ù† Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„ØªØ¹Ù„Ù‘Ù… Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©ØŒ ÙˆØ§ÙƒØªØ´Ù ÙƒÙŠÙ ØªØªØ­ÙˆÙ„ Ø§Ù„ÙÙƒØ±Ø© Ø¥Ù„Ù‰ Ù…ÙˆÙ‚Ù ØªØ·Ø¨ÙŠÙ‚ÙŠ ÙˆØ§Ø¶Ø­.</p>
            </div>
          </div>

          <div className="two-grid">
            <div className="sample-box sample-lesson">
              <span className="sample-kicker">Ø¹ÙŠÙ†Ø© Ø¯Ø±Ø³</span>
              <h3>Ù„Ù…Ø§Ø°Ø§ Ù„Ø§ ØªØ¨Ø¯Ø£ Ù…Ù† Ø§Ù„Ø­Ù„ØŸ</h3>
              <p>
                Ø³ØªØªØ¹Ù„Ù… ÙƒÙŠÙ ØªÙØ±Ù‘Ù‚ Ø¨ÙŠÙ† Ø§Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø¸Ø§Ù‡Ø± ÙˆØ§Ù„Ø³Ø¨Ø¨ Ø§Ù„Ø¬Ø°Ø±ÙŠØŒ ÙˆÙƒÙŠÙ ØªØ­ÙˆÙ‘Ù„
                Ù…Ø´ÙƒÙ„Ø© Ø¹Ø§Ù…Ø© Ù…Ø«Ù„ Ø¶Ø¹Ù Ø§Ù„Ø§Ù„ØªØ²Ø§Ù… Ø¥Ù„Ù‰ Ø£Ø³Ø¦Ù„Ø© ØªØ´Ø®ÙŠØµÙŠØ© Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ­Ù‚Ù‚.
              </p>
              <ul className="sample-bullets">
                <li>ÙÙƒØ±Ø© Ù…Ø±ÙƒØ²Ø© Ù…Ù† Ø¯Ø±Ø³ ÙØ¹Ù„ÙŠ.</li>
                <li>Ø¥Ø·Ø§Ø± ØªØ´Ø®ÙŠØµÙŠ Ù…Ø®ØªØµØ±.</li>
              </ul>
              <button className="sample-button" type="button" onClick={() => openSample("lesson")}>
                ÙØªØ­ Ø§Ù„Ø¯Ø±Ø³ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠ
              </button>
            </div>

            <div className="sample-box sample-simulation">
              <span className="sample-kicker">Ø¹ÙŠÙ†Ø© Ù…Ø­Ø§ÙƒØ§Ø©</span>
              <h3>Ø§Ø¬ØªÙ…Ø§Ø¹ Ø¹Ø§Ø¬Ù„ Ù‚Ø¨Ù„ Ø¥Ø·Ù„Ø§Ù‚ Ù…Ø¨Ø§Ø¯Ø±Ø© ØªØºÙŠÙŠØ±</h3>
              <p>
                Ø³ØªØ¯Ø®Ù„ Ù…ÙˆÙ‚ÙÙ‹Ø§ Ù‚ØµÙŠØ±Ù‹Ø§ ÙÙŠÙ‡ Ø¶ØºØ· Ù…Ù† Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©ØŒ Ø¨ÙŠØ§Ù†Ø§Øª Ù†Ø§Ù‚ØµØ©ØŒ ÙˆØ±ÙˆØ§ÙŠØ§Øª
                Ù…Ø®ØªÙ„ÙØ©. Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ø£Ù† ØªØ®ØªØ§Ø± ØªØµØ±ÙÙ‹Ø§ Ù…Ù‡Ù†ÙŠÙ‹Ø§ ÙˆØªØ¹Ø±Ù Ù„Ù…Ø§Ø°Ø§ Ù‡Ùˆ Ø§Ù„Ø£Ù‚Ø±Ø¨.
              </p>
              <ul className="sample-bullets">
                <li>Ù…ÙˆÙ‚Ù Ù‚ØµÙŠØ± ÙŠØ­Ø§ÙƒÙŠ Ù‚Ø±Ø§Ø±Ù‹Ø§ Ù…Ù‡Ù†ÙŠÙ‹Ø§ ÙˆØ§Ù‚Ø¹ÙŠÙ‹Ø§.</li>
                <li>Ø§Ø®ØªÙŠØ§Ø±Ø§Øª ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ø§Ø®ØªØ¨Ø§Ø± Ø·Ø±ÙŠÙ‚Ø© ØªÙÙƒÙŠØ±Ùƒ.</li>
                <li>ØªØºØ°ÙŠØ© Ø±Ø§Ø¬Ø¹Ø© ÙÙˆØ±ÙŠØ© ØªÙˆØ¶Ù‘Ø­ Ù…Ù†Ø·Ù‚ Ø§Ù„Ù‚Ø±Ø§Ø± Ø§Ù„Ø£Ù†Ø³Ø¨.</li>
              </ul>
              <button className="sample-button" type="button" onClick={() => openSample("simulation")}>
                ØªØ¬Ø±Ø¨Ø© Ø§Ù„Ù…ÙˆÙ‚Ù
              </button>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>Ø¹Ù† Ø±ÙŠØ§Ù†</h2>
              <p>Ø§Ù„Ø¬Ù‡Ø© Ø§Ù„ØªÙŠ ØªÙ‚Ù Ø®Ù„Ù Ø¨Ù†Ø§Ø¡ Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø­Ù„Ø© Ø§Ù„Ù…Ø¹Ø±ÙÙŠØ©.</p>
            </div>
          </div>

          <div className="about-panel">
            <div className="info-card">
              <strong>Ø±ÙŠØ§Ù† Ø§Ù„Ø¹Ø¬Ù„Ø§Ù†</strong>
              <span>
                ØµØ§Ù†Ø¹ Ù‡Ø°Ù‡ Ø§Ù„Ø±Ø­Ù„Ø© ÙƒØ£Ø«Ø± Ù…Ø¹Ø±ÙÙŠ Ù‡Ø§Ø¯Ø¦Ø› Ù„Ù…Ù† ÙŠØ¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ø¹Ù†Ù‰ Ø®Ù„Ù Ø§Ù„Ø³Ù„ÙˆÙƒØŒ
                ÙˆØ§Ù„Ù†Ø¸Ø§Ù… Ø®Ù„Ù Ø§Ù„Ù…Ø´ÙƒÙ„Ø©. ÙŠØ¬Ù…Ø¹ Ø§Ù‡ØªÙ…Ø§Ù…Ù‡ Ø¨ÙŠÙ† Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©ØŒ Ø§Ù„ØªØ·ÙˆÙŠØ±
                Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØŒ Ø§Ù„Ø£Ø¯Ø§Ø¡ØŒ Ø§Ù„ØªØ¹Ù„Ù…ØŒ ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ©.
              </span>

              <div className="about-links">
                <a
                  className="social-link social-linkedin"
                  href="https://www.linkedin.com/in/rayanalajlan/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  className="social-link social-x"
                  href="https://x.com/Rayan_Alajlan"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Ù…Ù†ØµØ© X"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Ù…Ù†ØµØ© X</span>
                </a>
                <a className="social-link social-mail" href="mailto:Rayansalajlan@gmail.com">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m3.5 7 8.5 6 8.5-6" />
                  </svg>
                  <span>Ø·Ù„Ø¨ Ø§Ø³ØªØ´Ø§Ø±Ø©</span>
                </a>
              </div>
            </div>

            <div className="info-card">
              <strong>Ø§Ø¹ØªÙ…Ø§Ø¯Ø§Øª Ù…Ù‡Ù†ÙŠØ©</strong>
              <div className="cred-badges">
                {["SHRM-SCP", "SPHRi", "CPTD", "PMP"].map((cred) => (
                  <span className="cred-badge" key={cred}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="9" r="5.2" />
                      <path d="M9 13.3 7.7 21 12 18.5 16.3 21 15 13.3" />
                      <path d="m9.8 9 1.5 1.6 3-3.2" />
                    </svg>
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>Ø£Ø³Ø¦Ù„Ø© Ø´Ø§Ø¦Ø¹Ø©</h2>
              <p>Ø¥Ø¬Ø§Ø¨Ø§Øª Ù…Ø®ØªØµØ±Ø© ØªØ³Ø§Ø¹Ø¯Ùƒ Ù‚Ø¨Ù„ Ø¨Ø¯Ø¡ Ø§Ù„Ø±Ø­Ù„Ø©.</p>
            </div>
          </div>

          <div className="faq-list">
            {FAQ.map((item, index) => {
              const open = openFaq === item.q;
              const panelId = `faq-panel-${index}`;

              return (
                <div className="faq-item" key={item.q}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(open ? "" : item.q)}
                  >
                    <span>{item.q}</span>
                    <span>{open ? "âˆ’" : "+"}</span>
                  </button>

                  {open && (
                    <div id={panelId} className="faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>Ø§Ù„Ø®ØµÙˆØµÙŠØ© ÙˆØ´Ø±ÙˆØ· Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…</h2>
              <p>ÙˆØ¶ÙˆØ­ Ù…Ø¨ÙƒØ± Ø­ÙˆÙ„ Ø§Ù„Ø­Ø³Ø§Ø¨Ø§Øª ÙˆØ§Ù„ØªÙ‚Ø¯Ù… Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ ÙˆØ§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.</p>
            </div>
          </div>

          <div className="legal-grid">
            <div className="legal-card">
              <strong>Ø­ÙØ¸ Ø§Ù„ØªÙ‚Ø¯Ù…</strong>
              <span>
                ØªÙØ³ØªØ®Ø¯Ù… Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ§Ù„ØªÙ‚Ø¯Ù… Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ Ù„Ø­ÙØ¸ Ø¥Ù†Ø¬Ø§Ø²Ùƒ ÙˆØ¥Ø¹Ø§Ø¯ØªÙƒ Ø¥Ù„Ù‰
                Ø¢Ø®Ø± Ù…Ø­Ø·Ø© ÙˆØµÙ„Øª Ø¥Ù„ÙŠÙ‡Ø§.
              </span>
            </div>

            <div className="legal-card">
              <strong>Ø­Ø¯ÙˆØ¯ Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©</strong>
              <span>
                ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù† ØªØ«Ø¨Øª Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø±Ø­Ù„Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©ØŒ ÙˆÙ„Ø§ ØªÙ…Ø«Ù„ Ø´Ù‡Ø§Ø¯Ø©
                Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø£Ùˆ ÙˆØ¹Ø¯Ø§ ÙˆØ¸ÙŠÙÙŠØ§.
              </span>
            </div>

            <div className="legal-card">
              <strong>Ø³Ù„Ø§Ù…Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</strong>
              <span>
                Ù„Ø§ ØªØ¯Ø®Ù„ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø³Ø±ÙŠØ© Ø£Ùˆ Ø­Ø³Ø§Ø³Ø© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø¹Ø§Ù…Ø©ØŒ ÙˆØ§Ø³ØªØ®Ø¯Ù…
                Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠØ© Ù„ØºØ±Ø¶ Ø§Ù„ØªØ¹Ù„Ù… ÙÙ‚Ø·.
              </span>
            </div>
          </div>
        </section>

        <footer className="public-footer">
          <div className="public-footer-logo">
            <SiteLogo variant="horizontal" context="footer" />
          </div>
          <p className="public-footer-tagline">
            ØµÙ†Ø¹ Ø¨ÙˆØ§Ø³Ø·Ø© Ø±ÙŠØ§Ù† Ø§Ù„Ø¹Ø¬Ù„Ø§Ù† ÙƒØ£Ø«Ø± Ù…Ø¹Ø±ÙÙŠ Ù‡Ø§Ø¯Ø¦Ø› Ù„Ù…Ù† ÙŠØ¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ø¹Ù†Ù‰ Ø®Ù„Ù Ø§Ù„Ø³Ù„ÙˆÙƒØŒ ÙˆØ§Ù„Ù†Ø¸Ø§Ù… Ø®Ù„Ù Ø§Ù„Ù…Ø´ÙƒÙ„Ø©.
          </p>
          <span>Â© 2026 â€” Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©</span>
          <LegalFooterLinks />
        </footer>
      </div>
      {activeSample.type && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={activeSample.type === "lesson" ? "Ø¯Ø±Ø³ ØªØ¬Ø±ÙŠØ¨ÙŠ" : "Ù…Ø­Ø§ÙƒØ§Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ©"}
          onClick={() => closeSample()}
        >
          <div className="sample-modal" onClick={(event) => event.stopPropagation()}>
            {activeLesson && (
              <>
                <h2>Ø¯Ø±Ø³ ØªØ¬Ø±ÙŠØ¨ÙŠ: {activeLesson.title}</h2>

                <p>{activeLesson.intro}</p>

                <div className="sample-modal-grid">
                  {activeLesson.cards.map((card) => (
                    <div className="sample-modal-card" key={card.label}>
                      <b>{card.label}</b>
                      <strong>{card.title}</strong>
                      <span>{card.text}</span>
                    </div>
                  ))}
                </div>

                <p>{activeLesson.takeaway}</p>

              </>
            )}

            {activeSimulation && (
              <>
                <h2>Ù…Ø­Ø§ÙƒØ§Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ©: {activeSimulation.title}</h2>

                <p>{activeSimulation.context}</p>

                <div className="sample-modal-grid">
                  {activeSimulation.signals.map((signal) => (
                    <div className="sample-modal-card" key={signal.label}>
                      <b>{signal.label}</b>
                      <strong>{signal.title}</strong>
                      <span>{signal.text}</span>
                    </div>
                  ))}
                </div>

                <p>
                  Ø§Ø®ØªØ± Ø§Ù„ØªØµØ±Ù Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù…Ù‡Ù†ÙŠÙ‹Ø§. Ø¨Ø¹Ø¯ Ø§Ø®ØªÙŠØ§Ø±Ùƒ Ø³ÙŠØ¸Ù‡Ø± Ù„Ùƒ Ø§Ù„ØªØµØ­ÙŠØ­
                  Ù…Ø¨Ø§Ø´Ø±Ø© Ø¯Ø§Ø®Ù„ Ù†ÙØ³ Ø§Ù„Ù†Ø§ÙØ°Ø©.
                </p>

                {activeSimulationOptions.map((option) => {
                  const selected = activeSample.selectedOption === option.id;
                  const revealed = Boolean(activeSample.selectedOption);
                  const correct = option.id === activeSimulation.correctOptionId;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`simulation-choice ${
                        revealed && correct ? "correct" : ""
                      } ${revealed && selected && !correct ? "wrong" : ""}`}
                      onClick={() => chooseSimulationOption(option.id)}
                    >
                      <strong>{option.title}</strong>
                      {revealed && (
                        <span>
                          {selected && correct
                            ? "Ø§Ø®ØªÙŠØ§Ø±Ùƒ ØµØ­ÙŠØ­. "
                            : selected && !correct
                              ? "Ø§Ø®ØªÙŠØ§Ø±Ùƒ ÙŠØ­ØªØ§Ø¬ Ù…Ø±Ø§Ø¬Ø¹Ø©. "
                              : correct
                                ? "Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„Ø£Ù‚Ø±Ø¨: "
                                : ""}
                          {option.feedback}
                        </span>
                      )}
                    </button>
                  );
                })}

                {activeSample.selectedOption && (
                  <div className="simulation-feedback" role="status" aria-live="polite">
                    {activeSample.selectedOption === activeSimulation.correctOptionId
                      ? "Ù…Ù…ØªØ§Ø². Ø£Ù†Øª Ù„Ù… ØªÙ†Ø¬Ø°Ø¨ Ù„Ù„Ø­Ù„ Ø§Ù„Ø£Ø³Ø±Ø¹ØŒ Ø¨Ù„ Ø¨Ø¯Ø£Øª Ù…Ù† Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ ÙˆØ§Ù„ØªØ´Ø®ÙŠØµ Ù‚Ø¨Ù„ ØªØµÙ…ÙŠÙ… Ø§Ù„ØªØ¯Ø®Ù„."
                      : "Ø§Ù„ÙÙƒØ±Ø© Ù„ÙŠØ³Øª Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­Ù„ Ø§Ù„Ø£Ø¬Ù…Ù„ØŒ Ø¨Ù„ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„ØªÙŠ ØªØ­Ù…ÙŠ Ø§Ù„ØªØ´Ø®ÙŠØµ Ù…Ù† Ø§Ù„Ù‚ÙØ² Ø¥Ù„Ù‰ ØªÙØ³ÙŠØ± ÙˆØ§Ø­Ø¯."}
                  </div>
                )}
              </>
            )}

            <div className="modal-actions">
              <button type="button" onClick={() => closeSample()}>
                Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ø¹ÙŠÙ†Ø©
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

