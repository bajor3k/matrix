"use client";

import { useState, useEffect } from "react";
import { CreatePost } from "./CreatePost";
import { PostCard, Post } from "./PostCard";
import { db } from "@/firebase/config";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Feed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const q = query(
            collection(db, "posts"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            if (snapshot.metadata.hasPendingWrites) {
                console.log("Feed: Local update (Sync pending...)");
            }

            const newPosts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Post[];

            const sortedPosts = [...newPosts].sort((a, b) => {
                // For pending posts, use current time as fallback
                const dateA = a.createdAt?.toDate?.() || new Date();
                const dateB = b.createdAt?.toDate?.() || new Date();
                return dateB.getTime() - dateA.getTime();
            });
            console.log("Feed sorted. Top post ID:", sortedPosts[0]?.id);
            setPosts(sortedPosts);
            setLoading(false);
        });

        // Fallback: stop loading after 5s if firebase is slow/offline
        const timer = setTimeout(() => setLoading(false), 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        }
    }, []);

    const filteredPosts = posts.filter(post =>
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full max-w-2xl mx-auto border-x border-gray-200 dark:border-white/10 min-h-screen">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 p-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-9 bg-background/50 border-gray-300 dark:border-white/10 focus-visible:ring-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <CreatePost />

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="divide-y divide-white/10">
                    {filteredPosts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchTerm ? "No posts found matching your search." : "No posts yet. Be the first to post!"}
                        </div>
                    )}
                    {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}
