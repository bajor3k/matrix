import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { db } from "@/firebase/config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    increment,
    doc,
    updateDoc
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoUrl?: string;
    content: string;
    imageUrl?: string;
    createdAt: any; // Firestore Timestamp
}

interface CommentSectionProps {
    postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const q = query(
            collection(db, "posts", postId, "comments"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newComments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Comment[];
            setComments(newComments);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePostComment = async () => {
        if ((!newComment.trim() && !selectedFile) || !user) return;

        setIsSubmitting(true);
        try {
            let imageUrl = "";

            if (selectedFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `comment-images/${postId}/${Date.now()}_${selectedFile.name}`);
                const snapshot = await uploadBytes(storageRef, selectedFile);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            // Add comment
            await addDoc(collection(db, "posts", postId, "comments"), {
                authorId: user.uid,
                authorName: user.displayName || "Anonymous",
                authorPhotoUrl: user.photoURL,
                content: newComment.trim(),
                imageUrl: imageUrl || null,
                createdAt: serverTimestamp(),
            });

            // Update post comment count
            const postRef = doc(db, "posts", postId);
            await updateDoc(postRef, {
                commentCount: increment(1)
            });

            setNewComment("");
            removeFile();
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-4 space-y-4">
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.authorPhotoUrl} />
                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{comment.authorName}</span>
                            <span className="text-xs text-muted-foreground">
                                {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                            </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                        {comment.imageUrl && (
                            <div className="mt-2">
                                <img
                                    src={comment.imageUrl}
                                    alt="Comment attachment"
                                    className="rounded-md max-h-[200px] object-cover border border-white/10"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {user && (
                <div className="flex gap-2 mt-4 items-start">
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        {previewUrl && (
                            <div className="relative inline-block">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-20 w-20 object-cover rounded-md border border-white/10"
                                />
                                <button
                                    onClick={removeFile}
                                    className="absolute -top-1 -right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Post your reply..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handlePostComment();
                                        }
                                    }}
                                    className="pr-10"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*,image/gif"
                                        onChange={handleFileSelect}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                disabled={(!newComment.trim() && !selectedFile) || isSubmitting}
                                onClick={handlePostComment}
                                className="px-4"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reply"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
