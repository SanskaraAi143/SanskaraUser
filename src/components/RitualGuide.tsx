import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import SignInDialog from "@/components/auth/SignInDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const rituals = [
  {
    id: 1,
    name: "Mehndi",
    description: "A pre-wedding celebration where the bride's hands and feet are adorned with intricate henna designs symbolizing beauty, joy, and spiritual awakening.",
    image: "/lovable-uploads/7d1ca230-11c7-4edb-9419-d5847fd86028.png",
  },
  {
    id: 2,
    name: "Haldi",
    description: "A cleansing ritual where turmeric paste is applied to the bride and groom, believed to purify and bless the couple before marriage.",
    image: "https://images.unsplash.com/photo-1622556498246-755f44ca76f3?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Sangeet",
    description: "A musical celebration where families come together to sing, dance, and celebrate the upcoming union with performances and festivities.",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Saptapadi",
    description: "The seven steps taken by the couple around the sacred fire, with each step representing a vow and blessing for their married life.",
    image: "https://images.unsplash.com/photo-1600578248539-48bdb9db48f2?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Kanyadaan",
    description: "The giving away of the bride by her father, symbolizing the acceptance of the bride into her new family.",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Mangalsutra",
    description: "The tying of the sacred necklace by the groom around the bride's neck, symbolizing their union and the groom's commitment.",
    image: "https://images.unsplash.com/photo-1626195790682-5481864033e0?w=800&auto=format&fit=crop",
  }
];

const RitualGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeRitual, setActiveRitual] = useState(rituals[0]);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="gradient-bg opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-8 md:p-12 mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Discover Sacred<br/>
            <span className="title-gradient">Wedding Rituals</span>
          </h2>
          <p className="text-lg md:text-xl text-wedding-brown/80">
            Explore the meanings and significance behind traditional Hindu wedding ceremonies
            and learn how to incorporate them into your special day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="glass-card p-8 md:p-10">
              <h3 className="text-2xl md:text-3xl font-playfair font-bold title-gradient mb-4">
                {activeRitual.name}
              </h3>
              <p className="text-lg text-wedding-brown/80 mb-8">
                {activeRitual.description}
              </p>
              
              {user ? (
                <Button 
                  className="cta-button"
                  onClick={() => navigate('/dashboard/rituals')}
                >
                  <Info size={20} className="mr-2" />
                  Learn More
                </Button>
              ) : (
                <SignInDialog>
                  <Button className="cta-button">
                    <Info size={20} className="mr-2" />
                    Learn More
                  </Button>
                </SignInDialog>
              )}
              
              <div className="mt-8 pt-8 border-t border-wedding-gold/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-wedding-gold" />
                    <span className="text-wedding-brown/80">Save for later</span>
                  </div>
                  <Button variant="ghost" className="nav-link">
                    All Rituals
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Carousel className="w-full">
              <CarouselContent>
                {rituals.map((ritual) => (
                  <CarouselItem key={ritual.id}>
                    <div 
                      className="glass-card p-2 aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
                      onClick={() => setActiveRitual(ritual)}
                    >
                      <img
                        src={ritual.image}
                        alt={ritual.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-gradient-primary text-white border-0 hover:bg-gradient-primary hover:opacity-90" />
              <CarouselNext className="bg-gradient-primary text-white border-0 hover:bg-gradient-primary hover:opacity-90" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RitualGuide;
