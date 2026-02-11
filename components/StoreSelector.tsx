'use client';

import { useState, useRef, useEffect } from 'react';

interface StoreSelectorProps {
  value: string;
  onChange: (store: string) => void;
}

const SAMPLE_STORES = [
  'allbirds.myshopify.com',
  'gymshark.myshopify.com',
  'fashionnova.myshopify.com',
  'kyliecosmetics.myshopify.com',
  'bombas.myshopify.com',
  'brooklinen.myshopify.com',
  'mvmtwatches.myshopify.com',
  'ruggable.myshopify.com',
];

export default function StoreSelector({ value, onChange }: StoreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredStores = SAMPLE_STORES.filter((store) =>
    store.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (store: string) => {
    setInputValue(store);
    onChange(store);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="te-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="te-label">Store</span>
        <div className="flex items-center gap-2">
          <div className="te-led green" />
          <span className="text-[9px] font-bold uppercase text-[var(--muted)]">Live</span>
        </div>
      </div>

      {/* Display showing current store */}
      <div className="te-display p-3 mb-3">
        <div className="te-display-text text-sm truncate font-bold">
          {value || 'NO STORE'}
        </div>
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="Enter store URL..."
          className="w-full te-display px-3 py-2 text-xs te-display-text focus:outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
        />

        {isOpen && filteredStores.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 te-display z-10 max-h-40 overflow-y-auto"
          >
            {filteredStores.map((store) => (
              <button
                key={store}
                onClick={() => handleSelect(store)}
                className="w-full text-left px-3 py-2 text-[10px] te-display-text hover:bg-[var(--accent-green)]/20 transition-colors"
              >
                {store}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="te-label mt-2 text-[8px]">
        Demo Mode • Simulated Events
      </p>
    </div>
  );
}
