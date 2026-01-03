"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "@/components/bullpen/CommentSection";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/firebase/config";
import {
    doc,
    updateDoc,
    increment,
    collection,
    setDoc,
    deleteDoc,
    getDoc,
    runTransaction
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { UserProfileHoverCard } from "./UserProfileHoverCard";

export interface PollOption {
    id: number;
    text: string;
    voteCount: number;
}

export interface PollData {
    question: string;
    options: PollOption[];
    totalVotes: number;
    votedUserIds: string[];
}

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl?: string;
    content: string;
    imageUrl?: string;
    poll?: PollData;
    createdAt: any;
    likeCount: number;
    commentCount: number;
}

interface PostCardProps {
    post: Post;
}

export function PostCard({ post }: PostCardProps) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    const [optimisticPoll, setOptimisticPoll] = useState(post.poll);
    const [hasPendingSync, setHasPendingSync] = useState(false);

    // Sync optimistic state with server data
    useEffect(() => {
        if (hasPendingSync) {
            // If we are waiting for our vote to sync, only update if the server confirms it
            const serverHasMyVote = user && post.poll?.votedUserIds.includes(user.uid);
            if (serverHasMyVote) {
                setHasPendingSync(false);
                setOptimisticPoll(post.poll);
            }
            // Otherwise ignore stale updates
            return;
        }
        setOptimisticPoll(post.poll);
    }, [post.poll, hasPendingSync, user]);

    const pollData = optimisticPoll;
    const hasVoted = user && pollData ? pollData.votedUserIds.includes(user.uid) : false;

    // Check if current user liked the post
    useEffect(() => {
        if (!user) return;
        const checkLike = async () => {
            const likeRef = doc(db, "posts", post.id, "likes", user.uid);
            const likeDoc = await getDoc(likeRef);
            setIsLiked(likeDoc.exists());
        };
        checkLike();
    }, [user, post.id]);

    const toggleLike = async () => {
        if (!user) return;

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);

        const postRef = doc(db, "posts", post.id);
        const likeRef = doc(db, "posts", post.id, "likes", user.uid);

        try {
            if (newIsLiked) {
                await setDoc(likeRef, { userId: user.uid, createdAt: new Date() });
                await updateDoc(postRef, { likeCount: increment(1) });
            } else {
                await deleteDoc(likeRef);
                await updateDoc(postRef, { likeCount: increment(-1) });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            setIsLiked(!newIsLiked); // Revert on error
        }
    };

    const handleVote = async (optionId: number) => {
        if (!user || isVoting || hasVoted || !pollData) return;

        setIsVoting(true);
        setHasPendingSync(true); // Ignore updates until our vote is reflected

        const postRef = doc(db, "posts", post.id);

        // Optimistic Update
        const previousPoll = { ...pollData };
        const newOptions = pollData.options.map(opt => {
            if (opt.id === optionId) {
                return { ...opt, voteCount: opt.voteCount + 1 };
            }
            return opt;
        });

        const newPoll = {
            ...pollData,
            options: newOptions,
            totalVotes: pollData.totalVotes + 1,
            votedUserIds: [...pollData.votedUserIds, user.uid]
        };

        setOptimisticPoll(newPoll);

        try {
            await runTransaction(db, async (transaction) => {
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw "Post does not exist!";

                const postData = postDoc.data() as Post;
                const poll = postData.poll;

                if (!poll) throw "Poll does not exist!";
                if (poll.votedUserIds.includes(user.uid)) throw "User already voted!";

                const transOptions = poll.options.map(opt => {
                    if (opt.id === optionId) {
                        return { ...opt, voteCount: opt.voteCount + 1 };
                    }
                    return opt;
                });

                transaction.update(postRef, {
                    "poll.options": transOptions,
                    "poll.totalVotes": poll.totalVotes + 1,
                    "poll.votedUserIds": [...poll.votedUserIds, user.uid]
                });
            });
        } catch (error) {
            console.error("Vote failed: ", error);
            setOptimisticPoll(previousPoll); // Revert
            setHasPendingSync(false); // Stop ignoring updates
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className="border-b border-white/10 p-4 hover:bg-muted/5 transition-colors">
            <div className="flex gap-4">
                <UserProfileHoverCard uid={post.authorId} name={post.authorName} photoUrl={post.authorPhotoUrl}>
                    <Avatar>
                        <AvatarImage src={post.authorPhotoUrl} alt={post.authorName} />
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </UserProfileHoverCard>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <UserProfileHoverCard uid={post.authorId} name={post.authorName} photoUrl={post.authorPhotoUrl}>
                            <span className="font-bold truncate cursor-pointer hover:underline">{post.authorName}</span>
                        </UserProfileHoverCard>
                        <span className="text-muted-foreground text-sm flex-shrink-0">
                            · {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                        </span>
                    </div>

                    <div className="whitespace-pre-wrap mb-3 text-[15px] leading-normal break-words">
                        {post.content}
                    </div>

                    {post.imageUrl && (
                        <div className="mb-3">
                            <img
                                src={post.imageUrl}
                                alt="Post image"
                                className="rounded-lg max-h-[400px] object-cover w-full border border-white/10"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {pollData && (
                        <div className="mb-3 p-3 border border-white/10 rounded-xl space-y-3">
                            <h3 className="font-semibold text-base">{pollData.question}</h3>
                            <div className="space-y-2">
                                {pollData.options.map((option) => {
                                    const percentage = pollData.totalVotes > 0
                                        ? Math.round((option.voteCount / pollData.totalVotes) * 100)
                                        : 0;

                                    return (
                                        <div key={option.id} className="relative group">
                                            {hasVoted ? (
                                                <div className="relative h-10 w-full bg-muted/30 rounded-md overflow-hidden flex items-center px-3">
                                                    <div
                                                        className="absolute left-0 top-0 bottom-0 bg-blue-500/20 transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                    <div className="relative z-10 flex justify-between w-full text-sm font-medium">
                                                        <span>{option.text}</span>
                                                        <span>{percentage}%</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start h-10 px-3 border-blue-500/50 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 transition-colors"
                                                    onClick={() => handleVote(option.id)}
                                                    disabled={isVoting}
                                                >
                                                    {option.text}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {pollData.totalVotes} votes
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-6 text-muted-foreground">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "hover:text-pink-600 hover:bg-pink-50/10 gap-2 px-2",
                                isLiked && "text-pink-600"
                            )}
                            onClick={toggleLike}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                            <span className="text-xs">{post.likeCount || 0}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-blue-500 hover:bg-blue-50/10 gap-2 px-2"
                            onClick={() => setShowComments(!showComments)}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{post.commentCount || 0}</span>
                        </Button>
                    </div>

                    {showComments && <CommentSection postId={post.id} />}
                </div>
            </div>
        </div>
    );
}
