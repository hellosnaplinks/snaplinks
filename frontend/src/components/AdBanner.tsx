const AdBanner = () => {
  return (
    <div className="w-[300px] h-[600px] bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-700/30 flex flex-col shrink-0">
      <div className="text-[10px] text-center py-1 text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">Advertisement</div>
      <div className="flex-1 w-full bg-slate-100/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <span className="text-sm font-medium text-center px-4">Vertical Ad Space</span>
        <span className="text-xs mt-2 opacity-70">300 x 600</span>
      </div>
    </div>
  );
};

export default AdBanner;
