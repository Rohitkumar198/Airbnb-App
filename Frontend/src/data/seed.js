// UI only: emoji for category chips. Listings always come from the backend.
export const EMOJI = { Beach: "🏖️", Cabins: "🛖", "Amazing views": "🌄", Countryside: "🌾", Luxe: "💎", City: "🏙️", Mountains: "🏔️", Trending: "🔥" };
export const emojiFor = (c) => EMOJI[c] || "🏠";
