import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Send, Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-wedding-gold/20 rounded-full mb-4">
              <Send className="h-8 w-8 text-wedding-red" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600">
              We'd love to hear from you. Whether you have a question about our services, partnerships, or anything else, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-wedding-red" />
                  <a href="mailto:admin@sanskaraai.com" className="text-gray-700 hover:text-wedding-red">admin@sanskaraai.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-wedding-red" />
                  <a href="tel:+918639468919" className="text-gray-700 hover:text-wedding-red">+91 86394 68919</a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-wedding-red" />
                  <p className="text-gray-700">Hyderabad, India</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h2>
              <form>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name</label>
                  <input type="text" id="name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wedding-red" />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input type="email" id="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wedding-red" />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">Message</label>
                  <textarea id="message" name="message" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-wedding-red"></textarea>
                </div>
                <button type="submit" className="w-full bg-wedding-red text-white px-4 py-2 rounded-lg hover:bg-wedding-red/90 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
