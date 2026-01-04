"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "@/components/bullpen/CommentSection";
import { StockTickerHoverCard } from "@/components/bullpen/StockTickerHoverCard";
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
    runTransaction,
    serverTimestamp,
    arrayUnion,
    Timestamp
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

export interface EditHistory {
    editedAt: Timestamp;
    previousContent: string;
}

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl?: string;
    content: string;
    imageUrl?: string;
    gifUrl?: string;
    poll?: PollData;
    createdAt: any;
    likeCount: number;
    commentCount: number;
    editedAt?: Timestamp;
    editHistory?: EditHistory[];
}

interface PostCardProps {
    post: Post;
}

export function PostCard({ post }: PostCardProps) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [localContent, setLocalContent] = useState(post.content);
    const [localEditedAt, setLocalEditedAt] = useState(post.editedAt);
    const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);

    // Sync with prop changes
    useEffect(() => {
        setEditedContent(post.content);
        setLocalContent(post.content);
        setLocalEditedAt(post.editedAt);
        setLocalLikeCount(post.likeCount || 0);
    }, [post.content, post.editedAt, post.likeCount]);

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
        const previousLikeCount = localLikeCount;

        setIsLiked(newIsLiked);
        setLocalLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

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
            setLocalLikeCount(previousLikeCount); // Revert on error
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

    const handleDelete = async () => {
        if (!user || user.uid !== post.authorId) return;

        try {
            await deleteDoc(doc(db, "posts", post.id));
            // Note: In a real app, you'd also want to delete subcollections (likes, comments)
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const handleEdit = async () => {
        if (!user || user.uid !== post.authorId || !editedContent.trim()) return;

        // Optimistic update
        const now = new Date();
        setLocalContent(editedContent);
        setLocalEditedAt({ toDate: () => now } as Timestamp);
        setIsEditing(false);

        try {
            const postRef = doc(db, "posts", post.id);
            await updateDoc(postRef, {
                content: editedContent,
                editedAt: serverTimestamp(),
                editHistory: arrayUnion({
                    editedAt: now,  // Use plain Date object, not serverTimestamp()
                    previousContent: post.content
                })
            });
        } catch (error) {
            console.error("Error editing post:", error);
            // Revert on error
            setLocalContent(post.content);
            setLocalEditedAt(post.editedAt);
        }
    };

    const cancelEdit = () => {
        setEditedContent(post.content);
        setIsEditing(false);
    };

    // Parse content and render stock tickers as interactive elements
    const renderContentWithTickers = (content: string) => {
        if (!content) return null;

        // Match @TICKER patterns (1-5 uppercase letters)
        const tickerRegex = /@([A-Z]{1,5})\b/g;
        const parts: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        let match;

        while ((match = tickerRegex.exec(content)) !== null) {
            // Add text before the ticker
            if (match.index > lastIndex) {
                parts.push(content.slice(lastIndex, match.index));
            }

            // Add the ticker as an interactive element
            const ticker = match[1];
            parts.push(
                <StockTickerHoverCard key={`${match.index}-${ticker}`} ticker={ticker}>
                    <span className="text-blue-500 hover:text-blue-400 cursor-pointer font-semibold">
                        @{ticker}
                    </span>
                </StockTickerHoverCard>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push(content.slice(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    return (
        <div className="border-b border-gray-200 dark:border-white/10 p-4 hover:bg-muted/5 transition-colors">
            <div className="flex gap-4">
                <UserProfileHoverCard uid={post.authorId} name={post.authorName} photoUrl={post.authorPhotoUrl}>
                    <Avatar>
                        <AvatarImage src={post.authorPhotoUrl} alt={post.authorName} />
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </UserProfileHoverCard>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <UserProfileHoverCard uid={post.authorId} name={post.authorName} photoUrl={post.authorPhotoUrl}>
                                <span className="font-bold truncate cursor-pointer hover:underline">{post.authorName}</span>
                            </UserProfileHoverCard>
                            <span className="text-muted-foreground text-sm flex-shrink-0">
                                · {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                            </span>
                        </div>

                        {user && user.uid === post.authorId && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-white/10">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="mb-3 space-y-2">
                            <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleEdit} size="sm">
                                    Save
                                </Button>
                                <Button onClick={cancelEdit} size="sm" variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="whitespace-pre-wrap mb-3 text-[15px] leading-normal break-words">
                                {renderContentWithTickers(localContent)}
                            </div>
                            {localEditedAt && (
                                <div className="text-xs text-muted-foreground mb-2">
                                    Edited {localEditedAt?.toDate ? formatDistanceToNow(localEditedAt.toDate(), { addSuffix: true }) : "recently"}
                                </div>
                            )}
                        </>
                    )}

                    {post.imageUrl && (
                        <div className="mb-3">
                            <img
                                src={post.imageUrl}
                                alt="Post image"
                                className="rounded-lg max-h-[400px] object-cover w-full border border-gray-200 dark:border-white/10"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}



                    {post.gifUrl && (
                        <div className="mb-3">
                            <img
                                src={post.gifUrl}
                                alt="Post GIF"
                                className="rounded-lg max-h-[400px] object-cover w-full border border-gray-200 dark:border-white/10"
                            />
                        </div>
                    )}

                    {pollData && (
                        <div className="mb-3 p-3 border border-gray-200 dark:border-white/10 rounded-xl space-y-3">
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
                            <span className="text-xs">{localLikeCount}</span>
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

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
