'use client'

interface QtyCounterProps {
  value: number;
  onChange: (n: number) => void;
}

export default function QtyCounter({ value, onChange }: QtyCounterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onChange(val);
    } else if (e.target.value === '') {
      onChange(1);
    }
  };

  return (
    <div className="inline-flex items-center rounded-xl border bg-white px-2">
      <button 
        className="px-2 py-1 text-lg text-gray-500 hover:text-gray-800 disabled:opacity-50" 
        onClick={() => onChange(value - 1)} 
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input 
        className="w-10 border-none bg-transparent text-center outline-none" 
        value={value} 
        onChange={handleChange}
        type="number"
        min="1"
        max="99"
        aria-label="Current quantity"
      />
      <button 
        className="px-2 py-1 text-lg text-gray-500 hover:text-gray-800 disabled:opacity-50" 
        onClick={() => onChange(value + 1)}
        disabled={value >= 99}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
