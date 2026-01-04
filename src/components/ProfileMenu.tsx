"use client";

import React, { useState } from 'react';
import { MoreVertical, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ProfileModal } from '@/components/ProfileModal';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function ProfileMenu() {
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const { signOutGoogle } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOutGoogle();
            router.push('/');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Profile menu"
                        title="Profile menu"
                        className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-white/10">
                    <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-100 focus:bg-red-600 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}
