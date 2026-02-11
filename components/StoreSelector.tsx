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
    <div className="te-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="te-label">Store</span>
        <div className="te-led active" />
      </div>

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
          className="w-full bg-[var(--background)] border border-[var(--border)] px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
        />

        {isOpen && filteredStores.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] z-10 max-h-48 overflow-y-auto"
          >
            {filteredStores.map((store) => (
              <button
                key={store}
                onClick={() => handleSelect(store)}
                className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-[var(--border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {store}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="te-label mt-3 text-[var(--muted)]">
        Demo mode • Simulated events
      </p>
    </div>
  );
}
