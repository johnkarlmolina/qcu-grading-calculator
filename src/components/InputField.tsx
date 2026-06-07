import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  sublabel: string;
  value: number | '';
  onChange: (val: number | '') => void;
  /** Font Awesome class string, e.g. "fa-solid fa-clipboard-list" */
  iconClass: string;
  accentColor: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  sublabel,
  value,
  onChange,
  iconClass,
  accentColor,
}) => {
  const numericValue = value === '' ? 0 : value;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      onChange(Math.min(100, Math.max(0, num)));
    }
  };

  const handleRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="group flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center gap-2">
        {/* Mini neon icon box */}
        <span
          className="input-icon-box transition-transform duration-200 group-hover:scale-110"
          style={
            {
              '--icon-color': accentColor,
              '--icon-bg': accentColor + '18',
              '--icon-border': accentColor + 'aa',
              '--icon-glow': accentColor + '88',
            } as React.CSSProperties
          }
        >
          <i className={`${iconClass} input-icon-glyph`} />
        </span>

        <div>
          <label htmlFor={id} className="block text-sm font-600 text-slate-200 leading-none">
            {label}
          </label>
          <span className="text-xs text-slate-500">{sublabel}</span>
        </div>

        <span
          className="ml-auto text-lg font-800 tabular-nums"
          style={{ color: accentColor }}
        >
          {value === '' ? '–' : numericValue.toFixed(1)}
          <span className="text-xs font-400 text-slate-500 ml-0.5">%</span>
        </span>
      </div>

      {/* Number input */}
      <input
        id={id}
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={handleInput}
        placeholder="0 – 100"
        className="
          w-full px-4 py-3 rounded-xl text-base font-500 text-slate-100
          bg-slate-800/60 border border-slate-700/60
          focus:outline-none focus:ring-2 focus:border-transparent
          placeholder:text-slate-600
          transition-all duration-200
        "
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={numericValue}
        onChange={handleRange}
        aria-label={`${label} slider`}
        className="w-full"
        style={{ accentColor }}
      />
    </div>
  );
};

export default InputField;
