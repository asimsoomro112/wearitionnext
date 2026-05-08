import React from 'react';

export function AdminAnalytics() {
  return (
    <div className="max-w-full">
      <h1 className="text-2xl md:text-3xl font-serif mb-8 pb-6 border-b border-black/10">Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-black/10 p-6 rounded-lg h-80 flex flex-col items-center justify-center text-black/40 text-sm">
          <p>Sales over time chart</p>
          <p className="text-xs uppercase tracking-widest mt-2">(Placeholder)</p>
        </div>
        <div className="bg-white border border-black/10 p-6 rounded-lg h-80 flex flex-col items-center justify-center text-black/40 text-sm">
          <p>Traffic sources chart</p>
          <p className="text-xs uppercase tracking-widest mt-2">(Placeholder)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-black/10 p-6 rounded-lg">
           <p className="text-sm text-black/60 mb-2">Bounce Rate</p>
           <p className="text-3xl font-mono">42.5%</p>
           <p className="text-xs text-red-500 mt-2">+2.4% from last week</p>
         </div>
         <div className="bg-white border border-black/10 p-6 rounded-lg">
           <p className="text-sm text-black/60 mb-2">Conversion Rate</p>
           <p className="text-3xl font-mono">3.8%</p>
           <p className="text-xs text-green-500 mt-2">+0.5% from last week</p>
         </div>
         <div className="bg-white border border-black/10 p-6 rounded-lg">
           <p className="text-sm text-black/60 mb-2">Avg Session Duration</p>
           <p className="text-3xl font-mono">4m 12s</p>
           <p className="text-xs text-green-500 mt-2">+15s from last week</p>
         </div>
      </div>
    </div>
  );
}
