import React, { useState } from 'react';
import { styled } from '@storybook/theming';
import { CatalogView } from '../ds-browser/CatalogView';
import { CustomizeForm } from './CustomizeForm';

const Stepped = styled.div({ marginBottom: 16 });

interface GalleryPathProps {
  onProgress?: (sessionId: string) => void;
  onComplete?: (id: string) => void;
}

export function GalleryPath({ onProgress, onComplete }: GalleryPathProps) {
  const [selectedBase, setSelectedBase] = useState<string | null>(null);

  // CatalogView exposes an onSelect callback; we tap into it via a wrapper.
  // After selection, show the CustomizeForm.

  if (selectedBase) {
    return (
      <Stepped>
        <CustomizeForm baseId={selectedBase} onComplete={onComplete} onProgress={onProgress} />
      </Stepped>
    );
  }

  return (
    <Stepped>
      <CatalogView onUseTemplate={(ref: string) => setSelectedBase(ref)} />
    </Stepped>
  );
}
