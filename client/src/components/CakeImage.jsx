import { useState } from "react";

export default function CakeImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-[#eadbc6] to-[#c9a57a] text-4xl ${className}`}>
        🎂
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
