"use client";

import ClientOnly from "@/components/ClientOnly";

export default function BackgroundBlobs() {
  return (
    <ClientOnly>
      <div className="absolute top-0 left-0 right-0 h-screen pointer-events-none overflow-hidden">
       <div 
         className="absolute top-20 -right-72 w-96 h-96 rounded-full opacity-100"
         style={{
           background: 'radial-gradient(circle, #FDDA24 0%, #FEEF9F 100%, transparent 90%)',
           filter: 'blur(80px)',
           transform: 'scale(1.2)'
         }}
       />
      
       <div 
         className="absolute top-40 left-1/4 w-80 h-80 rounded-full opacity-100"
         style={{
           background: 'radial-gradient(circle, #FDDA24 0%, #FEEF9F 100%, transparent 90%)',
           filter: 'blur(100px)',
           transform: 'scale(1.3)'
         }}
       />
      
       <div 
         className="absolute top-60 left-1/4 w-64 h-64 rounded-full opacity-100"
         style={{
           background: 'radial-gradient(circle, #FDDA24 0%, #FEEF9F 100%, transparent 90%)',
           filter: 'blur(120px)',
           transform: 'translate(-50%, -50%) scale(1.1)'
         }}
       />
      </div>
    </ClientOnly>
  );
}
