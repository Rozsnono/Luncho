'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Layers, User, UtensilsCrossed } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between shadow-xs">
            {/* Brand */}
            <Link href="/" className="flex items-center space-x-2 text-[#d9222a]">
                <div className="p-1.5 rounded-lg bg-red-50 text-[#d9222a]">
                    <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-[#d9222a]">Luncho</span>
            </Link>

            {/* Nav Actions matching Screenshot design */}
            <div className="flex items-center space-x-1">
                <Link
                    href="/admin/calendar"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-t-md text-sm font-medium transition-all ${pathname.includes('/calendar') || pathname === '/'
                            ? 'bg-[#ffe8e8] text-[#c01c24] border-b-2 border-[#c01c24]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <CalendarDays className="w-4 h-4 text-[#c01c24]" />
                    <div className="flex flex-col text-left leading-tight">
                        <span className="font-semibold">Dashboard</span>
                        <span className="text-[10px] text-red-500 font-normal">current month</span>
                    </div>
                </Link>

                <Link
                    href="/admin/foods"
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${pathname === '/admin/foods'
                            ? 'bg-gray-100 text-gray-900 font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    <span>Manage Foods</span>
                </Link>

                <button className="flex items-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    <span>Account</span>
                </button>
            </div>
        </header>
    );
}