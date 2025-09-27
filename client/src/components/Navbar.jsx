import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <div className="flex items-center space-x-3">
        <img src="logo.png" alt="Logo" className="w-12 h-12 object-contain" />
      </div>
      <div>
        <ConnectButton />
      </div>
    </nav>
  );
}
