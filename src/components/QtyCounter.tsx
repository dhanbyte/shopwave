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
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-10">
      <button 
        className="px-4 h-full text-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center w-10"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <div className="px-4 py-2 border-x border-gray-300 text-center min-w-[40px] h-full flex items-center justify-center bg-white">
        {value}
      </div>
      <button 
        className="px-4 h-full text-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center w-10"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
