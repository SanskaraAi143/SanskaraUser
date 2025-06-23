import React from 'react';
import { MessageSquare, BookOpen, Users, Bookmark, Palette, Calendar, FileCheck, Star } from 'lucide-react';

type Feature = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const features: Feature[] = [
	{
		icon: <MessageSquare size={28} className="text-white" />,
		title: 'AI Wedding Assistant',
		description:
			'Get instant guidance about rituals, customs, and planning steps from our intelligent AI assistant.',
	},
	{
		icon: <BookOpen size={28} className="text-white" />,
		title: 'Ritual Knowledge',
		description:
			'Learn about Hindu wedding rituals, their meaning, and how to incorporate them into your ceremony.',
	},
	{
		icon: <Users size={28} className="text-white" />,
		title: 'Vendor Recommendations',
		description:
			'Discover and connect with vendors who specialize in Hindu weddings in your area.',
	},
	{
		icon: <Bookmark size={28} className="text-white" />,
		title: 'Task Tracking',
		description:
			'Stay organized with a customized to-do list based on your wedding timeline and traditions.',
	},
	{
		icon: <Palette size={28} className="text-white" />,
		title: 'Mood Boards',
		description:
			'Create visual inspiration boards for colors, decorations, and outfits for your special day.',
	},
	{
		icon: <Calendar size={28} className="text-white" />,
		title: 'Timeline Creation',
		description:
			'Generate a personalized wedding timeline integrating all important rituals and events.',
	},
	{
		icon: <FileCheck size={28} className="text-white" />,
		title: 'Budget Management',
		description:
			'Track expenses and manage your budget with ceremony-specific recommendations.',
	},
	{
		icon: <Star size={28} className="text-white" />,
		title: 'Ceremony Customization',
		description:
			'Get suggestions on how to personalize traditions while respecting cultural significance.',
	},
];

import FeatureCard from '@/components/ui/FeatureCard'; // Import the new component

const Features: React.FC = () => {
	return (
		<section id="features" className="relative py-20 md:py-32 overflow-hidden">
			<div className="gradient-bg opacity-50" />
			<div className="container mx-auto px-4 relative z-10">
				<div className="glass-card p-8 md:p-12 mb-16 text-center max-w-3xl mx-auto">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-6">
						Everything You Need for Your
						<br />
						<span className="title-gradient">Dream Wedding</span>
					</h2>
					<p className="text-lg md:text-xl text-wedding-gold/90">
						From planning to execution, our AI-powered platform helps you create the perfect Hindu wedding celebration.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
					{features.map((feature, index) => (
						<FeatureCard
							key={index}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;
