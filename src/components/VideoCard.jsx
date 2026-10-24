import { useState } from 'react';
import { Play } from 'lucide-react';

export default function VideoCard({ video }) {
  const [thumbFailed, setThumbFailed] = useState(!video.thumbnail);
  const meta = [video.views, video.published].filter(Boolean).join(' • ');

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      aria-label={`${video.title}${video.channel ? ` by ${video.channel}` : ''} (opens YouTube in a new tab)`}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-iron-700 bg-iron-800">
        {thumbFailed ? (
          <div className="flex h-full items-center justify-center text-iron-400"><Play className="h-10 w-10" aria-hidden="true" /></div>
        ) : (
          <img src={video.thumbnail} alt="" loading="lazy" onError={() => setThumbFailed(true)} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-iron-950/0 opacity-0 transition group-hover:bg-iron-950/40 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-iron-950"><Play className="h-5 w-5 fill-current" aria-hidden="true" /></span>
        </span>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-iron-950/90 px-1.5 py-0.5 text-xs font-semibold">{video.duration}</span>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 font-body text-base font-semibold leading-snug tracking-normal group-hover:text-lime-300">{video.title}</h3>
      {video.channel && <p className="mt-1 text-sm text-iron-300">{video.channel}</p>}
      {meta && <p className="text-sm text-iron-400">{meta}</p>}
    </a>
  );
}
