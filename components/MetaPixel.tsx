    'use client';

import { FacebookPixel, PixelPageView } from 'next-pixels';

export function MetaPixelWrapper() {
  return (
    <>
      <FacebookPixel />
      <PixelPageView />
    </>
  );
}