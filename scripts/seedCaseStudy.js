const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CaseStudy = require('../models/CaseStudy');

const demoCaseStudy = {
  title: 'NuEgo',
  client: 'NuEgo',
  clientLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=80&fit=crop',
  industry: 'Automotive & Mobility',
  platform: 'Platform',
  duration: '6 months',
  projectFocus: ['Mobile App + Community'],
  services: ['User Research', 'UX Strategy', 'UI Design'],
  heroImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1440&h=600&fit=crop',
  bannerImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1440&h=537&fit=crop',
  collaborationTitle: 'The Collaboration',
  collaborationText: `Lorem ipsum dolor sit amet consectetur. Vulputate auctor faucibus sit aliquam eget fames pulvinar consequat. Facilisis lacus etiam duis magna ut egestas felis.

Lorem eu at cursus faucibus mattis pulvinar purus. Eget condimentum amet`,
  challenge: `Lorem ipsum dolor sit amet consectetur. Vulputate auctor faucibus sit aliquam eget fames pulvinar consequat. Facilisis lacus etiam duis magna ut egestas felis. Lorem eu at cursus faucibus mattis pulvinar purus. Eget condimentum amet senectus amet tortor.

Lorem ipsum dolor sit amet consectetur. Vulputate auctor faucibus sit aliquam eget fames pulvinar consequat.`,
  solution: `Our team developed a comprehensive mobile application that addressed all the key pain points identified during the discovery phase. We implemented a user-centric design approach that prioritized ease of use and accessibility.

The solution included real-time tracking, seamless payment integration, and a community feature that allowed users to connect and share their experiences.`,
  results: `The redesigned platform achieved significant improvements across all key metrics. User engagement increased by 45%, and the average session duration grew by 60%.

Customer satisfaction scores improved from 3.2 to 4.7 out of 5, and the app store rating increased to 4.8 stars with over 10,000 reviews.`,
  processSteps: [
    { number: '01', title: 'Discovery Workshop & Research' },
    { number: '02', title: 'UX Strategy Roadmap' },
    { number: '03', title: 'Key Page Wireframes' },
    { number: '04', title: 'Visual Explorations & Designs' },
    { number: '05', title: 'Tokenised Design System' },
    { number: '06', title: 'Communication Design' },
    { number: '07', title: 'Finalisation & Handover' },
  ],
  opportunities: [
    {
      number: '01',
      title: 'Trust-building UI elements',
      description: 'Prominent route information, electric fleet highlights, cancellation policies, and customer support accessibility embedded within the flow',
    },
    {
      number: '02',
      title: 'Fast and Intuitive Research',
      description: 'Lorem ipsum dolor sit amet consectetur. Vitae felis sit sagittis dui tortor non faucibus purus ac. Vestibulum malesuada laoreet mauris neque in ullamcorper.',
    },
    {
      number: '03',
      title: 'Multi-Modal Support',
      description: 'Prominent route information, electric fleet highlights, cancellation policies, and customer support accessibility embedded within the flow',
    },
  ],
  experienceTitle: 'The Experience We Created',
  experienceImages: [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=720&h=700&fit=crop',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=720&h=700&fit=crop',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1440&h=690&fit=crop',
  ],
  experienceQuote: "The Nuego design system didn't just define the present experience — it became the blueprint for how Nuego's digital touchpoints will evolve seamlessly in the future.",
  colorPalette: [
    { color: '#fff56f', name: 'Primary Yellow' },
    { color: '#f7d2b4', name: 'Soft Peach' },
    { color: '#00bfaf', name: 'Teal' },
    { color: '#1e1e27', name: 'Dark' },
  ],
  typography: {
    fontFamily: 'Ubuntu',
    fontImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1440&h=603&fit=crop',
    characterSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  },
  metrics: [
    { value: '+45%', label: 'AOV (Average Order Value)' },
    { value: '+24%', label: 'CTR (Click-through rate)' },
    { value: '+16%', label: 'Return-rate per customer' },
  ],
  images: [
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1440&h=700&fit=crop',
  ],
  testimonial: {
    quote: `Lorem ipsum dolor sit amet consectetur. Ullamcorper amet arcu quis elementum. Convallis purus mauris at in.

Pretium pharetra aliquam consequat duis ac risus vitae sollicitudin pharetra.`,
    author: 'Reema Roy',
    position: '(Head of Marketing, NuEgo)',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=153&h=152&fit=crop',
  },
  technologies: ['React Native', 'Node.js', 'MongoDB', 'AWS'],
  published: true,
  order: 1,
};

const seedCaseStudy = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if case study already exists
    const existing = await CaseStudy.findOne({ title: demoCaseStudy.title });

    if (existing) {
      console.log('Demo case study already exists. Updating...');
      await CaseStudy.findByIdAndUpdate(existing._id, demoCaseStudy);
      console.log('Demo case study updated successfully!');
    } else {
      await CaseStudy.create(demoCaseStudy);
      console.log('Demo case study created successfully!');
    }

    console.log('Slug: nuego');
    console.log('View at: /case-studies/nuego');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding case study:', error);
    process.exit(1);
  }
};

seedCaseStudy();
