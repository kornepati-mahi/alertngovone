import { useState, useEffect } from "react";

export default function AnimatedTypewriter({
  words = [
    "Defending Adivasi Land Rights",
    "Preserving 5th Scheduled Forests",
    "Uplifting Yenadi Women Cooperatives",
    "Polavaram Displaced Rehabilitation",
    "Clean Solar Energy for Tribal Hamlets"
  ],
  prefix = "Championing ",
  prefixColor,
  highlightColor,
  typingSpeed = 75,
  deletingSpeed = 40,
  pauseTime = 1800,
  className = ""
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = words[wordIndex % words.length];

    let timer;
    if (!isDeleting && currentText.length < fullText.length) {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && currentText.length === fullText.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && currentText.length > 0) {
      timer = setTimeout(() => {
        setCurrentText(fullText.substring(0, currentText.length - 1));
      }, deletingSpeed);
    } else if (isDeleting && currentText.length === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  // Plain inline text (no flex) so the line wraps naturally and inherits
  // the hero's text-alignment instead of running off the viewport edge.
  return (
    <span
      className={`animated-typewriter ${className}`}
      style={{
        display: "inline",
        fontFamily: "inherit",
        lineHeight: 1.35,
        overflowWrap: "break-word"
      }}
    >
      {prefix && (
        <span style={{ color: prefixColor || "rgba(255,255,255,0.82)", fontWeight: 500 }}>
          {prefix}
        </span>
      )}
      <span
        style={{
          color: highlightColor || "var(--logo-gold, #F5A000)",
          fontWeight: 800,
          letterSpacing: "-0.01em"
        }}
      >
        {currentText}
      </span>
      <span
        className="typewriter-caret"
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "2px",
          height: "1em",
          verticalAlign: "-0.12em",
          marginLeft: "3px",
          background: highlightColor || "var(--logo-gold, #F5A000)",
          borderRadius: "1px"
        }}
      />
    </span>
  );
}
