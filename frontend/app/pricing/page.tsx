"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Check, Zap, Shield, Building2, Star, ArrowRight } from "lucide-react";

const PLANS = [
    {
        id: "free",
        name: "Starter",
        price: "R 0",
        period: "/ month",
        tagline: "Perfect for trying out CostCorrect",
        features: [
            "3 estimates / month",
            "Single-floor plans",
            "Stock brick calculations",
            "PDF upload",
            "Basic BOQ export (CSV)",
            "Watermarked PDF report",
        ],
        cta: "Get Started Free",
        href: "/sign-up",
        highlight: false,
        badge: null,
    },
    {
        id: "pro",
        name: "Professional",
        price: "R 499",
        period: "/ month",
        tagline: "Ideal for quantity surveyors & builders",
        features: [
            "Unlimited estimates",
            "Multi-floor plans (up to 10 floors)",
            "Stock + Maxi brick types",
            "Configurable waste % & joint thickness",
            "Openings deduction + lintel count",
            "VAT toggle (15%)",
            "Clean PDF report & CSV/Excel export",
            "Cost estimates in ZAR",
            "Priority AI processing",
        ],
        cta: "Upgrade to Pro",
        href: "#checkout",
        highlight: true,
        badge: "Most Popular",
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "R 1 499",
        period: "/ month",
        tagline: "For large firms and quantity surveyors",
        features: [
            "Everything in Professional",
            "Team seats (up to 10 users)",
            "Custom material price tables",
            "Admin dashboard & audit logs",
            "Priority support (SLA 4h)",
            "API access",
            "Branded reports",
            "POPIA data processing agreement",
        ],
        cta: "Contact Sales",
        href: "mailto:sales@costcorrect.co.za",
        highlight: false,
        badge: null,
    },
];

export default function PricingPage() {
    const { isSignedIn } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
    const [loadingCheckout, setLoadingCheckout] = useState(false);

    const handleCheckout = async () => {
        setLoadingCheckout(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/create-checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    success_url: `${window.location.origin}/dashboard?upgraded=true`,
                    cancel_url: `${window.location.origin}/pricing`,
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            alert("Could not initiate checkout. Please try again.");
        } finally {
            setLoadingCheckout(false);
        }
    };

    return (
        <div className="pricing-page">
            {/* Nav */}
            <header className="pricing-nav">
                <Link href="/" className="logo-text">COSTCORRECT</Link>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {isSignedIn ? (
                        <Link href="/" className="btn-signin">Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/sign-in" className="btn-signin">Sign In</Link>
                            <Link href="/sign-up" className="btn-primary" style={{ marginTop: 0, width: "auto", padding: "0.5rem 1.25rem" }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Hero */}
            <div className="pricing-hero">
                <div className="pricing-badge">
                    <Star size={14} />
                    South Africa-First Pricing — All in ZAR, VAT excluded
                </div>
                <h1>Simple, transparent pricing</h1>
                <p>
                    From sole traders to large QS firms — pay only for what you need.
                    Annual billing saves 20%.
                </p>

                {/* Period Toggle */}
                <div className="billing-toggle">
                    <button
                        className={`billing-btn ${billingPeriod === "monthly" ? "active" : ""}`}
                        onClick={() => setBillingPeriod("monthly")}
                    >Monthly</button>
                    <button
                        className={`billing-btn ${billingPeriod === "annual" ? "active" : ""}`}
                        onClick={() => setBillingPeriod("annual")}
                    >
                        Annual <span className="save-badge">Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Plans */}
            <div className="plans-grid">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`plan-card glass-card ${plan.highlight ? "plan-highlight" : ""}`}
                    >
                        {plan.badge && (
                            <div className="plan-badge"><Zap size={12} /> {plan.badge}</div>
                        )}
                        <div className="plan-header">
                            <p className="plan-name">{plan.name}</p>
                            <div className="plan-price">
                                <span className="price-amount">
                                    {billingPeriod === "annual" && plan.id !== "free"
                                        ? `R ${parseInt(plan.price.replace("R ", "").replace(" ", "")) * 0.8 * 12 / 12}`
                                        : plan.price}
                                </span>
                                <span className="price-period">{plan.period}</span>
                            </div>
                            <p className="plan-tagline">{plan.tagline}</p>
                        </div>

                        <ul className="plan-features">
                            {plan.features.map((f, i) => (
                                <li key={i} className="plan-feature">
                                    <Check size={14} className="feature-check" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {plan.id === "pro" ? (
                            <button
                                className="btn-primary plan-cta"
                                onClick={handleCheckout}
                                disabled={loadingCheckout}
                            >
                                {loadingCheckout ? "Loading…" : plan.cta} {!loadingCheckout && <ArrowRight size={14} />}
                            </button>
                        ) : (
                            <Link href={plan.href} className="btn-primary plan-cta" style={{ textDecoration: "none", justifyContent: "center" }}>
                                {plan.cta} <ArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Trust bar */}
            <div className="trust-bar">
                <div className="trust-item"><Shield size={16} /> POPIA Compliant</div>
                <div className="trust-item"><Building2 size={16} /> SA Brick Standards</div>
                <div className="trust-item"><Check size={16} /> No credit card for Free tier</div>
                <div className="trust-item"><Zap size={16} /> Cancel anytime</div>
            </div>

            {/* FAQ */}
            <div className="faq-section">
                <h2>Common Questions</h2>
                <div className="faq-grid">
                    {[
                        { q: "What brick types are supported?", a: "Standard SA Stock brick (222×106×73mm) and Maxi brick (290×140×90mm). More types planned." },
                        { q: "Is my data stored in South Africa?", a: "Yes — we use Google Cloud africa-south1 (Johannesburg) for storage. Your plans are deleted per your retention settings." },
                        { q: "Can I change my plan?", a: "Yes, you can upgrade or downgrade any time. Downgrades take effect at the end of your billing period." },
                        { q: "Do you support DWG files?", a: "PDF, PNG, and JPG are supported now. DWG/IFC import is on our roadmap (Phase 2)." },
                    ].map(({ q, a }, i) => (
                        <div key={i} className="faq-item glass-card">
                            <p className="faq-q">{q}</p>
                            <p className="faq-a">{a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .pricing-page {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-bottom: 4rem;
        }
        .pricing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          z-index: 100;
        }
        .logo-text { font-size: 1.25rem; font-weight: 800; color: var(--accent); text-decoration: none; letter-spacing: -0.03em; }
        .pricing-hero {
          text-align: center;
          padding: 4rem 1rem 2rem;
        }
        .pricing-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
          background: var(--accent-glow);
          border: 1px solid var(--border-accent);
          border-radius: 24px;
          padding: 0.3rem 0.9rem;
          margin-bottom: 1.5rem;
        }
        .pricing-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .pricing-hero p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 480px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        .billing-toggle {
          display: inline-flex;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 24px;
          padding: 0.25rem;
          gap: 0.25rem;
          margin-bottom: 2rem;
        }
        .billing-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .billing-btn.active {
          background: var(--accent);
          color: white;
        }
        .save-badge {
          background: #10b981;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 8px;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .plan-card {
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .plan-highlight {
          border-color: var(--accent) !important;
          box-shadow: var(--shadow-md), var(--shadow-glow) !important;
        }
        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%) translateY(-50%);
          background: var(--gradient-accent);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.9rem;
          border-radius: 24px;
          white-space: nowrap;
        }
        .plan-header { margin-bottom: 1.5rem; }
        .plan-name { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 0.5rem; }
        .plan-price { display: flex; align-items: baseline; gap: 0.25rem; margin-bottom: 0.5rem; }
        .price-amount { font-size: 2.25rem; font-weight: 800; color: var(--text-primary); }
        .price-period { color: var(--text-muted); font-size: 0.9rem; }
        .plan-tagline { color: var(--text-secondary); font-size: 0.875rem; }
        .plan-features { list-style: none; margin: 0 0 1.5rem; padding: 0; flex: 1; }
        .plan-feature { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.4rem 0; font-size: 0.9rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-subtle); }
        .plan-feature:last-child { border-bottom: none; }
        .feature-check { color: #10b981; flex-shrink: 0; margin-top: 2px; }
        .plan-cta { margin-top: auto; width: 100%; display: inline-flex; align-items: center; gap: 0.5rem; }
        .trust-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          padding: 2rem;
          margin-top: 3rem;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }
        .trust-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
        .faq-section { max-width: 900px; margin: 3rem auto; padding: 0 1.5rem; text-align: center; }
        .faq-section h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; }
        .faq-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1rem; text-align: left; }
        .faq-item { padding: 1.25rem; }
        .faq-q { font-weight: 700; margin-bottom: 0.5rem; font-size: 0.95rem; }
        .faq-a { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6; }
      `}</style>
        </div>
    );
}
