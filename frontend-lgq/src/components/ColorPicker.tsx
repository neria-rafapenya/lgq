type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  palette?: string[];
};

const DEFAULT_COLORS = [
  "#F5F0E6",
  "#E9E1D4",
  "#D8C7B0",
  "#C2A98E",
  "#A98B73",
  "#8C6D54",
  "#6B4F3B",
  "#3F2E24",
  "#F7F7F7",
  "#DDE2E6",
  "#B4BCC4",
  "#7E8A96",
  "#45515E",
  "#1F1D1B",
  "#C26C34",
  "#B0121F",
];

const ColorPicker = ({ value, onChange, label, palette }: ColorPickerProps) => {
  const colors = palette && palette.length > 0 ? palette : DEFAULT_COLORS;

  return (
    <div className="color-picker">
      {label && <label className="color-picker__label">{label}</label>}
      <div className="color-picker__row">
        <input
          className="form-control"
          type="text"
          value={value}
          placeholder="#FFFFFF"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div className="color-picker__palette">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-picker__chip ${
              value.toLowerCase() === color.toLowerCase() ? "is-active" : ""
            }`}
            onClick={() => onChange(color)}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
