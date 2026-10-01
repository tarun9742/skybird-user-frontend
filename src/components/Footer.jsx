import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSiteContent } from "../api/site";

export default function Footer() {
  const [support, setSupport] = useState({
    email: "support@skybirds.in",
  });

  useEffect(() => {
    let cancelled = false;

    fetchSiteContent()
      .then((res) => {
        if (!cancelled && res.success) {
          setSupport(res.data?.support || {});
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="border-t border-forest/10 bg-white pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-16 w-16 place-items-center rounded-xl bg-black text-xs font-bold text-white">
                <img src="/assets/logo1.png" alt="SkyBirds" />
              </span>

              <span className="text-lg font-bold text-ink">SkyBirds</span>
            </div>

            <p className="text-xs leading-relaxed text-ink/65">
              India's premier marketplace learning & seller onboarding platform.
              Scale your brand across Amazon, Meesho, and Flipkart with
              confidence.
            </p>
          </div>

          {/* Marketplaces */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-forest">
              Marketplaces
            </h4>

            <ul className="space-y-2.5 text-xs text-ink/75">
              <li>
                <Link to="/courses" className="transition hover:text-forest">
                  Amazon FBA Mastery
                </Link>
              </li>

              <li>
                <Link to="/courses" className="transition hover:text-forest">
                  Meesho 0% Commission Strategy
                </Link>
              </li>

              <li>
                <Link to="/courses" className="transition hover:text-forest">
                  Flipkart Assured & PLA Ads
                </Link>
              </li>

              <li>
                <Link to="/courses" className="transition hover:text-forest">
                  Product Hunting & Sourcing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-forest">
              Legal
            </h4>

            <ul className="space-y-2.5 text-xs text-ink/75">
              <li>
                <Link
                  to="/privacy-policy"
                  className="transition hover:text-forest"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="transition hover:text-forest">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-forest">
              Get Support
            </h4>

            <ul className="space-y-2.5 text-xs text-ink/75">
              <li>
                <Link to="/contact" className="transition hover:text-forest">
                  Contact Support Team
                </Link>
              </li>

              <li>
                <Link to="/about" className="transition hover:text-forest">
                  About SkyBirds
                </Link>
              </li>

              <li>
                <Link to="/login" className="transition hover:text-forest">
                  LOGIN
                </Link>
              </li>

              <li className="pt-2 font-semibold text-forest">
                {support.email || "support@skybirds.in"}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-forest/10 pt-6 text-xs text-ink/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} SkyBirds Academy. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="transition hover:text-forest">
              Privacy Policy
            </Link>

            <Link to="/terms" className="transition hover:text-forest">
              Terms & Conditions
            </Link>
          </div>
        </div> 
      </div>
    </footer>
  );
}
 