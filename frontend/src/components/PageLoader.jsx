import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="page-loader">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="loader-logo"
      >
        <img src="/alert-logo.png" alt="ALERT" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", letterSpacing: "3px", textTransform: "uppercase" }}
      >
        Towards Prosperity & Peace
      </motion.p>
      <div className="loader-bar">
        <motion.div
          className="loader-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
}
