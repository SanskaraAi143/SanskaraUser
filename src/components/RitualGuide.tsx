import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, Info, Sparkles, Flower, Music, Heart, HandHeart, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const rituals = [
  {
    id: 1,
    name: "Mehndi",
    description: "A pre-wedding celebration where the bride's hands and feet are adorned with intricate henna designs symbolizing beauty, joy, and spiritual awakening.",
    icon: Flower,
    color: "text-orange-500"
  },
  {
    id: 2,
    name: "Haldi",
    description: "A cleansing ritual where turmeric paste is applied to the bride and groom, believed to purify and bless the couple before marriage.",
    icon: Sparkles,
    color: "text-yellow-500"
  },
  {
    id: 3,
    name: "Sangeet",
    description: "A musical celebration where families come together to sing, dance, and celebrate the upcoming union with performances and festivities.",
    icon: Music,
    color: "text-purple-500"
  },
  {
    id: 4,
    name: "Saptapadi",
    description: "The seven steps taken by the couple around the sacred fire, with each step representing a vow and blessing for their married life.",
    icon: Heart,
    color: "text-red-500"
  },
  {
    id: 5,
    name: "Kanyadaan",
    description: "The giving away of the bride by her father, symbolizing the acceptance of the bride into her new family.",
    icon: HandHeart,
    color: "text-pink-500"
  },
  {
    id: 6,
    name: "Mangalsutra",
    description: "The tying of the sacred necklace by the groom around the bride's neck, symbolizing their union and the groom's commitment.",
    icon: Gem,
    color: "text-gold-500"
  }
];

const RitualGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeRitual, setActiveRitual] = useState(rituals[0]);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-lora font-bold mb-6">
            Discover Sacred Wedding Rituals
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            Explore the meanings and significance behind traditional Hindu wedding ceremonies
            and learn how to incorporate them into your special day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{activeRitual.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground mb-8">
                        {activeRitual.description}
                    </p>
                    <AuthActionButton
                        navigateTo="/dashboard/rituals"
                    >
                        <Info size={20} className="mr-2" />
                        Learn More
                    </AuthActionButton>
                </CardContent>
                <CardFooter>
                    <Button variant="ghost" className="text-sm">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save for later
                    </Button>
                </CardFooter>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {rituals.map((ritual) => {
                const IconComponent = ritual.icon;
                return (
                  <Card
                    key={ritual.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      activeRitual.id === ritual.id
                        ? 'ring-2 ring-orange-400 shadow-lg bg-orange-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveRitual(ritual)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mb-3 flex justify-center items-center">
                        <div className={`p-3 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 ${
                          activeRitual.id === ritual.id ? 'from-orange-200 to-yellow-200' : ''
                        }`}>
                          <IconComponent size={32} className={ritual.color} />
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-1">
                        {ritual.name}
                      </h3>
                      <p className="text-xs text-gray-600 leading-tight">
                        {ritual.description.slice(0, 60)}...
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RitualGuide;
