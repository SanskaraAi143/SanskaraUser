
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, Share2, Heart, X, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

type MoodboardImage = {
  id: string;
  url: string;
  caption: string;
  category: string;
};

const MoodBoard = () => {
  const [selectedTab, setSelectedTab] = useState("decorations");
  const { toast } = useToast();
  
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([
    { 
      id: '1', 
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a', 
      caption: 'Elegant mandap with floral decor', 
      category: 'decorations' 
    },
    { 
      id: '2', 
      url: 'https://images.unsplash.com/photo-1600578248539-48bdb9db48f2', 
      caption: 'Traditional ceremony setup',
      category: 'decorations' 
    },
    { 
      id: '3', 
      url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8', 
      caption: 'Elegant reception table settings',
      category: 'decorations' 
    },
    { 
      id: '4', 
      url: 'https://images.unsplash.com/photo-1599033769078-74a669fb4710', 
      caption: 'Intricate mehndi design',
      category: 'bride' 
    },
    { 
      id: '5', 
      url: 'https://images.unsplash.com/photo-1622556498246-755f44ca76f3', 
      caption: 'Colorful bridal lehenga',
      category: 'bride' 
    }
  ]);
  
  const handleRemoveImage = (id: string) => {
    setMoodboardImages(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Image removed",
      description: "The image has been removed from your mood board."
    });
  };
  
  const handleAddImage = () => {
    // In a real app, this would open a file picker or URL input
    toast({
      title: "Feature coming soon",
      description: "Image upload functionality will be available soon."
    });
  };

  // Filter images by the selected category
  const filteredImages = moodboardImages.filter(img => img.category === selectedTab);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle>Wedding Mood Board</CardTitle>
          <CardDescription>Visualize your wedding aesthetic</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="decorations" value={selectedTab} onValueChange={setSelectedTab} className="mt-6">
          <div className="px-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="decorations">Decorations</TabsTrigger>
              <TabsTrigger value="bride">Bride</TabsTrigger>
              <TabsTrigger value="groom">Groom</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="decorations" className="pt-4">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.length > 0 ? (
                filteredImages.map(image => (
                  <div key={image.id} className="relative group rounded-lg overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.caption} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 text-white self-end"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <X size={18} />
                      </Button>
                      <div></div>
                      <p className="text-white text-sm">{image.caption}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-8 text-gray-500">
                  No images added to this category yet.
                </div>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border-2 border-dashed rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Plus size={24} className="mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Add image</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to your mood board</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Button className="w-full" onClick={handleAddImage}>
                      <Upload size={18} className="mr-2" />
                      Upload from device
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Plus size={18} className="mr-2" />
                      Add from gallery
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="bride" className="pt-4">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.length > 0 ? (
                filteredImages.map(image => (
                  <div key={image.id} className="relative group rounded-lg overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.caption} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-1 right-1 text-white self-end"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <X size={18} />
                      </Button>
                      <div></div>
                      <p className="text-white text-sm">{image.caption}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-8 text-gray-500">
                  No images added to this category yet.
                </div>
              )}
              
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border-2 border-dashed rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Plus size={24} className="mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Add image</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to your mood board</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Button className="w-full" onClick={handleAddImage}>
                      <Upload size={18} className="mr-2" />
                      Upload from device
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Plus size={18} className="mr-2" />
                      Add from gallery
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="groom" className="pt-4">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-full text-center p-8 text-gray-500">
                No images added to this category yet.
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border-2 border-dashed rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Plus size={24} className="mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Add image</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to your mood board</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Button className="w-full" onClick={handleAddImage}>
                      <Upload size={18} className="mr-2" />
                      Upload from device
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Plus size={18} className="mr-2" />
                      Add from gallery
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="border-t bg-gray-50/80 justify-between p-4">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 size={16} className="mr-1" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MoodBoard;
