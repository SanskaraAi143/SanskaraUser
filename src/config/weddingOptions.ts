export const weddingRegions = [
  { value: "north_indian", label: "North Indian" },
  { value: "south_indian", label: "South Indian" },
  { value: "east_indian", label: "East Indian" },
  { value: "west_indian", label: "West Indian" },
];

export const weddingCommunities: { [key: string]: { value: string; label: string }[] } = {
  north_indian: [
    { value: "punjabi", label: "Punjabi" },
    { value: "sikh", label: "Sikh" },
    { value: "kashmiri_pandit", label: "Kashmiri Pandit" },
    { value: "rajput", label: "Rajput" },
    { value: "marwari", label: "Marwari" },
  ],
  south_indian: [
    { value: "telugu_brahmin", label: "Telugu Brahmin" },
    { value: "tamil_iyer", label: "Tamil Iyer" },
    { value: "kannadiga", label: "Kannadiga" },
    { value: "keralite", label: "Keralite" },
  ],
  east_indian: [
    { value: "bengali_kayastha", label: "Bengali Kayastha" },
    { value: "assamese", label: "Assamese" },
    { value: "odia", label: "Odia" },
  ],
  west_indian: [
    { value: "maharashtrian", label: "Maharashtrian" },
    { value: "gujarathi", label: "Gujarathi" },
  ],
};

export const weddingCeremonies = [
  { id: "roka", label: "Roka / Tilak" },
  { id: "sangeet", label: "Sangeet" },
  { id: "mehendi", label: "Mehendi" },
  { id: "haldi", label: "Haldi" },
  { id: "engagement", label: "Engagement" },
  { id: "wedding", label: "Wedding Ceremony" },
  { id: "reception", label: "Reception" },
];