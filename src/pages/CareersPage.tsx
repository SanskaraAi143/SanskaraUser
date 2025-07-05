import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Briefcase, Send, MapPin } from 'lucide-react';

const CareersPage = () => {
  const jobOpenings = [
    {
      title: 'Senior AI Engineer - Wedding Tech',
      location: 'Remote (India)',
      type: 'Full-time',
      description: 'Lead the development of our core AI planning engine, creating algorithms that personalize wedding experiences. Deep knowledge of NLP and recommendation systems required.',
    },
    {
      title: 'Full-Stack Product Engineer',
      location: 'Bangalore, India',
      type: 'Full-time',
      description: 'Build and scale our user-facing dashboard, focusing on a seamless, intuitive experience for couples planning their wedding. Expertise in React, Node.js, and TypeScript is a must.',
    },
    {
      title: 'UX/UI Designer - Luxury Brands',
      location: 'Remote',
      type: 'Contract',
      description: 'Design a premium, elegant, and intuitive user interface that reflects the luxury and spiritual significance of Hindu weddings. Experience with high-end brands is a plus.',
    },
     {
      title: 'Digital Marketing Manager - Wedding Industry',
      location: 'Mumbai, India',
      type: 'Full-time',
      description: 'Drive our growth through strategic online marketing campaigns targeting couples and vendors in the Indian wedding market. Proven experience in SEO, SEM, and social media is essential.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-wedding-gold/20 rounded-full mb-4">
              <Briefcase className="h-8 w-8 text-wedding-red" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-600">
              We're building the future of wedding planning. Be a part of our journey to blend tradition with technology.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Openings</h2>
            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-wedding-red">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 mb-3">
                    <span>{job.location}</span>
                    <span>&bull;</span>
                    <span>{job.type}</span>
                  </div>
                  <p className="text-gray-700">{job.description}</p>
                  <a href="mailto:admin@sanskaraai.com?subject=Application for ${job.title}" className="inline-block mt-4 bg-wedding-red text-white px-4 py-2 rounded-lg hover:bg-wedding-red/90 transition-colors">
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
