export type ImageSize = 'thumbnail' | 'card' | 'full';

export function getPromptImageUrl(
  cloudinaryPublicId: string,
  size: ImageSize = 'card'
): string {
  const transformations = {
    thumbnail: { width: 640, height: 360, crop: 'fill', quality: 'auto:good' },
    card: { width: 1280, height: 720, crop: 'fill', quality: 'auto:best' },
    full: { width: 1920, height: 1080, crop: 'limit', quality: 'auto:best' },
  };

  const params = transformations[size];
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvskpqqvv';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${params.width},h_${params.height},c_${params.crop},q_${params.quality},f_auto/${cloudinaryPublicId}`;
}

export function getCategoryColor(color: string): string {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-500 to-cyan-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return colorMap[color] || 'from-gray-500 to-gray-600';
}

export function getCategoryBorderColor(color: string): string {
  const borderMap: Record<string, string> = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500',
    cyan: 'border-cyan-500',
    pink: 'border-pink-500',
  };

  return borderMap[color] || 'border-gray-500';
}
