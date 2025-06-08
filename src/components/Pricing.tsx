import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Crown, HelpCircle } from 'lucide-react';

const tiers = [
	{
		name: "Free",
		price: "₹0",
		description: "Get started with basic Hindu wedding planning",
		features: [
			"Basic AI chat assistance",
			"Essential Hindu ritual guides",
			"Limited vendor recommendations",
			"Basic to-do list",
			"Up to 3 saved items"
		],
		buttonText: "Start Free",
		buttonVariant: "outline",
		mostPopular: false
	},
	{
		name: "Premium",
		price: "₹999",
		period: "/month",
		description: "Complete planning for your perfect Hindu wedding",
		features: [
			"Advanced AI wedding assistant",
			"Detailed ritual consultation",
			"Unlimited vendor recommendations",
			"Custom wedding timeline",
			"Personalized to-do lists",
			"Unlimited mood boards",
			"Priority support"
		],
		buttonText: "Get Premium",
		buttonVariant: "default",
		mostPopular: true
	},
	{
		name: "One-time",
		price: "₹4,999",
		description: "Pay once for your entire wedding planning journey",
		features: [
			"Everything in Premium",
			"One-time payment (valid for 1 year)",
			"Downloadable wedding guides",
			"Video consultations with real planners",
			"Vendor negotiation assistance",
			"Invitation design templates"
		],
		buttonText: "Choose Plan",
		buttonVariant: "outline",
		mostPopular: false
	},
];

const Pricing = () => {
	return (
		<section id="pricing" className="relative py-20 md:py-32 overflow-hidden">
			<div className="gradient-bg opacity-50"></div>
			
			<div className="container mx-auto px-4 relative z-10">
				<div className="glass-card p-8 md:p-12 mb-16 text-center max-w-3xl mx-auto">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-6">
						Choose Your Perfect<br/>
						<span className="title-gradient">Wedding Plan</span>
					</h2>
					<p className="text-lg md:text-xl text-gray-700">
						Select the plan that best suits your needs and start planning your dream Hindu wedding today.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{tiers.map((tier) => (
						<div
							key={tier.name}
							className={`glass-card p-8 relative flex flex-col ${
								tier.mostPopular ? 'ring-2 ring-wedding-gold shadow-2xl' : ''
							}`}
						>
							{tier.mostPopular && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
									<div className="bg-gradient-primary text-white px-8 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-2">
										<Crown size={16} />
										Most Popular
									</div>
								</div>
							)}

							<div className="mb-8">
								<h3 className="text-2xl font-playfair font-bold title-gradient mb-2">
									{tier.name}
								</h3>
								<div className="flex items-baseline gap-1 mb-4">
									<span className="text-4xl font-bold text-wedding-brown">{tier.price}</span>
									{tier.period && (
										<span className="text-wedding-brown/60">{tier.period}</span>
									)}
								</div>
								<p className="text-wedding-brown/80">{tier.description}</p>
							</div>

							<ul className="space-y-4 mb-8 flex-grow">
								{tier.features.map((feature) => (
									<li key={feature} className="flex items-start gap-3">
										<Check className="h-5 w-5 text-wedding-gold flex-shrink-0 mt-0.5" />
										<span className="text-wedding-brown/90">{feature}</span>
									</li>
								))}
							</ul>

							<Button
								className={`w-full ${
									tier.buttonVariant === 'outline'
										? 'nav-link'
										: tier.mostPopular
										? 'cta-button'
										: 'bg-gradient-glass hover:bg-wedding-gold/10 text-wedding-brown'
								}`}
							>
								{tier.buttonText}
							</Button>
						</div>
					))}
				</div>

				<div className="mt-16 glass-card p-6 flex items-center justify-between max-w-2xl mx-auto">
					<div className="flex items-center gap-3">
						<HelpCircle className="h-5 w-5 text-wedding-gold" />
						<p className="text-wedding-brown/80">Need help choosing a plan?</p>
					</div>
					<Button variant="ghost" className="nav-link">Talk to an Expert</Button>
				</div>
			</div>
		</section>
	);
};

export default Pricing;
