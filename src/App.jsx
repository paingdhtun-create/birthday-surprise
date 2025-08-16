import React, { useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";

// Mobile-first Birthday Surprise - single-file App.jsx
export default function App() {
  const [eggStates, setEggStates] = useState([false, false, false]);
  const [currentAct, setCurrentAct] = useState(null);
  const [timer, setTimer] = useState(30);
  const [genieDone, setGenieDone] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  const musicRef = useRef(null);
  const crackRef = useRef(null);
  const vp = useViewportSize();

  // preload audio
  useEffect(() => {
    musicRef.current = new Audio("/birthday-piano.mp3");
    musicRef.current.loop = true;
    musicRef.current.volume = 0.5;

    crackRef.current = new Audio("/egg-crack.mp3");
    crackRef.current.volume = 0.9;

    return () => {
      try { if (musicRef.current) musicRef.current.pause(); } catch {}
      musicRef.current = null;
      crackRef.current = null;
    };
  }, []);

  const toggleMusic = async () => {
    if (!musicRef.current) return;
    try {
      if (musicOn) {
        musicRef.current.pause();
        setMusicOn(false);
      } else {
        await musicRef.current.play();
        setMusicOn(true);
      }
    } catch (e) {
      // autoplay may be blocked until user interacts — handled by toggle
    }
  };

  // Act 2 countdown
  useEffect(() => {
    if (currentAct !== 2) return;
    if (genieDone) return;
    if (timer <= 0) {
      setGenieDone(true);
      return;
    }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [currentAct, timer, genieDone]);

  const crackEgg = (index) => {
    if (eggStates[index]) return;
    const next = eggStates.slice();
    next[index] = true;
    setEggStates(next);
    setCurrentAct(index + 1);
    setTimer(30);
    setGenieDone(false);
    try {
      if (crackRef.current) {
        crackRef.current.currentTime = 0;
        crackRef.current.play();
      }
    } catch {}
  };

  const closeOverlay = () => setCurrentAct(null);
  const actLabel = (i) => `Egg ${i}`;

  return (
    <div className="app-root">
      <StyleTag />
      <AnimatedBackground />

      {/* Center header + eggs on mobile */}
      <main className="centerArea">
        <header className="hero">
          <h1 className="title">Happy 23rd Birthday, Hsu Mon</h1>
          <p className="subtitle">I've found three eggs for you. Crack them to see what's inside.</p>
        </header>

        {/* Mobile-centered eggs */}
        <section className="eggs" aria-label="eggs">
          {[0,1,2].map(i => (
            <button
              key={i}
              className={`egg egg--${i+1} ${eggStates[i] ? 'egg--cracked' : ''}`}
              onClick={() => crackEgg(i)}
              aria-label={`Crack ${actLabel(i+1)}`}
            >
              <span className="egg__shine" />
              <span className="egg__gloss" />
              <span className="egg__label">{actLabel(i+1)}</span>
              {eggStates[i] && <span className="egg__burst" aria-hidden>💥</span>}
            </button>
          ))}
        </section>
      </main>

      {/* Bottom-left music dock (visible) */}
      <div className="musicDock" role="region" aria-label="music control">
        <div className="musicNote"><strong>kindly turn on the music first</strong> 🎵</div>
        <button
          className={`musicBtn ${musicOn ? 'on' : 'off'}`}
          onClick={toggleMusic}
          aria-pressed={musicOn}
        >
          {musicOn ? "🔊 Music On" : "🔈 Music Off"}
        </button>
      </div>

      {/* Overlay / Acts */}
      {currentAct && (
        <div className={`overlay overlay--act${currentAct}`} role="dialog" aria-modal="true">
          <Confetti width={vp.width} height={vp.height} numberOfPieces={currentAct === 3 ? 500 : 240} />

          {/* Act 1 */}
          {currentAct === 1 && (
            <div className="card">
              <PetalRain count={28} />
              <div className="emojis" aria-hidden><span>🎀</span><span>💐</span><span>🎈</span></div>
              <p className="text">Wishing this bouquet of roses brings you joy. Sorry I couldn't give you real flowers this year, but I will someday.</p>
              <button className="btn" onClick={closeOverlay}>Back to Eggs</button>
            </div>
          )}

          {/* Act 2 */}
          {currentAct === 2 && (
            <div className="card">
              <LampSmoke />
              <div className={`genie ${genieDone ? 'genie--dance' : ''}`} aria-hidden>🧞‍♂️</div>
              {!genieDone ? (
                <>
                  <p className="text">I know you’ve been working so hard this year, so I’ve hired a genie from Egypt to help you. Better make your wish quickly!</p>
                  <p className="text">⏳ You have {timer} second{timer === 1 ? '' : 's'}</p>
                </>
              ) : (
                <p className="text">Don't worry Toe Toe, your wish is granted.</p>
              )}
              {genieDone && <button className="btn" onClick={closeOverlay}>Back to Eggs</button>}
            </div>
          )}

          {/* Act 3 */}
          {currentAct === 3 && (
            <div className="card card--video">
              <SparkleField />
              <div className="videoWrap">
                <div className="videoBadge" aria-hidden>🎥</div>
                {/* portrait videos will fit now (no forced cropping) */}
                <video className="video video--big" controls playsInline>
                  <source src="/your-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <p className="text underVideo">Oh! What could this video be?</p>
              </div>
              <button className="btn" onClick={closeOverlay}>Back to Eggs</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Helper components ---------------- */

function AnimatedBackground() {
  const floating = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 16 + Math.random()*20,
    dur: 8 + Math.random()*12,
    delay: Math.random()*6,
    emoji: ["✨","🎀","🎂","💖","🌈","💫","🌸","🪄","🎈"][Math.floor(Math.random()*9)]
  })), []);

  const balloons = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    id: 'b'+i,
    left: Math.random()*100,
    size: 20 + Math.random()*30,
    dur: 14 + Math.random()*12,
    delay: Math.random()*8,
    hue: Math.floor(Math.random()*60) - 20
  })), []);

  const ribbons = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: 'r'+i,
    top: Math.random()*100,
    left: Math.random()*100,
    size: 18 + Math.random()*22,
    dur: 5 + Math.random()*6,
    delay: Math.random()*5
  })), []);

  return (
    <div className="bg" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => <span key={i} className={`bokeh bokeh--${(i%5)+1}`} />)}
      {floating.map(f => (
        <span key={f.id} className="float" style={{
          top: `${f.top}%`,
          left: `${f.left}%`,
          fontSize: f.size,
          animationDuration: `${f.dur}s`,
          animationDelay: `${f.delay}s`
        }}>{f.emoji}</span>
      ))}
      {balloons.map(b => (
        <span key={b.id} className="balloon" style={{
          left: `${b.left}%`,
          fontSize: b.size,
          animationDuration: `${b.dur}s`,
          animationDelay: `${b.delay}s`,
          filter: `hue-rotate(${b.hue}deg)`
        }}>🎈</span>
      ))}
      {ribbons.map(r => (
        <span key={r.id} className="ribbon" style={{
          top: `${r.top}%`,
          left: `${r.left}%`,
          fontSize: r.size,
          animationDuration: `${r.dur}s`,
          animationDelay: `${r.delay}s`
        }}>🎀</span>
      ))}
    </div>
  );
}

function PetalRain({ count = 24 }) {
  const petals = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random()*100,
    delay: Math.random()*6,
    dur: 6 + Math.random()*6,
    rot: (Math.random()*60 - 30).toFixed(1),
    emoji: ["🌸","🌺","🌷"][Math.floor(Math.random()*3)]
  })), [count]);

  return (
    <div className="petals" aria-hidden>
      {petals.map(p => (
        <span key={p.id} className="petal" style={{
          left: `${p.left}%`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          transform: `rotate(${p.rot}deg)`
        }}>{p.emoji}</span>
      ))}
    </div>
  );
}

function LampSmoke() {
  const puffs = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: 42 + Math.random()*16,
    delay: i * 0.28,
    dur: 5 + Math.random()*3,
    size: 14 + Math.random()*20
  })), []);

  return (
    <div className="lampArea" aria-hidden>
      <div className="lamp">🪔</div>
      {puffs.map(p => (
        <span key={p.id} className="smoke" style={{
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`
        }} />
      ))}
    </div>
  );
}

function SparkleField() {
  const stars = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    top: Math.random()*100,
    left: Math.random()*100,
    size: 2 + Math.random()*4,
    delay: Math.random()*3
  })), []);

  return (
    <div className="sparkles" aria-hidden>
      {stars.map(s => (
        <span key={s.id} className="spark" style={{
          top: `${s.top}%`,
          left: `${s.left}%`,
          width: s.size,
          height: s.size,
          animationDelay: `${s.delay}s`
        }} />
      ))}
    </div>
  );
}

/* viewport hook */
function useViewportSize(){
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

/* Scoped CSS inserted by component */
/* Scoped CSS inserted by component */
/* Scoped CSS inserted by component */
function StyleTag(){
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@400;600;800&display=swap');

      :root{
        --pink:#FFC7DA;
        --rose:#FF9EC4;
        --lav:#8E4ED3;
        --ink:#5A2975;
        --red:#c1121f;
        --blue:#1e7bf2;
      }

      *{box-sizing:border-box}
      html,body,#root,.app-root{height:100%}
      body{margin:0;background:var(--pink);-webkit-font-smoothing:antialiased}

      .app-root{
        position:relative;
        min-height:100vh;
        overflow:hidden;
        color:var(--ink);
        font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        text-align:center;
        padding-bottom: calc(100px + env(safe-area-inset-bottom));
      }

      /* background */
      .bg{ position:absolute; inset:0; z-index:-1;
           background: linear-gradient(120deg, #ffe4ec, #ffd7ef, #ffe9d6, #ffe4f4);
           background-size:200% 200%; animation: grad 20s ease-in-out infinite; overflow:hidden;}
      @keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      .bokeh{position:absolute;border-radius:50%;filter:blur(14px);opacity:.28}
      .bokeh--1{width:220px;height:220px;left:4%;top:8%;background:#ffdff0}
      .bokeh--2{width:180px;height:180px;left:70%;top:18%;background:#ffe7cc}
      .bokeh--3{width:260px;height:260px;left:16%;top:66%;background:#ffd4f0}
      .bokeh--4{width:200px;height:200px;left:76%;top:70%;background:#ffe6ea}
      .bokeh--5{width:160px;height:160px;left:44%;top:44%;background:#fff1d0}

      .float{position:absolute;animation:rise linear infinite;opacity:.9}
      @keyframes rise{from{transform:translateY(20px)}to{transform:translateY(-40px)}}

      /* center area (centers header + eggs on mobile) */
      .centerArea{
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:14px;
        min-height: calc(100vh - 140px);
        padding: 16px;
      }
      @media (min-width: 640px){
        .centerArea{
          min-height: auto;
          padding-top: 22px;
          justify-content: flex-start;
        }
      }

      /* hero */
      .hero{ display:flex; flex-direction:column; align-items:center; gap:6px; padding: 6px 14px; }
      .title{font-family:'Great Vibes',cursive;font-size:clamp(26px,6.5vw,52px);margin:0;color:var(--ink);text-shadow:0 2px 0 rgba(255,255,255,.7)}
      .subtitle{margin:0;color:#6d28d9;font-size:clamp(13px,3.6vw,17px);max-width:92%;line-height:1.3;opacity:.95}

      /* eggs - mobile centered vertical stack */
      .eggs{
        margin: 10px auto 18px;
        width: 100%;
        max-width: 380px;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap: 14px;
      }
      .egg{
        width: 85%;
        max-width: 220px;   /* ✅ smaller for mobile */
        aspect-ratio: 3/4;
        border: none;
        cursor:pointer;
        border-radius: 50% 50% 48% 48% / 60% 60% 40% 40%;
        background:
          radial-gradient(35% 35% at 50% 18%, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 60%),
          radial-gradient(90% 120% at 50% 46%, #ffd4e7 0%, #ff9ed0 50%, #ff7fbd 75%, #ffb86b 100%);
        box-shadow: 0 12px 28px rgba(0,0,0,.12), 0 0 0 6px rgba(255,255,255,.55) inset, 0 0 20px rgba(246,196,83,.32);
        transition: transform .18s ease, box-shadow .28s ease;
        animation: eggIdle 3.2s ease-in-out infinite;
        display:block;
        position:relative;
      }
      @media (min-width: 640px){
        .eggs{
          max-width: 780px;
          display:grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .egg { width: 100%; max-width: 260px; } /* ✅ bigger but not too big */
      }

      .egg--1{ filter: hue-rotate(0deg) saturate(1.05); }
      .egg--2{ filter: hue-rotate(25deg) saturate(1.08); }
      .egg--3{ filter: hue-rotate(-15deg) saturate(1.1); }

      @keyframes eggIdle{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.01)}}
      .egg:hover{transform:translateY(-3px) scale(1.02); box-shadow:0 18px 44px rgba(0,0,0,.16)}
      .egg:active{transform:scale(.985)}
      .egg__shine{position:absolute; left:16%; top:10%; width:18%; height:28%; background:linear-gradient(180deg,#fff,transparent); opacity:.6; border-radius:50%; filter:blur(2px)}
      .egg__gloss{position:absolute; right:14%; top:22%; width:12%; height:22%; background:linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,0)); border-radius:50%; filter:blur(1px); opacity:.75}
      .egg__label{position:absolute; bottom:-22px; left:50%; transform:translateX(-50%); color:#6d28d9; font-weight:800; font-size:clamp(12px,3.6vw,15px)}
      .egg__burst{position:absolute; inset:0; display:grid; place-items:center; font-size:clamp(28px,8vw,48px); animation: pop .55s ease;}
      @keyframes pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
      .egg--cracked{animation:none}

      /* overlay cards */
      .overlay{position:fixed; inset:0; display:grid; place-items:center; padding: 12px; z-index:60}
      .overlay::before{content:""; position:absolute; inset:0; backdrop-filter: blur(2px); background: rgba(255,194,214,.94)}
      .card{position:relative; width:min(720px,94vw); background: rgba(255,255,255,.94); border-radius:18px; padding:18px; box-shadow:0 20px 60px rgba(0,0,0,.14); display:flex; flex-direction:column; align-items:center; gap:12px}
      .card--video{padding-bottom: 14px}
      .btn{background: linear-gradient(180deg,#a06ad9,#6d28d9); color:white; border:none; padding:10px 14px; border-radius:12px; font-weight:700; cursor:pointer}
      .text{margin:0; font-size:clamp(14px,3.2vw,18px); color:#6b21a8; max-width:640px; line-height:1.4; text-align:center}

      /* act backgrounds */
      .overlay--act1::before{background: linear-gradient(180deg, rgba(255,230,240,.96), rgba(255,210,224,.94))}
      .overlay--act2::before{background: radial-gradient(120% 90% at 50% 100%, rgba(20,16,56,.86) 0%, rgba(80,58,140,.72) 60%, rgba(255,210,224,.62) 100%), rgba(10,6,40,.6)}
      .overlay--act3::before{background: radial-gradient(100% 80% at 50% 0%, rgba(255,240,210,.94), rgba(255,219,165,.94), rgba(255,210,224,.88))}

      /* petal animation */
      .petals{position:absolute; inset:0; pointer-events:none}
      .petal{position:absolute; top:-12%; font-size:26px; animation: fall linear infinite; opacity:.95}
      @keyframes fall{to{transform:translateY(120vh) rotate(360deg); opacity:.75}}

      /* lamp / genie */
      .lampArea{position:relative; width:100%; height:160px; margin-top:6px}
      .lamp{position:absolute; bottom:0; left:50%; transform:translateX(-50%); font-size:clamp(36px,10vw,72px)}
      .smoke{position:absolute; bottom:28px; border-radius:50%; background: radial-gradient(circle at 30% 30%, rgba(210,230,255,.9), rgba(170,200,255,.4) 60%, rgba(140,170,245,.1) 100%); filter:blur(1px); animation:puff ease-in-out infinite}
      @keyframes puff{0%{transform:translate(-50%,0) scale(.6);opacity:.5}60%{opacity:.9}100%{transform:translate(-50%,-140px) scale(1.2);opacity:0}}
      .genie{font-size:clamp(96px,24vw,160px); text-shadow:0 4px 0 rgba(255,255,255,.5); transition:transform .25s ease}
      .genie--dance{animation: genieDance .9s ease-in-out infinite}
      @keyframes genieDance{0%{transform:translateY(0) rotate(-4deg) scale(1)}50%{transform:translateY(-6px) rotate(4deg) scale(1.06)}100%{transform:translateY(0) rotate(-4deg) scale(1)}}

      /* video responsive - portrait-friendly */
      .videoWrap{width:100%; display:flex; flex-direction:column; align-items:center; gap:10px}
      .videoBadge{font-size:clamp(36px,9vw,64px)}
      .video{
        width: calc(100% - 32px);
        max-width: 820px;
        height: auto;
        border-radius:12px;
        border:2px solid rgba(160,106,217,.4);
        box-shadow:0 10px 28px rgba(0,0,0,.16);
        background: black;
      }
      .video--big{
        width: calc(100% - 32px);
        max-width: 820px;
        max-height: 80vh;
        height: auto;
        object-fit: contain;
        background: black;
        border-radius:12px;
      }
      .underVideo{margin-top:6px}

      /* sparkles */
      .sparkles{position:absolute; inset:0; pointer-events:none}
      .spark{position:absolute; background: radial-gradient(circle,#fff,#fff0 70%); border-radius:50%; animation: twinkle 1.8s ease-in-out infinite}
      @keyframes twinkle{0%{opacity:.25; transform:scale(.6)}50%{opacity:1; transform:scale(1)}100%{opacity:.25; transform:scale(.6)}}

      /* music dock - bottom center on mobile, bottom-left on desktop */
      .musicDock{
        position:fixed;
        bottom:calc(12px + env(safe-area-inset-bottom));
        left:50%;
        transform:translateX(-50%);
        z-index:70;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:6px;
      }
      @media (min-width: 640px){
        .musicDock{
          left:calc(12px + env(safe-area-inset-left));
          transform:none;
          align-items:flex-start;
        }
      }
      .musicNote{font-size:12px; color:var(--red); font-weight:800; background:rgba(255,255,255,.92); padding:6px 8px; border-radius:10px; border:1px solid rgba(193,18,31,.18); text-align:center; max-width:240px}
      .musicBtn{padding:10px 16px; border-radius:18px; font-weight:800; min-width:140px; cursor:pointer; border:2px solid rgba(0,0,0,.06); box-shadow:0 8px 20px rgba(0,0,0,.08)}
      .musicBtn.off{ background: var(--red); color:#fff; border-color: rgba(0,0,0,.06) }
      .musicBtn.on{ background: var(--blue); color:#fff; border-color: rgba(0,0,0,.06) }

      @media (max-width: 360px){
        .egg{ max-width: 180px }
        .title{ font-size: clamp(22px,6.5vw,38px) }
        .subtitle{ font-size: 12.5px }
      }
    `}</style>
  );
}


