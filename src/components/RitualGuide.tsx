
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
  const [selectedRitual, setSelectedRitual] = useState(rituals[0]);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleViewDetails = (ritual) => {
    if (user) {
      navigate('/dashboard/chat', { state: { initialTab: 'ritual', ritualName: ritual.name } });
    }
  };
  
  const handleLearnMore = () => {
    if (user) {
      navigate('/dashboard/chat', { state: { initialTab: 'ritual', ritualName: selectedRitual.name } });
    }
  };

  return (
    <section id="ritual-guide" className="py-16 md:py-24 bg-wedding-cream pattern-bg">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-4">
            Sacred Rituals Guide
          </h2>
          <p className="text-gray-700 text-lg">
            Explore and understand the significance of traditional Hindu wedding rituals
            to create a meaningful ceremony that honors your heritage.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-white p-6 rounded-xl shadow-md animate-scale-in">
              <h3 className="text-2xl font-playfair font-semibold text-wedding-maroon mb-2">
                {selectedRitual.name}
              </h3>
              <p className="text-gray-700 mb-6">
                {selectedRitual.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                {rituals.map((ritual) => (
                  <button
                    key={ritual.id}
                    onClick={() => setSelectedRitual(ritual)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedRitual.id === ritual.id
                        ? "bg-wedding-red text-white"
                        : "bg-wedding-red/10 text-wedding-red hover:bg-wedding-red/20"
                    }`}
                  >
                    {ritual.name}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" className="border-wedding-red text-wedding-red hover:bg-wedding-red/10">
                  <Bookmark size={18} className="mr-2" />
                  Save to Planner
                </Button>
                {user ? (
                  <Button 
                    className="bg-wedding-red hover:bg-wedding-deepred text-white"
                    onClick={handleLearnMore}
                  >
                    Learn More
                    <ChevronRight size={18} className="ml-1" />
                  </Button>
                ) : (
                  <SignInDialog>
                    <Button className="bg-wedding-red hover:bg-wedding-deepred text-white">
                      Learn More
                      <ChevronRight size={18} className="ml-1" />
                    </Button>
                  </SignInDialog>
                )}
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src={selectedRitual.image} 
                alt={selectedRitual.name} 
                className="w-full h-80 md:h-96 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-2 text-white">
                  <Info size={18} />
                  <p className="text-sm">Click ritual names to learn more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-playfair font-semibold text-wedding-maroon text-center mb-8">
            More Wedding Traditions
          </h3>
          
          <Carousel className="w-full">
            <CarouselContent>
              {rituals.map((ritual) => (
                <CarouselItem key={ritual.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2 h-full">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                      <div className="h-48 relative">
                        <img 
                          src={ritual.image} 
                          alt={ritual.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h4 className="font-playfair font-semibold text-wedding-maroon text-lg mb-1">
                          {ritual.name}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {ritual.description}
                        </p>
                      </div>
                      <div className="p-4 pt-0">
                        {user ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-wedding-red text-wedding-red hover:bg-wedding-red/10"
                            onClick={() => handleViewDetails(ritual)}
                          >
                            View Details
                          </Button>
                        ) : (
                          <SignInDialog>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-wedding-red text-wedding-red hover:bg-wedding-red/10"
                            >
                              View Details
                            </Button>
                          </SignInDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 lg:-left-6" />
            <CarouselNext className="right-2 lg:-right-6" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default RitualGuide;
