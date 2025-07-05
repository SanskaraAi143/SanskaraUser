import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
	{
		question: 'What is Sanskara AI?',
		answer:
			'Sanskara AI is an AI-powered wedding planning platform designed to help you plan your perfect Hindu wedding. It offers personalized guidance, ritual explanations, vendor recommendations, and task management.',
	},
	{
		question: 'How can Sanskara AI help with Hindu wedding rituals?',
		answer:
			'Sanskara AI provides detailed information about various Hindu wedding rituals, their significance, and how to incorporate them into your ceremony. Our AI assistant can answer your specific questions about traditions.',
	},
	{
		question: 'Is Sanskara AI suitable for planning weddings outside of India?',
		answer:
			'While Sanskara AI has a strong focus on Indian traditions and vendors, its planning tools and AI guidance can be valuable for Hindu weddings anywhere in the world. We are continuously expanding our vendor network.',
	},
	{
		question: 'What are the key features of Sanskara AI?',
		answer:
			'Key features include an AI wedding assistant, ritual knowledge base, vendor recommendations, task tracking, mood boards, timeline creation, and budget management tools, all tailored for Hindu weddings.',
	},
	{
		question: 'How much does Sanskara AI cost?',
		answer:
			'Sanskara AI offers different plans, including a free tier to get you started. Please visit our Pricing page for detailed information on our premium features and plans.',
	},
];

const FAQPage: React.FC = () => {
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer,
			},
		})),
	};

	return (		<div className="min-h-screen flex flex-col">
			<Helmet>
				<title>FAQ - Sanskara AI Wedding Planner</title>
				<meta
					name="description"
					content="Find answers to frequently asked questions about Sanskara AI, your AI-powered Hindu wedding planning assistant."
				/>
				<link rel="canonical" href="https://sanskaraai.com/faq" />
				{/* Open Graph Tags */}
				<meta property="og:title" content="FAQ - Sanskara AI Wedding Planner" />
				<meta
					property="og:description"
					content="Find answers to frequently asked questions about Sanskara AI, your AI-powered Hindu wedding planning assistant."
				/>
				<meta property="og:url" content="https://sanskaraai.com/faq" />
				<meta property="og:type" content="website" />
				<meta property="og:image" content="https://sanskaraai.com/logo.jpeg" />
				{/* Twitter Card Tags */}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content="FAQ - Sanskara AI Wedding Planner" />
				<meta
					name="twitter:description"
					content="Find answers to frequently asked questions about Sanskara AI, your AI-powered Hindu wedding planning assistant."
				/>
				<meta name="twitter:image" content="https://sanskaraai.com/logo.jpeg" />
				<script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
			</Helmet>
			<header>
				<Navbar />
			</header>
			<main role="main" aria-label="FAQ content" className="flex-grow container mx-auto px-4 py-12 pt-20 md:pt-24 lg:pt-28">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-4xl md:text-5xl font-bold text-center mb-12 title-gradient">
						Frequently Asked Questions
					</h1>
					<Accordion type="single" collapsible className="w-full">
						{faqs.map((faq, index) => (
							<AccordionItem
								value={`item-${index}`}
								key={index}
								className="mb-4 border border-wedding-gold/20 rounded-lg shadow-sm glass-card p-2"
							>
								<AccordionTrigger
									as="h2"
									className="text-lg font-semibold px-6 py-4 text-left hover:opacity-80"
									style={{color: '#1a202c'}}
								>
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className="text-base px-6 pb-4 pt-2" style={{color: '#374151'}}>
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</main>
			<footer>
				<Footer />
			</footer>
		</div>
	);
};

export default FAQPage;
