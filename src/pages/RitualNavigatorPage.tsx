import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const RitualNavigatorPage = () => {
  const [email, setEmail] = useState('');
  const [tradition, setTradition] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !tradition || !location || !date) {
      setError('Please fill out all fields to generate your personalized checklist.');
      return;
    }
    setError('');

    // Here you would typically send the data to your backend
    // For this sprint, we'll simulate a successful submission
    console.log({ email, tradition, location, date });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-wedding-cream/50">
      <Helmet>
        <title>Free Ritual Navigator - Sanskara AI</title>
        <meta name="description" content="Instantly map your entire Hindu wedding timeline. Get a free, personalized ritual and vendor checklist from Sanskara AI." />
      </Helmet>
      <Navbar isBetaNoticeVisible={false} />

      <main className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {isSubmitted ? (
              <div className="glass-card p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-3xl md:text-4xl font-playfair font-bold title-gradient mb-4">
                    Thank You!
                  </h2>
                  <p className="text-lg text-gray-700">
                    Your personalized Ritual & Vendor Checklist is being generated and will be sent to <strong>{email}</strong> shortly.
                  </p>
                  <p className="mt-6 text-gray-600">
                    Welcome to the Digital Mandap. Your journey to a stress-free wedding has just begun.
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="glass-card p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-2 title-gradient">
                  Instantly Map Your Entire Wedding Timeline
                </h1>
                <p className="text-lg text-gray-600 text-center mb-8">
                  Get a free, personalized Ritual & Vendor Checklist for your wedding.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="tradition" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Wedding Tradition
                    </label>
                    <Select onValueChange={setTradition} value={tradition}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="e.g., Gujarati, Punjabi, Tamil..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gujarati">Gujarati</SelectItem>
                        <SelectItem value="Punjabi">Punjabi</SelectItem>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                        <SelectItem value="Bengali">Bengali</SelectItem>
                        <SelectItem value="Telugu">Telugu</SelectItem>
                        <SelectItem value="Kannada">Kannada</SelectItem>
                        <SelectItem value="Malayali">Malayali</SelectItem>
                        <SelectItem value="Marathi">Marathi</SelectItem>
                        <SelectItem value="Marwari">Marwari</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Wedding Location (City)
                    </label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Mumbai"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Approximate Wedding Date
                    </label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email to receive the checklist"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <Button type="submit" className="w-full cta-button text-lg">
                    Generate My Free Checklist
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RitualNavigatorPage;
