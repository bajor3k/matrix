import { useState, useRef } from "react";
import { Image as ImageIcon, Smile, X, BarChart2, FileVideo, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { db, storage } from "@/firebase/config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function CreatePost() {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Media State
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const gifInputRef = useRef<HTMLInputElement>(null);

    // Poll State
    const [showPoll, setShowPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("Media must be less than 5MB");
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (gifInputRef.current) gifInputRef.current.value = "";
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setContent((prev) => prev + emojiData.emoji);
    };

    // Poll Logic
    const handleAddOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, ""]);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const removePoll = () => {
        setShowPoll(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
    };

    const handleSubmit = async () => {
        const postContent = content.trim();

        // Validation
        const hasPoll = showPoll && pollQuestion.trim() && pollOptions.every(o => o.trim());
        if (showPoll && !hasPoll) {
            setError("Please complete the poll (Question + 2 Options)");
            return;
        }

        if ((!postContent && !selectedImage && !hasPoll) || !user) return;

        // Optimistically clear UI
        const tempContent = content;
        const tempImage = selectedImage;
        const tempPreview = imagePreview;
        const tempPoll = { show: showPoll, q: pollQuestion, o: pollOptions };

        setContent("");
        setSelectedImage(null);
        setImagePreview(null);
        removePoll();
        setError(null);

        try {
            let imageUrl = null;
            let pollData = null;

            // Upload image
            if (selectedImage) {
                const storageRef = ref(storage, `posts_images/${user.uid}/${Date.now()}_${selectedImage.name}`);
                await uploadBytes(storageRef, selectedImage);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Construct Poll Data
            if (hasPoll) {
                pollData = {
                    question: pollQuestion,
                    options: pollOptions.map((text, index) => ({
                        id: index,
                        text: text.trim(),
                        voteCount: 0
                    })),
                    totalVotes: 0,
                    votedUserIds: []
                };
            }

            // Create Post
            await addDoc(collection(db, "posts"), {
                authorId: user.uid,
                authorName: user.displayName || "Anonymous",
                authorPhotoUrl: user.photoURL,
                content: postContent,
                imageUrl: imageUrl,
                poll: pollData, // Add poll if exists
                createdAt: serverTimestamp(),
                likeCount: 0,
                commentCount: 0,
            });

        } catch (err: any) {
            console.error("Error creating post:", err);
            setError("Failed to post. Please try again.");
            // Restore state
            setContent(tempContent);
            setSelectedImage(tempImage);
            setImagePreview(tempPreview);
            if (tempPoll.show) {
                setShowPoll(true);
                setPollQuestion(tempPoll.q);
                setPollOptions(tempPoll.o);
            }
        }
    };

    if (!user) {
        return (
            <div className="p-4 border border-white/10 rounded-lg bg-muted/50 text-center text-muted-foreground">
                Please sign in to post in the Bullpen.
            </div>
        );
    }

    return (
        <div className="flex gap-4 p-4 border-b border-white/10">
            <Avatar>
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <Textarea
                    placeholder="What's happening?"
                    className="min-h-[50px] border-none focus-visible:ring-0 resize-none p-2 text-lg"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {imagePreview && (
                    <div className="relative mt-2 mb-2 w-fit">
                        <img src={imagePreview} alt="Preview" className="max-h-60 rounded-lg object-cover" />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                            onClick={removeImage}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {showPoll && (
                    <div className="mt-3 p-3 border border-white/10 rounded-xl space-y-3 bg-muted/5">
                        <div className="flex justify-between items-center">
                            <Input
                                placeholder="Ask a question..."
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                className="border-none bg-transparent text-lg font-medium placeholder:text-muted-foreground/70 focus-visible:ring-0 px-0"
                            />
                            <Button variant="ghost" size="sm" onClick={removePoll} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {pollOptions.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`Option ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="bg-background/50 border-white/10"
                                    />
                                    {index >= 2 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                const newOptions = pollOptions.filter((_, i) => i !== index);
                                                setPollOptions(newOptions);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {pollOptions.length < 4 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAddOption}
                                className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Option
                            </Button>
                        )}
                    </div>
                )}

                {error && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                    <div className="flex gap-1">
                        {/* Image Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 w-8 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            title="Image"
                        >
                            <ImageIcon className="h-5 w-5" />
                        </Button>

                        {/* GIF Input */}
                        <input
                            type="file"
                            ref={gifInputRef}
                            className="hidden"
                            accept=".gif"
                            onChange={handleImageSelect}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-purple-500 hover:text-purple-400 hover:bg-purple-500/10 h-8 w-8 transition-colors"
                            onClick={() => gifInputRef.current?.click()}
                            title="GIF"
                        >
                            <FileVideo className="h-5 w-5" />
                        </Button>

                        {/* Poll Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 h-8 w-8 transition-colors"
                            onClick={() => setShowPoll(!showPoll)}
                            title="Poll"
                        >
                            <BarChart2 className="h-5 w-5" />
                        </Button>

                        {/* Emoji Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 h-8 w-8 transition-colors"
                                    title="Emoji"
                                >
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 border-none w-auto" side="bottom" align="start">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={"dark" as any}
                                    width={300}
                                    height={400}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !selectedImage && !showPoll)}
                        className="rounded-full px-6"
                    >
                        Post
                    </Button>
                </div>
            </div>
        </div>
    );
}
