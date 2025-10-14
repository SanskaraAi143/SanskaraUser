/// <reference types="google.maps" />
"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import { Camera, Shirt, Building, Wand2, PartyPopper, RotateCcw, Download, Info, MessageSquareQuote } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader } from '@googlemaps/js-api-loader';

import ImageUploadCard from './ImageUploadCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
const formSchema = z.object({
  venueName: z.string().min(1, "Please select a venue."),
  venuePhotoUrl: z.string().min(1, "Please select a venue image."),
  customInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VenuePhoto {
  photo_url: string;
}

export default function VirtualTryOn() {
  const [userPhotoDataUri, setUserPhotoDataUri] = useState<string | null>(null);
  const [outfitPhotoDataUri, setOutfitPhotoDataUri] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [fetchedVenuePhotos, setFetchedVenuePhotos] = useState<{ data_uri: string }[]>([]); // Now expects data_uri
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null); // Still needed for place_id
  const venueInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [isFetchingVenuePhotos, setIsFetchingVenuePhotos] = useState(false); // New loading state for venue photos
  const [isGeneratingVisualization, setIsGeneratingVisualization] = useState(false); // New loading state for visualization

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { venueName: '', venuePhotoUrl: '', customInstructions: '' },
  });

  const selectedVenuePhotoUrl = form.watch('venuePhotoUrl');

  // Load Google Maps API (remains the same)
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (venueInputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(venueInputRef.current, {
          types: ['establishment'],
          fields: ['name', 'place_id'], // Only need name and place_id
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.name && place.place_id) {
            setSelectedPlace(place);
            form.setValue('venueName', place.name);
            form.setValue('venuePhotoUrl', ''); // Clear previous selection
            // Fetch photos from our backend
            fetchVenuePhotos(place.place_id);
          }
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New function to fetch venue photos from our backend
  const fetchVenuePhotos = async (placeId: string) => {
    setIsFetchingVenuePhotos(true); // Start loading
    try {
      const response = await fetch(`http://localhost:8765/api/venue-photos?place_id=${placeId}`);
      const data = await response.json();
      if (data.success && data.photos) {
        setFetchedVenuePhotos(data.photos);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to fetch venue photos from backend.' });
      }
    } catch (e) {
      const error = e as Error;
      toast({ variant: 'destructive', title: 'Error', description: `An unexpected error occurred while fetching venue photos: ${error.message}` });
    } finally {
      setIsFetchingVenuePhotos(false); // End loading
    }
  };

  const onSubmit = (data: FormValues) => {
    if (!userPhotoDataUri) {
      toast({ variant: 'destructive', title: 'Missing Photo', description: 'Please upload a photo of yourself.' });
      return;
    }
    if (!outfitPhotoDataUri) {
      toast({ variant: 'destructive', title: 'Missing Outfit', description: 'Please upload a photo of the outfit.' });
      return;
    }

    setGeneratedImage(null); // Clear previous generated image before new generation

    startTransition(() => { // Removed 'async' here
      (async () => { // Wrapped in a self-executing async function
        setIsGeneratingVisualization(true); // Start visualization loading
        try {
          const result = await fetch('http://localhost:8765/api/generate-visualization', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              venueName: data.venueName,
              specificArea: data.venuePhotoUrl, // This will now be a data URI from our backend
              userPhotoDataUri,
              outfitPhotoDataUri,
              customInstructions: data.customInstructions,
            }),
          }).then(res => res.json());
    
          if (result.success && result.image) {
            setGeneratedImage(result.image);
            toast({ title: 'Success!', description: 'Your virtual try-on is ready.', duration: 5000 });
          } else {
            // Do not clear input state on error, only show toast
            toast({ variant: 'destructive', title: 'Generation Failed', description: result.error || 'An unknown error occurred.' });
          }
        } catch (e) {
          const error = e as Error;
          // Do not clear input state on error, only show toast
          toast({ variant: 'destructive', title: 'Error', description: `An unexpected error occurred. ${error.message}` });
        } finally {
          setIsGeneratingVisualization(false); // End visualization loading
        }
      })();
    });
  };
  
  const handleReset = () => {
    setUserPhotoDataUri(null);
    setOutfitPhotoDataUri(null);
    setGeneratedImage(null);
    setFetchedVenuePhotos([]);
    setSelectedPlace(null);
    if(venueInputRef.current) venueInputRef.current.value = "";
    form.reset();
    setResetKey(prev => prev + 1);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'sanskara-ai-visualization.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const showForm = !isPending && !generatedImage && !isGeneratingVisualization;

  return (
    <Card className="max-w-5xl mx-auto shadow-lg rounded-3xl bg-[#FFFBF3] p-4 sm:p-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl font-headline text-foreground">Visualize Your Perfect Look</CardTitle>
        <CardDescription className="text-base md:text-lg text-muted-foreground">
          {showForm ? 'Upload your photo, pick an outfit and a venue, and let our AI create your special moment.' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 md:px-6 pb-6">
        {showForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold text-foreground">Pro Tips for Best Results!</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><b>Your Photo:</b> Use a clear, full-body shot. Good lighting and a simple background work best.</li>
                    <li><b>The Outfit:</b> Upload a photo where the outfit is clearly visible, like on a mannequin or a flat surface.</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div key={resetKey} className="grid md:grid-cols-2 gap-8">
                <ImageUploadCard
                  id="user-photo"
                  title="Your Photo"
                  description="A clear, full-body picture."
                  icon={<Camera className="w-12 h-12 text-primary" />}
                  onImageChange={setUserPhotoDataUri}
                  disabled={isPending}
                />
                <ImageUploadCard
                  id="outfit-photo"
                  title="The Outfit"
                  description="The attire you want to try on."
                  icon={<Shirt className="w-12 h-12 text-primary" />}
                  onImageChange={setOutfitPhotoDataUri}
                  disabled={isPending}
                />
              </div>

              <div className="grid md:grid-cols-1 gap-8 items-start">
                  <FormItem>
                    <FormLabel className="font-sans font-bold text-foreground flex items-center gap-2">
                      <Building className="w-5 h-5" /> Search for a Venue
                    </FormLabel>
                    <FormControl>
                        <Input
                          ref={venueInputRef}
                          placeholder="Type a venue name..."
                          className="bg-white"
                          disabled={isPending || isFetchingVenuePhotos}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>

                  {fetchedVenuePhotos.length > 0 && (
                     <FormField
                        control={form.control}
                        name="venuePhotoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sans font-bold text-foreground flex items-center gap-2">
                              <PartyPopper className="w-5 h-5" /> Select a Venue Image
                            </FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {isFetchingVenuePhotos ? (
                                  <>
                                    <Skeleton className="aspect-video w-full rounded-lg" />
                                    <Skeleton className="aspect-video w-full rounded-lg" />
                                    <Skeleton className="aspect-video w-full rounded-lg" />
                                    <Skeleton className="aspect-video w-full rounded-lg" />
                                  </>
                                ) : (
                                  fetchedVenuePhotos.slice(0, 4).map((photo, i) => {
                                    const dataUri = photo.data_uri; // Use data_uri from backend
                                    return (
                                      <div
                                        key={i}
                                        onClick={() => field.onChange(dataUri)}
                                        className={cn(
                                          "relative aspect-video rounded-lg overflow-hidden cursor-pointer border-4 transition-all",
                                          field.value === dataUri ? 'border-primary' : 'border-transparent hover:border-primary/50'
                                        )}
                                        aria-disabled={isPending || isFetchingVenuePhotos}
                                      >
                                        <img src={dataUri} alt={`Venue photo ${i+1}`} style={{objectFit: 'cover'}} />
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}
              </div>
              
              <FormField
                control={form.control}
                name="customInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-sans font-bold text-foreground flex items-center gap-2">
                      <MessageSquareQuote className="w-5 h-5" /> Add Custom Instructions (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Make the dress floor-length.' or 'Place me near the window.'"
                        className="resize-none bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-center p-0 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending || isGeneratingVisualization || isFetchingVenuePhotos}
                  className="w-full md:w-auto font-sans font-bold text-white rounded-xl hover:bg-primary/90 bg-[#FFC107]"
                >
                  {isGeneratingVisualization ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      Visualize Now
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
        
        {(isPending || isGeneratingVisualization) && (
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-headline text-primary">Creating your vision...</h3>
            <p className="text-muted-foreground">This may take a moment. Please be patient.</p>
            <Skeleton className="aspect-video w-full max-w-2xl mx-auto rounded-lg" />
          </div>
        )}

        {generatedImage && !isPending && (
          <div className="text-center space-y-6">
             <h3 className="text-3xl font-headline text-primary">Your Vision, Realized!</h3>
            <div className="relative aspect-square w-full max-w-lg mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-primary/50">
              <img src={generatedImage} alt="Generated outfit visualization" style={{objectFit: 'contain'}} />
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <Button onClick={handleDownload} size="lg" className="font-sans font-bold text-white rounded-xl hover:bg-primary/90 bg-[#FFC107]">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
