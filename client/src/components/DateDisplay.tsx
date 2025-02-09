'use client';

import { useEffect, useState } from 'react';

export default function DateDisplay() {
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    // Only set the date on the client side
    setDateString(new Date().toISOString());
  }, []);

  if (!dateString) {
    return null; // or a loading state
  }

  return <div>{dateString}</div>;
} 