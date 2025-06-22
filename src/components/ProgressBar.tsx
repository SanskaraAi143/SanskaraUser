import React, { useEffect, useRef } from "react";

const ProgressBar: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Use documentElement for full page scroll progress
      if (!barRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.max(0, Math.min(100, (scrollTop / docHeight) * 100)) : 0;
      barRef.current.style.width = percent + "%";
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    setTimeout(handleScroll, 100); // Initial update
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="progress-bar"
      style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #F59E0B, #DC2626)", zIndex: 40, width: 0, borderRadius: 2, transition: "width 0.2s" }}
    />
  );
};

export default ProgressBar;
