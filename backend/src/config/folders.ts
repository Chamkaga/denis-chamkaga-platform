// src/config/folders.ts
// Configurable folders for the Digital Asset Management (Media Library) system.
// Any addition here automatically propagates throughout the backend.

export const CONFIGURED_FOLDERS = [
  'Images',
  'Documents',
  'Videos',
  'Audio',
  'Downloads',
  'Logos',
  'Icons',
  'Brand Assets',
  'AI Assets',
  'Archive',
] as const;

export type ConfiguredFolder = typeof CONFIGURED_FOLDERS[number];

export const isValidFolder = (folder: string): boolean => {
  return CONFIGURED_FOLDERS.includes(folder as any);
};
