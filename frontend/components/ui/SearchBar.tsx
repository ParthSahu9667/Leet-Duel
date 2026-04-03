import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (users: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex justify-center w-full max-w-3xl mb-12 mx-auto z-20">
      <div className="relative w-full flex items-center glass-card px-6 py-3 rounded-full shadow-[0_0_40px_rgba(112,0,255,0.15)] ring-1 ring-white/10">
        <Search className="text-fuchsia-400 w-6 h-6 mr-4" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter usernames, e.g. TheEgoist_, The_PuppetMaster"
          className="bg-transparent text-white outline-none w-full placeholder-gray-500 font-medium text-lg"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="ml-4 px-8 py-2.5 bg-gradient-to-r from-[#7000ff] to-[#a25aff] hover:from-[#5a00cc] hover:to-[#8a33ff] transition-all rounded-full text-white font-bold text-sm shadow-[0_0_20px_rgba(112,0,255,0.4)] disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Scanning...' : 'Compare'}
        </button>
      </div>
    </form>
  );
};
