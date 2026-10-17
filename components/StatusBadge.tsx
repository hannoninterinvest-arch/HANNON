export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  const map: Record<string, string> = {
    pending: "bg-[#f4ead2] text-[#8a6a24]",
    approved: "bg-[#e5f2ea] text-[#1f6b3a]",
    accepted: "bg-[#e5f2ea] text-[#1f6b3a]",
    rejected: "bg-[#f8e4e4] text-[#8a2a2a]",
    open: "bg-[#e7eef8] text-[#1d3d6e]",
    funded: "bg-[#e5f2ea] text-[#1f6b3a]",
    closed: "bg-[#eee] text-[#555]",
    draft: "bg-[#f4ead2] text-[#8a6a24]",
    published: "bg-[#e5f2ea] text-[#1f6b3a]",
    nouveau: "bg-[#e7eef8] text-[#1d3d6e]",
    "traité": "bg-[#e5f2ea] text-[#1f6b3a]",
    proposition: "bg-[#f4ead2] text-[#8a6a24]",
    question: "bg-[#e7eef8] text-[#1d3d6e]",
    interest: "bg-[#f4ead2] text-[#8a6a24]",
  };
  const labels: Record<string, string> = {
    draft: "Draft",
    published: "Published",
    nouveau: "New",
    "traité": "Handled",
    proposition: "Proposal",
    question: "Question",
    interest: "Investment interest",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[1px] ${
        map[status] || "bg-[#eee] text-[#555]"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
