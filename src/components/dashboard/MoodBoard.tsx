
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, Share2, X, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { MoodboardImage, getMoodboardImages, uploadMoodboardImage, deleteMoodboardImage } from '@/services/api/moodboardApi';
import { Loader2 } from 'lucide-react';

const MoodBoard = () => {
  const [selectedTab, setSelectedTab] = useState("decorations");
  const { toast } = useToast();
  const [moodboardImages, setMoodboardImages] = useState<MoodboardImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Fetch mood board images when tab changes
  useEffect(() => {
    fetchImages();
  }, [selectedTab]);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      const images = await getMoodboardImages(selectedTab);
      setMoodboardImages(images);
    } catch (error) {
      console.error('Error fetching moodboard images:', error);
      toast({
        title: "Error fetching images",
        description: "There was a problem loading your mood board images.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveImage = async (id: string) => {
    try {
      const success = await deleteMoodboardImage(id);
      if (success) {
        setMoodboardImages(prev => prev.filter(img => img.id !== id));
        toast({
          title: "Image removed",
          description: "The image has been removed from your mood board."
        });
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error removing image",
        description: "There was a problem removing the image.",
        variant: "destructive"
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };
  
  const handleUploadImage = async () => {
    if (!uploadFile || !uploadCaption) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a caption.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      const newImage = await uploadMoodboardImage(uploadFile, selectedTab, uploadCaption);
      setMoodboardImages(prev => [...prev, newImage]);
      setUploadFile(null);
      setUploadCaption('');
      toast({
        title: "Image uploaded",
        description: "Your image has been added to the mood board."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Filter images by the selected category (handled by the API now)
  const filteredImages = moodboardImages;

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
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-wedding-red" />
                </div>
              ) : filteredImages.length > 0 ? (
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Caption</label>
                      <input 
                        type="text" 
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Describe this image"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleUploadImage}
                      disabled={uploading || !uploadFile || !uploadCaption}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="bride" className="pt-4">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-wedding-red" />
                </div>
              ) : filteredImages.length > 0 ? (
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Caption</label>
                      <input 
                        type="text" 
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Describe this image"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleUploadImage}
                      disabled={uploading || !uploadFile || !uploadCaption}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="groom" className="pt-4">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-wedding-red" />
                </div>
              ) : filteredImages.length > 0 ? (
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
                    <div>
                      <label className="block text-sm font-medium mb-1">Upload Image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Caption</label>
                      <input 
                        type="text" 
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        className="w-full border rounded p-2"
                        placeholder="Describe this image"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleUploadImage}
                      disabled={uploading || !uploadFile || !uploadCaption}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="mr-2" />
                          Upload Image
                        </>
                      )}
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
