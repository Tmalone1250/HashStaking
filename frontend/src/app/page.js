"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../context/WalletContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  /* Light Theme Grid */
  .bg-grid-theme {
      background-size: 60px 60px;
      background-image: 
          linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 75%);
  }

  /* Premium Light Card */
  .premium-depth-card {
      background: linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%);
      box-shadow: 
          0 40px 100px -20px rgba(15, 23, 42, 0.12),
          0 20px 40px -20px rgba(15, 23, 42, 0.08),
          inset 0 1px 2px rgba(255, 255, 255, 0.9),
          inset 0 -2px 4px rgba(15, 23, 42, 0.03);
      border: 1px solid rgba(203, 213, 225, 0.8);
      position: relative;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.08) 0%, transparent 40%);
      mix-blend-mode: multiply; transition: opacity 0.3s ease;
  }

  /* Sleek Titanium/Slate iPhone Mockup Hardware */
  .iphone-bezel {
      background-color: #0F172A;
      box-shadow: 
          inset 0 0 0 2px #334155, 
          inset 0 0 0 7px #020617, 
          0 40px 80px -15px rgba(15,23,42,0.35),
          0 15px 25px -5px rgba(15,23,42,0.2);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, #334155 0%, #0F172A 100%);
      box-shadow: -2px 0 5px rgba(0,0,0,0.4);
  }

  .screen-glare {
      background: linear-gradient(110deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.08);
  }

  .floating-ui-badge {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px); 
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 
          0 0 0 1px rgba(203, 213, 225, 0.8),
          0 20px 40px -12px rgba(15, 23, 42, 0.12),
          inset 0 1px 1px rgba(255,255,255,1);
      color: #0F172A;
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }
`;

export default function LandingPage() {
  const router = useRouter();
  const { isConnected, account, isVerified, checkingIdentity, setIsVerified, connectWallet, disconnectWallet } = useWallet();

  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [corporateEntity, setCorporateEntity] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // GSAP Refs
  const containerRef = useRef(null);
  const mainCardRef = useRef(null);
  const mockupRef = useRef(null);
  const requestRef = useRef(0);

  const handleLaunchApp = async (e) => {
    if (e) e.preventDefault();
    if (!isConnected) {
      await connectWallet();
    } else if (!isVerified) {
      setShowModal(true);
    } else {
      router.push("/dashboard");
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!account) return;
    setSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/v1/registry/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account,
          full_name: fullName,
          corporate_entity: corporateEntity,
          jurisdiction: jurisdiction
        })
      });
      if (res.ok) {
        setIsVerified(true);
        setShowModal(false);
        router.push("/dashboard");
      } else {
        alert("Verification request rejected by compliance gate.");
      }
    } catch {
      // Backend offline or dev mode fallback
      setIsVerified(true);
      setShowModal(false);
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // High-Performance Mouse Interaction Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);
      
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 10,
            rotationX: -yVal * 10,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Cinematic Scroll Timeline
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      const introTl = gsap.timeline({ delay: 0.2 });
      introTl
        .to(".text-track", { duration: 1.5, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.2, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=0.8");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=4500",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.15, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val", { innerHTML: 177, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.0 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 }) 
        .to({}, { duration: 1.0 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".main-card", { 
          width: isMobile ? "92vw" : "85vw", 
          height: isMobile ? "92vh" : "85vh", 
          borderRadius: isMobile ? "32px" : "40px", 
          ease: "expo.inOut", 
          duration: 1.8 
        }, "pullback") 
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      {/* Sticky Top Navigation Bar */}
      <header className="border-b border-slate-200/80 backdrop-blur-md sticky top-0 z-[100] px-8 py-4 flex items-center justify-between bg-white/80 shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            HashStaking Console
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold tracking-wide hidden sm:inline-block">
            Institutional Yield
          </span>
        </div>

        <nav className="flex items-center space-x-6">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="px-5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center space-x-3 bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{formatAddress(account)}</span>
              </span>

              {checkingIdentity ? (
                <span className="text-[10px] font-mono text-slate-400 font-semibold animate-pulse">Syncing Chain...</span>
              ) : !isVerified ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded font-bold shadow-sm transition-colors animate-pulse cursor-pointer"
                >
                  Verify Identity
                </button>
              ) : null}

              <button
                onClick={() => router.push("/dashboard")}
                className="text-xs bg-emerald-600 text-white px-3 py-1 rounded font-bold hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
              >
                Enter Console
              </button>
              <button
                onClick={disconnectWallet}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-2 transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Cinematic Hero Container */}
      <div
        ref={containerRef}
        className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-[#F8FAFC]"
        style={{ perspective: "1500px" }}
      >
        <div className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-80" aria-hidden="true" />

        {/* BACKGROUND LAYER 1: Hero Texts */}
        <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform transform-style-3d pointer-events-none">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>HashKey On-Chain Horizon Certified Enterprise Partner</span>
          </div>
          <h1 className="text-track gsap-reveal text-slate-900 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-2 drop-shadow-sm">
            Institutional yield,
          </h1>
          <h1 className="text-days gsap-reveal bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter pb-2">
            settled instantly.
          </h1>
        </div>

        {/* BACKGROUND LAYER 2: Tactile CTA Buttons */}
        <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal pointer-events-auto will-change-transform">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">
            Start your treasury.
          </h2>
          <p className="text-slate-600 text-lg md:text-xl mb-12 max-w-xl mx-auto font-normal leading-relaxed">
            Join institutional leaders securely managing RWA yields on the HashKey Mainnet with automated EIP-712 settlement gates.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleLaunchApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 group"
            >
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-emerald-200 uppercase mb-[-2px]">Connect & Verify</div>
                <div className="text-xl font-bold leading-none tracking-tight">Launch Console →</div>
              </div>
            </button>
            <a
              href="https://explorer.hsk.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-lg transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-[-2px]">Mainnet 177</div>
                <div className="text-xl font-bold leading-none tracking-tight">View Contracts ↗</div>
              </div>
            </a>
          </div>
        </div>

        {/* FOREGROUND LAYER: The Physical Premium Depth Card */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
          <div
            ref={mainCardRef}
            className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
          >
            <div className="card-sheen" aria-hidden="true" />

            {/* DYNAMIC RESPONSIVE GRID */}
            <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">
              
              {/* BRAND NAME WATERMARK */}
              <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full select-none">
                <h2 className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-black uppercase tracking-tighter bg-gradient-to-b from-slate-200 to-slate-100 bg-clip-text text-transparent lg:mt-0 leading-none">
                  Hash<br/>Stake
                </h2>
              </div>

              {/* TITANIUM/SLATE IPHONE MOCKUP */}
              <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
                <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-85 lg:scale-100">
                  <div
                    ref={mockupRef}
                    className="relative w-[280px] h-[580px] rounded-[3rem] iphone-bezel flex flex-col will-change-transform transform-style-3d"
                  >
                    <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                    <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                    <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                    <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                    <div className="absolute inset-[7px] bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-white z-10">
                      <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                      <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      </div>

                      <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                        <div className="phone-widget flex justify-between items-center mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Status</span>
                            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                              Verified <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                            </span>
                          </div>
                          <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">ERC-3643</div>
                        </div>

                        <div className="phone-widget relative w-44 h-44 mx-auto flex items-center justify-center mb-8 drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)]">
                          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                            <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                            <circle className="progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#10B981" strokeWidth="12" />
                          </svg>
                          <div className="text-center z-10 flex flex-col items-center">
                            <span className="counter-val text-4xl font-extrabold tracking-tighter text-white">0</span>
                            <span className="text-[8px] text-emerald-300 uppercase tracking-[0.1em] font-bold mt-0.5">Chain ID (Mainnet)</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="phone-widget widget-depth rounded-2xl p-3 flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center mr-3 border border-emerald-400/20 shadow-inner">
                              <span className="text-emerald-400 font-bold text-sm">HSK</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-white">HashKey Network</div>
                              <div className="text-[10px] text-slate-400">Mainnet Liquidity Active</div>
                            </div>
                          </div>
                          <div className="phone-widget widget-depth rounded-2xl p-3 flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/5 flex items-center justify-center mr-3 border border-teal-400/20 shadow-inner">
                              <span className="text-teal-400 font-bold text-sm">SBT</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-white">Identity Registry</div>
                              <div className="text-[10px] text-slate-400">Institutional Clearance</div>
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                      </div>
                    </div>
                  </div>

                  {/* FROSTED GLASS FLOATING BADGES */}
                  <div className="floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-inner">
                      <span className="text-base lg:text-xl" aria-hidden="true">🏦</span>
                    </div>
                    <div>
                      <p className="text-slate-900 text-xs lg:text-sm font-bold tracking-tight">Vault Secured</p>
                      <p className="text-slate-500 text-[10px] lg:text-xs font-medium">Mainnet Verified (177)</p>
                    </div>
                  </div>

                  <div className="floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200 shadow-inner">
                      <span className="text-base lg:text-lg" aria-hidden="true">🤖</span>
                    </div>
                    <div>
                      <p className="text-slate-900 text-xs lg:text-sm font-bold tracking-tight">Agent Deployed</p>
                      <p className="text-slate-500 text-[10px] lg:text-xs font-medium">AP2 Mandates Active</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ACCOUNTABILITY TEXT BLOCK */}
              <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4 w-fit mx-auto lg:mx-0">
                  <span>Regulatory Gate</span>
                </div>
                <h3 className="text-slate-900 text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
                  Compliance,<br className="hidden lg:block"/> redefined.
                </h3>
                <p className="text-slate-600 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none mb-6">
                  <span className="text-slate-900 font-semibold">HashStaking Console</span> empowers corporate treasuries with structured ERC-3643 accountability, precise yield tracking, and secure execution.
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <button
                    onClick={handleLaunchApp}
                    className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Enter Platform →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Institutional Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Institutional Onboarding</h2>
            <p className="text-xs text-slate-500 mb-6">Complete KYC compliance verification to obtain on-chain settlement clearance.</p>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satoshi Nakamoto"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Horizon Capital Management LLC"
                  value={corporateEntity}
                  onChange={(e) => setCorporateEntity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Jurisdiction</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Singapore / Hong Kong"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all text-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Issuing Identity..." : "Submit & Authorize SBT →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Minimal */}
      <footer className="border-t border-slate-200 py-6 px-8 text-center text-xs text-slate-500 bg-white">
        HashStaking Console Architecture • Built for enterprise security on HashKey Chain Mainnet (177)
      </footer>
    </div>
  );
}
