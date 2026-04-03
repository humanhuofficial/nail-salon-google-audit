export function buildReviewMessages(salonName: string) {
  const name = salonName.trim() || "us";
  return {
    whatsapp: `Hi! Thanks for visiting ${name} today 💅 If you have a moment, we’d really appreciate a quick Google review — it helps other people find us. Here’s the link: [your Google Maps review link]. Thank you so much!`,
    sms: `${name}: Thanks for coming in! If you enjoyed your visit, a short Google review would mean the world to us. Link: [Google Maps]. Reply STOP to opt out.`,
    casual: `Hey! Hope you love your nails ✨ When you get a sec, would you mind leaving us a Google review? Small businesses like ours grow mostly from happy clients like you — thank you!`,
  };
}
