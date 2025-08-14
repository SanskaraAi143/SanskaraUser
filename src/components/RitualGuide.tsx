import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/context/AuthContext";

const rituals = [
  {
    id: 1,
    name: "Mehndi",
    description: "A pre-wedding celebration where the bride's hands and feet are adorned with intricate henna designs.",
    image: "/lovable-uploads/7d1ca230-11c7-4edb-9419-d5847fd86028.png",
    alt: "Intricate Mehndi designs on a bride's hands"
  },
  {
    id: 2,
    name: "Haldi",
    description: "A cleansing ritual where turmeric paste is applied to the bride and groom, believed to purify and bless the couple.",
    image: "https://images.unsplash.com/photo-1622556498246-755f44ca76f3?w=800&auto=format&fit=crop",
    alt: "Bride and groom at a Haldi ceremony"
  },
  {
    id: 3,
    name: "Sangeet",
    description: "A musical celebration where families sing, dance, and celebrate the upcoming union.",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
    alt: "Guests dancing at a Sangeet ceremony"
  },
  {
    id: 4,
    name: "Saptapadi",
    description: "The seven sacred steps taken by the couple around a holy fire, representing seven vows.",
    image: "https://images.unsplash.com/photo-1600578248539-48bdb9db48f2?w=800&auto=format&fit=crop",
    alt: "Bride and groom taking the Saptapadi"
  },
];

const RitualGuide = () => {
  const [activeRitual, setActiveRitual] = useState(rituals[0]);

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-lora font-bold mb-4">
            Discover Sacred Wedding Rituals
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore the meanings and significance behind traditional Hindu wedding ceremonies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="text-3xl">{activeRitual.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-8">
                {activeRitual.description}
              </p>
              <AuthActionButton navigateTo="/dashboard/rituals">
                <Info size={20} className="mr-2" />
                Learn More
              </AuthActionButton>
            </CardContent>
          </Card>

          <div className="order-1 lg:order-2">
            <Carousel className="w-full">
              <CarouselContent>
                {rituals.map((ritual) => (
                  <CarouselItem key={ritual.id}>
                    <button
                      type="button"
                      aria-label={`View details for ${ritual.name}`}
                      className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] w-full block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => setActiveRitual(ritual)}
                    >
                      <img
                        src={ritual.image}
                        alt={ritual.alt || ritual.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RitualGuide;
