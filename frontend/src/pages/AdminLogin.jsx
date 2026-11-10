import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaSignInAlt, FaEye, FaEyeSlash, FaShieldAlt, FaUser, FaLock } from "react-icons/fa";

const KEY_STORAGE   = "alertngo_admin_key";
const ADMIN_USER    = "alertngo@vone";
const ADMIN_PASS    = "alertngo@123";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass]  = useState(false);
  const [error,    setError]     = useState("");
  const [loading,  setLoading]   = useState(false);
  const navigate = useNavigate();

  // Already logged in → straight to dashboard
  useEffect(() => {
    if (sessionStorage.getItem(KEY_STORAGE)) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));

    const savedPass = localStorage.getItem("alertngo_admin_password") || ADMIN_PASS;
    if (username.trim() === ADMIN_USER && (password === savedPass || password === ADMIN_PASS)) {
      sessionStorage.setItem(KEY_STORAGE, password);
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Invalid username or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html,body,#root{margin:0;padding:0;height:100%;}
        .al-page{
          min-height:100vh;background:#0a0a0a;
          display:flex;align-items:center;justify-content:center;
          font-family:'Outfit','Inter',sans-serif;padding:20px;
        }
        .al-card{
          background:#141820;border:1.5px solid rgba(192,57,43,.35);
          border-radius:16px;padding:44px 40px 36px;
          width:100%;max-width:420px;
          box-shadow:0 0 60px rgba(192,57,43,.1),0 20px 60px rgba(0,0,0,.7);
        }
        .al-logo{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:32px;}
        .al-badge{
          width:64px;height:64px;border-radius:14px;
          background:linear-gradient(135deg,#1a1f2e,#252d40);
          border:1.5px solid rgba(192,57,43,.4);
          display:flex;align-items:center;justify-content:center;
        }
        .al-logo-img{
          height:58px;width:58px;object-fit:contain;
          background:#fff;border-radius:12px;padding:6px;
        }
        .al-title{color:#fff;font-size:1.5rem;font-weight:800;margin:0;}
        .al-sub{color:#c0392b;font-size:.82rem;margin:2px 0 0;font-weight:500;}
        .al-err{
          background:rgba(192,57,43,.15);border:1px solid rgba(192,57,43,.4);
          color:#ff6b6b;border-radius:8px;padding:10px 14px;
          font-size:.82rem;margin-bottom:18px;display:flex;align-items:center;gap:6px;
        }
        .al-label{
          display:block;color:#8892a4;font-size:.73rem;font-weight:700;
          text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;
        }
        .al-field{position:relative;margin-bottom:16px;}
        .al-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#4a5568;pointer-events:none;}
        .al-input{
          width:100%;background:#1e2436;border:1.5px solid #2a3148;border-radius:10px;
          color:#e8edf5;font-size:.93rem;padding:13px 44px 13px 40px;
          outline:none;box-sizing:border-box;transition:border-color .2s;
          font-family:'Outfit','Inter',sans-serif;
        }
        .al-input::placeholder{color:#4a5568;}
        .al-input:focus{border-color:#c0392b;}
        .al-eye{
          position:absolute;right:13px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#4a5568;
          padding:4px;display:flex;transition:color .2s;
        }
        .al-eye:hover{color:#c0392b;}
        .al-btn{
          width:100%;background:#c0392b;color:#fff;border:none;border-radius:10px;
          padding:14px;font-size:.95rem;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background .2s,transform .15s;margin-top:8px;
          font-family:'Outfit',sans-serif;letter-spacing:.02em;
        }
        .al-btn:hover:not(:disabled){background:#a93226;transform:translateY(-1px);}
        .al-btn:disabled{background:#2a3148;color:#4a5568;cursor:not-allowed;}
        .al-spin{
          width:16px;height:16px;border:2px solid rgba(255,255,255,.2);
          border-top-color:#fff;border-radius:50%;
          animation:alspin .7s linear infinite;display:inline-block;
        }
        @keyframes alspin{to{transform:rotate(360deg);}}
        .al-hr{border:none;border-top:1px solid #1e2436;margin:24px 0 0;}
        .al-back{
          display:block;text-align:center;margin-top:18px;
          color:#4a5568;text-decoration:none;font-size:.82rem;
          font-weight:500;transition:color .2s;
        }
        .al-back:hover{color:#c0392b;}

        @media (max-width: 480px) {
          .al-page { padding: 12px !important; }
          .al-card { padding: 24px 16px 20px !important; border-radius: 14px !important; }
          .al-title { font-size: 1.25rem !important; }
          .al-input { font-size: 14px !important; padding: 11px 36px 11px 36px !important; }
          .al-btn { padding: 12px !important; font-size: 0.88rem !important; }
        }
      `}</style>

      <div className="al-page">
        <div className="al-card">

          {/* ── Header ── */}
          <div className="al-logo">
            <div className="al-badge">
              <FaShieldAlt size={28} color="#c0392b" />
            </div>
            <img
              src="/alert-logo.png"
              alt="ALERT NGO"
              className="al-logo-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <h1 className="al-title">Admin Console</h1>
            <p className="al-sub">Sign in to manage website content</p>
          </div>

          {/* ── Error ── */}
          {error && <div className="al-err">⚠️ {error}</div>}

          {/* ── Form ── */}
          <form onSubmit={handleLogin}>

            <label className="al-label">Admin Username</label>
            <div className="al-field">
              <FaUser size={13} className="al-ico" />
              <input
                className="al-input"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="alertngo@vone"
                autoFocus
                autoComplete="username"
              />
            </div>

            <label className="al-label">Password</label>
            <div className="al-field">
              <FaLock size={13} className="al-ico" />
              <input
                className="al-input"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
              <button type="button" className="al-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>

            <button type="submit" className="al-btn" disabled={loading}>
              {loading
                ? <><span className="al-spin" /> Signing in…</>
                : <><FaSignInAlt size={14} /> Sign In to Console</>}
            </button>
          </form>

          <hr className="al-hr" />
          <Link to="/" className="al-back">← Back to Public Website</Link>
        </div>
      </div>
    </>
  );
}
