import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

// ExerciseDB image URLs can expire or be missing, so always show a fallback.
export default function ExerciseImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(!src);
    useEffect(() => {
     setFailed(!src);
   }, [src]);

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-iron-800 text-iron-400 ${className}`} role="img" aria-label={`No demonstration available for ${alt}`}>
        <ImageOff className="h-8 w-8" aria-hidden="true" />
        <span className="text-sm">No demo available</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`bg-white object-contain ${className}`} />;
}
