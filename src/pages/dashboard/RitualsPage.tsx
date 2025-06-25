import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Star, ChevronRight, Play, Heart } from 'lucide-react';

const rituals = [
  {
    id: 1,
    name: "Ganesh Puja",
    category: "Pre-Wedding",
    duration: "30-45 minutes",
    participants: "Family Members",
    significance: "Removing obstacles and seeking blessings for a smooth wedding",
    description: "Lord Ganesh, the remover of obstacles, is invoked to bless the upcoming wedding ceremony. This ritual typically involves offering prayers, flowers, and sweets to ensure no hindrances in the wedding preparations.",
    materials: ["Ganesh idol/picture", "Flowers (marigold, lotus)", "Sweets (modak, laddu)", "Incense sticks", "Oil lamp"],
    steps: [
      "Clean and decorate the puja area",
      "Place the Ganesh idol/picture with respect",
      "Light the oil lamp and incense",
      "Offer flowers and sweets while chanting mantras",
      "Perform aarti and seek blessings"
    ],
    timing: "Usually performed 1-2 weeks before the wedding",
    image: "https://images.unsplash.com/photo-1605201934782-307b60e4d0e9?w=800&auto=format&fit=crop",
    difficulty: "Easy"
  },
  {
    id: 2,
    name: "Haldi Ceremony",
    category: "Pre-Wedding",
    duration: "1-2 hours",
    participants: "Close Friends & Family",
    significance: "Purification and blessing of the bride and groom",
    description: "A vibrant ceremony where turmeric paste is applied to the bride and groom by family members and friends. It's believed to purify and bless the couple while bringing a natural glow to their skin.",
    materials: ["Turmeric powder", "Rose water", "Milk/yogurt", "Sandalwood powder", "Flowers", "Traditional clothes"],
    steps: [
      "Prepare the haldi paste with turmeric, rose water, and milk",
      "Seat the bride/groom in the center",
      "Family members apply haldi while singing traditional songs",
      "Shower flower petals and blessings",
      "Conclude with prayers and celebration"
    ],
    timing: "1-2 days before the wedding",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop",
    difficulty: "Easy"
  },
  {
    id: 3,
    name: "Saptapadi (Seven Steps)",
    category: "Main Ceremony",
    duration: "20-30 minutes",
    participants: "Bride, Groom, Priest",
    significance: "Seven sacred vows binding the couple for seven lifetimes",
    description: "The most sacred part of the Hindu wedding where the couple takes seven steps around the sacred fire, making seven vows to each other. Each step represents a specific promise for their married life.",
    materials: ["Sacred fire (havan kund)", "Ghee for offerings", "Rice grains", "Flowers", "Sacred thread"],
    steps: [
      "Light the sacred fire with proper mantras",
      "Couple holds hands and circles the fire",
      "At each step, they make specific vows",
      "Offer rice and flowers to the fire",
      "Complete seven circles with priest's guidance"
    ],
    timing: "During the main wedding ceremony",
    image: "https://images.unsplash.com/photo-1626195790682-5481864033e0?w=800&auto=format&fit=crop",
    difficulty: "Moderate"
  },
  {
    id: 4,
    name: "Mangalsutra Ceremony",
    category: "Main Ceremony",
    duration: "10-15 minutes",
    participants: "Bride, Groom, Family",
    significance: "Symbol of marriage and protection",
    description: "The groom ties the sacred mangalsutra (wedding necklace) around the bride's neck, symbolizing their union and his commitment to protect and cherish her throughout their married life.",
    materials: ["Mangalsutra", "Black beads", "Gold pendant", "Sacred thread", "Turmeric"],
    steps: [
      "Bless the mangalsutra with turmeric and prayers",
      "Groom ties the first knot while chanting mantras",
      "Groom's sister helps tie the second and third knots",
      "Family members shower blessings",
      "Bride touches the mangalsutra to seek divine protection"
    ],
    timing: "After Saptapadi during main ceremony",
    image: "https://images.unsplash.com/photo-1623706726693-57fb90c48de8?w=800&auto=format&fit=crop",
    difficulty: "Easy"
  },
  {
    id: 5,
    name: "Sindoor Daan",
    category: "Main Ceremony",
    duration: "5-10 minutes",
    participants: "Bride, Groom",
    significance: "Mark of married woman and eternal bond",
    description: "The groom applies sindoor (vermillion) to the bride's hair parting, marking her as a married woman. This is considered one of the most emotional and significant moments of the wedding.",
    materials: ["Sindoor (vermillion)", "Small silver container", "Mirror", "Red cloth"],
    steps: [
      "Groom takes sindoor with his ring finger",
      "Applies it to the bride's hair parting (maang)",
      "Bride looks in the mirror for the first time as a married woman",
      "Family members bless the couple",
      "Exchange of garlands if not done earlier"
    ],
    timing: "After Mangalsutra ceremony",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&auto=format&fit=crop",
    difficulty: "Easy"
  },
  {
    id: 6,
    name: "Griha Pravesh",
    category: "Post-Wedding",
    duration: "30-60 minutes",
    participants: "Newlyweds, Groom's Family",
    significance: "Welcoming the bride to her new home",
    description: "The bride's first entry into her marital home with traditional ceremonies, including knocking over a pot of rice at the threshold and being welcomed by her mother-in-law.",
    materials: ["Kalash (water pot)", "Rice", "Flowers", "Aarti items", "Rangoli materials", "Red cloth"],
    steps: [
      "Prepare the house entrance with rangoli and flowers",
      "Place a pot of rice at the threshold",
      "Bride kicks the pot gently with her right foot",
      "Mother-in-law performs aarti of the couple",
      "Bride enters the house with her right foot first"
    ],
    timing: "When couple arrives at groom's house after wedding",
    image: "https://images.unsplash.com/photo-1609119153196-0b35a636d8d3?w=800&auto=format&fit=crop",
    difficulty: "Moderate"
  }
];

const RitualsPage = () => {
  const [selectedRitual, setSelectedRitual] = useState(rituals[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Pre-Wedding", "Main Ceremony", "Post-Wedding"];
  
  const filteredRituals = selectedCategory === "All" 
    ? rituals 
    : rituals.filter(ritual => ritual.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Moderate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hindu Wedding Rituals</h1>
            <p className="text-gray-600">Understand the sacred traditions and their significance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{rituals.length}</div>
            <div className="text-gray-600">Sacred Rituals</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-gray-600">Ceremony Phases</div>
          </div>
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">Ancient</div>
            <div className="text-gray-600">Wisdom</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Ritual List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Sacred Rituals
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredRituals.map(ritual => (
                <div
                  key={ritual.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedRitual.id === ritual.id
                      ? "bg-orange-100 border-orange-300 border-2"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => setSelectedRitual(ritual)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{ritual.name}</h3>
                    <Badge className={getDifficultyColor(ritual.difficulty)}>
                      {ritual.difficulty}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ritual.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {ritual.participants}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs mt-2">
                    {ritual.category}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Ritual Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <img
                src={selectedRitual.image}
                alt={selectedRitual.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex items-center gap-4 mb-2">
                <CardTitle className="text-2xl">{selectedRitual.name}</CardTitle>
                <Badge className={getDifficultyColor(selectedRitual.difficulty)}>
                  {selectedRitual.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedRitual.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedRitual.participants}
                </div>
                <Badge variant="outline">{selectedRitual.category}</Badge>
              </div>
              <CardDescription className="text-base mt-3">
                {selectedRitual.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Significance */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Spiritual Significance
                </h3>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  {selectedRitual.significance}
                </p>
              </div>

              {/* Materials Needed */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Materials Needed</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedRitual.materials.map((material, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-sm text-center border">
                      {material}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Guide */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-500" />
                  Step-by-Step Guide
                </h3>
                <div className="space-y-3">
                  {selectedRitual.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Timing</h3>
                <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  {selectedRitual.timing}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Save to My Timeline
                </Button>
                <Button variant="outline">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Next Ritual
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RitualsPage;
