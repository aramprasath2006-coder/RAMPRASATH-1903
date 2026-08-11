import React, { useState } from "react";
import { CivicIssue } from "../types";

interface ActionProofModalProps {
  issue: CivicIssue;
  onClose: () => void;
  onSubmitProof: (issueId: string, proofData: {
    beforeImageUrl: string;
    afterImageUrl: string;
    remarks: string;
    officerName: string;
  }) => void;
}

export const ActionProofModal: React.FC<ActionProofModalProps> = ({
  issue,
  onClose,
  onSubmitProof,
}) => {
  const [beforeImage, setBeforeImage] = useState(
    issue.imageUrl ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARVbYeYYJIsFogar6F1gDfV249dQh_ulQcHiVpf-nu8s1xon_C0v7awA9sEUvtKpDoaFEJ4U-Oj51iudElewR7ne2lWV2oyeutzGlIjgEAWaUVDOyTyWhrdD04NkcVP1-1W22oD7flrrOGw2QEiRWzD7LebZ5iiroNi_0ZSIGAuaws_vtK5LS96QCQ5QITNZJbt5scLcDXRr0fWgUPqc-hCorU0nxOk3NBz4kgbeoG8NAo54T2epzL"
  );
  const [afterImage, setAfterImage] = useState(
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
  );
  const [remarks, setRemarks] = useState(
    "Site inspected and issue resolved as per municipal engineering standard protocols."
  );
  const [officerName, setOfficerName] = useState("Officer S. Murugan (Junior Engineer)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleAfterImages = [
    {
      title: "Cleaned / Repaired Road",
      url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Cleared Dumpster Site",
      url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Restored Utility Infrastructure",
      url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitProof(issue.id, {
        beforeImageUrl: beforeImage,
        afterImageUrl: afterImage,
        remarks,
        officerName,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-white/20 text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer border border-white/10"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide">Submit Action Proof & Resolution</h2>
            <p className="text-xs text-white/60">
              Ticket #{issue.ticketId || issue.id} • {issue.department}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Officer Name */}
          <div>
            <label className="block font-bold text-white/70 uppercase tracking-wider text-[10px] mb-1">
              Officer Name & Role
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Before and After Image Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Before Photo */}
            <div>
              <label className="block font-bold text-red-400 uppercase tracking-wider text-[10px] mb-1">
                📷 Before Photo (Complaint Evidence)
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-white/15 h-36 bg-black">
                <img
                  src={beforeImage}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-red-500/80 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded">
                  Original Issue
                </span>
              </div>
            </div>

            {/* After Photo */}
            <div>
              <label className="block font-bold text-emerald-400 uppercase tracking-wider text-[10px] mb-1">
                📸 After Photo (Resolution Proof)
              </label>
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 h-36 bg-black">
                <img
                  src={afterImage}
                  alt="After"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-emerald-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded">
                  Resolved Proof
                </span>
              </div>
            </div>
          </div>

          {/* Sample After Image Selector */}
          <div>
            <label className="block font-bold text-white/70 uppercase tracking-wider text-[10px] mb-1.5">
              Select Sample Resolution Proof Photo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sampleAfterImages.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAfterImage(sample.url)}
                  className={`relative rounded-xl overflow-hidden border text-left h-16 transition-all cursor-pointer ${
                    afterImage === sample.url
                      ? "border-emerald-500 ring-2 ring-emerald-500/50"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={sample.url} alt={sample.title} className="w-full h-full object-cover opacity-80" />
                  <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white bg-black/70 px-1 rounded truncate">
                    {sample.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Officer Action Remarks */}
          <div>
            <label className="block font-bold text-white/70 uppercase tracking-wider text-[10px] mb-1">
              Officer Action Remarks & Technical Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Describe work performed, materials used, crew members assigned..."
              className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-medium"
              required
            />
          </div>

          {/* Submit Note */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg shrink-0 mt-0.5">
              info
            </span>
            <span>
              Submitting proof changes status to <strong>Awaiting Citizen Verification</strong>. The citizen reporter will be notified to verify and close or reopen the ticket.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 bg-white/10 text-white font-bold uppercase tracking-wider py-3 rounded-xl hover:bg-white/20 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              {isSubmitting ? "Submitting Proof..." : "Submit Proof & Request Citizen Verification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
