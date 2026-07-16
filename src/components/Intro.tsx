import React, { useEffect, useState } from 'react';
import styles from './Intro.module.css';

interface IntroProps {
  onDone: () => void;
}

export function Intro({ onDone }: IntroProps) {
  const [exiting, setExiting] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();

    // Total duration: ~2.8s total
    // 2.2s on screen + 0.6s transition
    const timer = setTimeout(() => {
      setExiting(true);
    }, 2800);

    // Call onDone after transition completes
    const doneTimer = setTimeout(() => {
      onDone();
    }, 3400);

    return () => {
      clearTimeout(timer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div 
      className={`${styles.intro} ${exiting ? styles.exiting : ""} ${isDark ? styles.dark : styles.brazil}`} 
      role="status" 
      aria-label="Carregando Radio Wave Brasil"
    >
      <div className={styles.bg} />
      <div className={styles.inner}>
        <div className={styles.waves}>
          {[0, 1, 2, 3].map(i => (
            <span 
              key={i} 
              className={styles.bar} 
              style={{ animationDelay: `${i * 0.15}s` }} 
            />
          ))}
        </div>
        <h1 className={styles.title}>
          Radio Wave<br />
          <span className={styles.highlight}>Brasil</span>
        </h1>
        <div className={styles.divider} />
        <p className={styles.sub}>Rádios brasileiras ao vivo</p>
        <div className={styles.liveBadge}>
          <span className={`${styles.liveDot} animate-live-pulse`} />
          AO VIVO
        </div>
      </div>
    </div>
  );
}
