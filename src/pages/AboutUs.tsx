import React from 'react';
import { ShieldCheck } from 'lucide-react';

const AboutUs: React.FC = () => (
  <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center text-center space-y-8">
    <div className="flex flex-col items-center">
      <span className="inline-flex items-center justify-center bg-yellow-100 rounded-full p-4 mb-4">
        <ShieldCheck className="h-12 w-12 text-yellow-500" />
      </span>
      <h1 className="text-3xl font-bold mb-2">About NewsTrust</h1>
    </div>
    <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
      <strong>NewsTrust</strong> is a modern web application dedicated to helping users verify the credibility of news articles in real time. Our platform aggregates news from multiple sources, leverages AI-powered verification, and empowers the community to vote and discuss the authenticity of news stories.
    </p>
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-1">Our Goal</h2>
      <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
        Our mission is to combat misinformation by providing a transparent, community-driven platform for news verification. We aim to make it easy for everyone to access reliable information, participate in fact-checking, and build a more informed society.
      </p>
    </div>
    <div className="flex flex-col items-center mt-8">
      {/* Placeholder for video or logo */}
      <span className="inline-flex items-center justify-center bg-blue-100 rounded-full p-6 mb-2">
        <ShieldCheck className="h-16 w-16 text-blue-600" />
      </span>
      <span className="text-gray-500 text-sm">(Intro video coming soon)</span>
    </div>
  </div>
);

export default AboutUs; 