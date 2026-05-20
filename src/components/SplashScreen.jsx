import { useEffect, useState } from "react";
import "./SplashScreen.css";

const spokes = [0, 40, 80, 120, 160, 200, 240, 280, 320];

export default function SplashScreen({ onFinish }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      onFinish?.();
    }, 4000);
    return () => clearTimeout(t);
  }, [onFinish]);

  if (done) return null;

  return (
    <div className="splash">
      <div className="logo-row">
        <div className="star-wrap">
          {spokes.map((deg, i) => (
            <div
              key={i}
              className="spoke"
              style={{
                "--ar": `${deg}deg`,
                animationDelay: `${0.04 + i * 0.06}s`,
              }}
            />
          ))}
        </div>
        <div className="text-col">
          <div className="t1">Bahá’ís</div>
          <div className="t2">de Bolivia</div>
        </div>
      </div>
      <div className="loader-bar" />
    </div>
  );
}