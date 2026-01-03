"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { db } from "@/firebase/config";
import { collection, query, where, getDocs, doc, getDoc, collectionGroup } from "firebase/firestore";
import { CalendarDays, MapPin, Quote, Cake } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { getProfileData } from "@/lib/profile-utils";

interface UserProfileHoverCardProps {
    uid: string;
    name: string;
    photoUrl?: string;
    children: React.ReactNode;
}

interface UserStats {
    postsCount: number;
    likesReceived: number;
    commentsCount: number;
}

export function UserProfileHoverCard({ uid, name, photoUrl, children }: UserProfileHoverCardProps) {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [bio, setBio] = useState<string | null>(null);
    const [joinedDate, setJoinedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [customProfile, setCustomProfile] = useState<any>(null);

    useEffect(() => {
        if (!isOpen || stats) return; // Don't fetch if closed or already fetched

        const fetchData = async () => {
            setLoading(true);
            try {
                // Load custom profile data from localStorage
                const profileData = getProfileData(uid);
                setCustomProfile(profileData);

                // 1. Fetch User Profile (Bio, Join Date) - Optional
                // We assume a 'users' collection might exist, or handled gracefully if not
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setBio(data.bio || "No bio available.");
                    if (data.joinedAt?.toDate) setJoinedDate(data.joinedAt.toDate());
                    else if (data.createdAt?.toDate) setJoinedDate(data.createdAt.toDate());
                } else {
                    setBio("Matrix Member"); // Default
                }

                // 2. Fetch Stats
                // Posts & Likes
                const postsQ = query(collection(db, "posts"), where("authorId", "==", uid));
                const postsSnap = await getDocs(postsQ);
                const postsCount = postsSnap.size;
                const likesReceived = postsSnap.docs.reduce((sum, doc) => sum + (doc.data().likeCount || 0), 0);

                // Comments (Collection Group for scalability)
                // Note: requires 'authorId' on comments.
                const commentsQ = query(collectionGroup(db, "comments"), where("authorId", "==", uid));
                const commentsSnap = await getDocs(commentsQ);
                const commentsCount = commentsSnap.size;

                setStats({ postsCount, likesReceived, commentsCount });

            } catch (error) {
                console.error("Error fetching user stats:", error);
                setStats({ postsCount: 0, likesReceived: 0, commentsCount: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, uid, stats]);

    return (
        <HoverCard open={isOpen} onOpenChange={setIsOpen}>
            <HoverCardTrigger asChild>
                <div className="cursor-pointer hover:underline decoration-blue-500/50 underline-offset-2">
                    {children}
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 border-white/10 bg-black/90 backdrop-blur-xl">
                <div className="flex justify-between space-x-4">
                    <Avatar>
                        <AvatarImage src={customProfile?.photoUrl || photoUrl} />
                        <AvatarFallback>{(customProfile?.name || name).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{customProfile?.name || name}</h4>
                        <p className="text-sm text-muted-foreground">
                            {bio || (loading ? "Loading..." : "Matrix Member")}
                        </p>
                        {customProfile?.dob && (
                            <div className="flex items-center pt-2">
                                <Cake className="mr-2 h-4 w-4 opacity-70" />
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(customProfile.dob), 'MMMM d, yyyy')}
                                </span>
                            </div>
                        )}
                        {!customProfile?.dob && joinedDate && (
                            <div className="flex items-center pt-2">
                                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                                <span className="text-xs text-muted-foreground">
                                    {`Member for ${formatDistanceToNow(joinedDate)}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                    <div className="text-center">
                        <div className="text-lg font-bold">
                            {loading || !stats ? "-" : stats.postsCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold">
                            {loading || !stats ? "-" : stats.likesReceived}
                        </div>
                        <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold">
                            {loading || !stats ? "-" : stats.commentsCount}
                        </div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
