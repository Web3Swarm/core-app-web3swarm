'use client';

import dynamic from 'next/dynamic';

// Example of a component that uses browser APIs
const DynamicComponent = dynamic(
  () => import('./ComponentWithBrowserAPIs'),
  { ssr: false }
);

export default DynamicComponent; 