/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldAlert, Sparkles, Check, X, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title?: string;
  message?: string;
  limitType?: "vehicle" | "spare_parts" | "business_staff" | "general";
  currentLimit?: number;
  planName?: string;
}

export const PackageLimitReachedModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUpgrade,
  title = "Package Limit Reached",
  message,
  limitType = "general",
  currentLimit,
  planName = "Free"
}) => {
  if (!isOpen) return null;

  const getLimitDetails = () => {
    switch (limitType) {
      case "vehicle":
        return {
          icon: <Star className="w-8 h-8 text-amber-400" />,
          desc: "You have reached your registered vehicle limit.",
          features: [
            "Add up to 5 vehicles on Home plan or 30 on Pro",
            "Generate detailed AI Diagnostic and Weakness Reports",
            "Schedule automatic maintenance alerts",
            "Generate unique secure QR inspection stickers"
          ]
        };
      case "spare_parts":
        return {
          icon: <Star className="w-8 h-8 text-amber-400" />,
          desc: "You have reached your spare parts listing limit.",
          features: [
            "Post more active items in the Cambodian parts feed",
            "Get instant visibility with featured and boosted listings",
            "Access live parts compatibility check tools",
            "In-app Chat with prospective buyers directly"
          ]
        };
      case "business_staff":
        return {
          icon: <Star className="w-8 h-8 text-amber-400" />,
          desc: "You have reached your team/staff member limit.",
          features: [
            "Collaborate with your workshop mechanics & managers",
            "Assign tasks and review service logs dynamically",
            "Real-time diagnostic report synchronization",
            "Professional garage verified partner badge"
          ]
        };
      default:
        return {
          icon: <Star className="w-8 h-8 text-amber-400" />,
          desc: "Action limit reached for your subscription plan.",
          features: [
            "Unlock unlimited system actions & reports",
            "Activate AI-Powered smart diagnostic assistants",
            "Get Priority support & verified business profile",
            "Higher limits across all tools and workspaces"
          ]
        };
    }
  };

  const details = getLimitDetails();
  const displayMessage = message || `Your current "${planName}" subscription plan has a limit of ${currentLimit !== undefined ? currentLimit : "the maximum"} active records for this feature. Upgrade to unlock higher limits and premium tools.`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full text-slate-200 shadow-2xl relative overflow-hidden"
          id="package-limit-reached-modal"
        >
          {/* Top Decorative Premium Background Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Close modal"
            id="close-limit-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-2 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 mb-3 animate-pulse">
              {details.icon}
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight leading-none mb-2" id="limit-modal-title">
              {title}
            </h3>
            <p className="text-xs text-amber-400/90 font-semibold tracking-wide uppercase px-2 py-0.5 bg-amber-500/5 rounded-full border border-amber-500/10 mb-4">
              {details.desc}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed px-1">
              {displayMessage}
            </p>
          </div>

          <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 mb-6">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Premium Benefits</span>
            </h4>
            <ul className="space-y-2.5 text-left">
              {details.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="p-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150"
              id="dismiss-limit-modal-btn"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition duration-150"
              id="upgrade-limit-modal-btn"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
