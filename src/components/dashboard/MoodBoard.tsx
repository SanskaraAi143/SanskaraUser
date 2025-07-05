import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import ImageUpload from './ImageUpload';
import { uploadMoodboardImage } from '@/services/api/storageApi';
import { Plus, Download, Share2, Heart, X, Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

import { useAuth } from '@/context/AuthContext';
import { getMoodBoardItems, addMoodBoardItem, removeMoodBoardItem, deleteMoodBoard } from '@/services/api/moodboardApi';

import { getUserMoodBoards, createMoodBoard } from '@/services/api/boardApi';

const MoodBoard = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<any>(null);

  const handleOpenImageModal = (image: any) => {
    setModalImage(image);
    setImageModalOpen(true);
  };
  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setModalImage(null);
  };

  const handleExportImages = async () => {
    if (!moodBoardItems.length) return;
    const zip = new JSZip();
    const folder = zip.folder('moodboard-images');
    await Promise.all(
      moodBoardItems.map(async (item) => {
        try {
          const response = await fetch(item.image_url);
          const blob = await response.blob();
          const ext = item.image_url.split('.').pop()?.split('?')[0] || 'jpg';
          folder?.file(`${item.note || 'image'}-${item.item_id}.${ext}`, blob);
        } catch {}
      })
    );
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'moodboard-images.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  };


  const [moodBoards, setMoodBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Helper: Delete mood board
  const handleDeleteMoodBoard = async (mood_board_id: string) => {
    if (!window.confirm('Delete this mood board and all its images?')) return;
    try {
      await deleteMoodBoard(mood_board_id);
      setMoodBoards(prev => prev.filter(b => b.mood_board_id !== mood_board_id));
      if (selectedBoardId === mood_board_id) setSelectedBoardId(null);
      toast({ title: 'Mood board deleted', description: 'The mood board and all its images have been deleted.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete mood board.' });
    }
  };

  const [creatingBoard, setCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const [moodBoardItems, setMoodBoardItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        if (!user?.id) return;
        getUserMoodBoards(user.id)
          .then(boards => {
            // Add default boards (Collections, Bride, Groom) if not present
            const allBoards = [...boards];
            setMoodBoards(allBoards);
            if (allBoards.length > 0) setSelectedBoardId(allBoards[0].mood_board_id);
          })
          .catch(() => toast({ variant: 'destructive', title: 'Error', description: 'Failed to load mood boards.' }));
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, toast]);

  useEffect(() => {
    if (!selectedBoardId) {
      setMoodBoardItems([]);
      return;
    }
    setMoodBoardItems([]); // Always clear previous images before loading
    setLoading(true);
    getMoodBoardItems(selectedBoardId)
      .then(items => setMoodBoardItems(items))
      .catch(() => {
        setMoodBoardItems([]);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load mood board items.' });
      })
      .finally(() => setLoading(false));
  }, [selectedBoardId, toast]);

  const handleRemoveImage = async (id: string) => {
    try {
      await removeMoodBoardItem(id);
      setMoodBoardItems(prev => prev.filter(item => item.item_id !== id));
      toast({
        title: "Image removed",
        description: "The image has been removed from your mood board."
      });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove image.' });
    }
  };
  
  const handleCreateMoodBoard = async () => {
    if (!user?.id || !newBoardName.trim()) return;
    setCreatingBoard(true);
    try {
      const board = await createMoodBoard(user.id, newBoardName.trim());
      setMoodBoards(prev => [...prev, board]);
      setSelectedBoardId(board.mood_board_id);
      setNewBoardName('');
      toast({ title: 'Mood Board Created', description: `Mood board '${board.name}' created.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create mood board.' });
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleAddImage = async () => {
    if (!selectedBoardId) return;
    const demoUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb';
    const note = 'New inspiration image';
    const category = '';
    try {
      await addMoodBoardItem(selectedBoardId, demoUrl, note, category);
      const items = await getMoodBoardItems(selectedBoardId);
      setMoodBoardItems(items);
      toast({ title: 'Image added', description: 'New image added to your mood board.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add image.' });
    }
  };


  // Filter images by the selected category
  const filteredItems = moodBoardItems; // No category filtering, show all for selected board
  const selectedBoard = moodBoards.find(b => b.mood_board_id === selectedBoardId);


  return (
    <div className="space-y-8">
      <Card className="glass-card shadow-2xl border-0 bg-gradient-to-br from-wedding-cream/90 via-white/80 to-wedding-gold/30 p-0">
        <CardHeader className="pb-0 bg-gradient-to-r from-wedding-cream/80 to-wedding-gold/20 rounded-t-2xl border-b border-wedding-gold/20">
          <CardTitle className="font-playfair text-3xl md:text-4xl text-wedding-gold drop-shadow-lg tracking-tight">Wedding Mood Board</CardTitle>
          <CardDescription className="text-lg text-yellow-900/80">Visualize your wedding aesthetic</CardDescription>
        </CardHeader>
        <div className="px-8 pt-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col gap-2 w-full md:w-80">
            <div className="flex gap-2 items-center">
              <Select value={selectedBoardId || ''} onValueChange={setSelectedBoardId}>
                <SelectTrigger className="w-full bg-white/80 border-wedding-gold/30 shadow-sm focus:ring-wedding-gold">
                  <SelectValue placeholder="Select Mood Board" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 border-wedding-gold/30">
                  {moodBoards.map(board => (
                    <div key={board.mood_board_id} className="flex items-center justify-between pr-2">
                      <SelectItem value={board.mood_board_id} className="flex-1">
                        {board.name}
                      </SelectItem>
                      {board.mood_board_id !== 'default-collections' && board.mood_board_id !== 'default-bride' && board.mood_board_id !== 'default-groom' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 text-red-500"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteMoodBoard(board.mood_board_id);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-wedding-gold text-white font-semibold shadow-md hover:bg-wedding-secondaryGold transition" onClick={() => setCreatingBoard(true)}>+ New</Button>
            </div>
            {creatingBoard && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="border border-wedding-gold/40 rounded px-2 py-1 flex-1 bg-white/80 focus:ring-wedding-gold"
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  placeholder="Mood board name"
                  autoFocus
                />
                <Button size="sm" className="bg-wedding-gold text-white font-semibold" onClick={handleCreateMoodBoard} disabled={!newBoardName.trim()}>Create</Button>
                <Button size="sm" variant="outline" onClick={() => { setCreatingBoard(false); setNewBoardName(''); }}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center p-8 text-yellow-900/60">Loading...</div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(image => (
                <div key={image.item_id} className="relative group rounded-2xl overflow-hidden cursor-pointer glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" onClick={() => handleOpenImageModal(image)}>
                  <img 
                    src={image.image_url} 
                    alt={image.note || 'Moodboard image'}
                    className="w-full aspect-square object-cover bg-white rounded-2xl shadow-md transition-transform"
                    style={{ maxHeight: 260 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wedding-gold/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/60"
                      onClick={e => { e.stopPropagation(); handleRemoveImage(image.item_id); }}
                    >
                      <X size={18} />
                    </Button>
                    <div></div>
                    <p className="text-white text-base font-medium drop-shadow-lg">{image.note}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-8 text-yellow-900/60">
                No images added to this mood board yet.
              </div>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <div className="border-2 border-dashed border-wedding-gold/40 rounded-2xl h-48 flex items-center justify-center cursor-pointer hover:bg-wedding-gold/10 transition-colors mt-6">
                <div className="text-center">
                  <Plus size={32} className="mx-auto text-wedding-gold" />
                  <p className="text-base text-yellow-900/80 mt-2 font-medium">Add image</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-white/90 rounded-2xl shadow-2xl border-0">
              <DialogHeader>
                <DialogTitle className="text-wedding-gold font-playfair text-2xl">Add to your mood board</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <ImageUpload onUpload={async (file, previewUrl, tag) => {
                  if (!selectedBoardId) return;
                  setUploading(true);
                  try {
                    const url = await uploadMoodboardImage(user.id, file);
                    await addMoodBoardItem(selectedBoardId, url, tag || 'New inspiration image', '');
                    const items = await getMoodBoardItems(selectedBoardId);
                    setMoodBoardItems(items);
                    toast({ title: 'Image added', description: 'New image added to your mood board.' });
                  } catch (e) {
                    const items = await getMoodBoardItems(selectedBoardId);
                    setMoodBoardItems(items);
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to upload image, but we refreshed your board.' });
                  } finally {
                    setUploading(false);
                  }
                }} />
                {uploading && <div className="text-center text-yellow-900/60">Uploading...</div>}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardFooter className="border-t-2 border-wedding-gold/20 bg-gradient-to-r from-wedding-cream/60 to-wedding-gold/10 justify-between p-6 rounded-b-2xl">
          <Button variant="outline" size="sm" className="border-wedding-gold/40 text-wedding-gold font-semibold hover:bg-wedding-gold/10" onClick={handleExportImages}>
            <Download size={16} className="mr-1" />
            Export
          </Button>
        </CardFooter>
        {imageModalOpen && modalImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={handleCloseImageModal}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-full max-h-full flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-700 hover:text-black" onClick={handleCloseImageModal}><X size={28} /></button>
              <img src={modalImage.image_url} alt={modalImage.note} className="max-w-[90vw] max-h-[70vh] object-contain rounded-xl mb-4 shadow-lg" />
              <div className="text-xl font-playfair text-wedding-gold text-center mb-2">{modalImage.note}</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MoodBoard;
