'use client';

export default function Home() {
  return (
    <main suppressHydrationWarning>
      {/* Your content here */}
      <div suppressHydrationWarning>
        {/* Content that might be modified by browser extensions */}
        {new Date().toLocaleString()}
      </div>
    </main>
  );
} 