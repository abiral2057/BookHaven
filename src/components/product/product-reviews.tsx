
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { addReview, type Review } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Star, MessageSquare, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(500),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function getInitials(name: string | null | undefined) {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
}


function StarRatingInput({ field }: { field: any }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-8 w-8 cursor-pointer transition-colors",
            (hoverRating >= star || field.value >= star)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          )}
          onClick={() => field.onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="flex gap-4 py-6 border-b last:border-b-0">
            <Avatar>
                <AvatarImage src={review.userAvatar} />
                <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="font-semibold">{review.userName}</p>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                </div>
                 <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                    ))}
                </div>
                <p className="mt-3 text-sm text-foreground/80">{review.comment}</p>
            </div>
        </div>
    )
}

export function ProductReviews({
  productId,
  initialReviews,
  onNewReview
}: {
  productId: string;
  initialReviews: Review[];
  onNewReview: (review: Omit<Review, 'id'>) => void;
}) {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) return;

    try {
      const reviewInput = {
        productId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || undefined,
        rating: data.rating,
        comment: data.comment,
      };
      
      await addReview(reviewInput);
      
      // Pass the new review data (without id) up to the parent
      onNewReview(reviewInput);

      // Locally update the reviews list for immediate feedback
      setReviews(prev => [{...reviewInput, id: 'temp-id', createdAt: new Date().toISOString()}, ...prev]);
      
      reset();

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not submit your review. Please try again.",
      });
    }
  };
  
  const userReview = user ? reviews.find(review => review.userId === user.uid) : undefined;
  const hasUserReviewed = !!userReview;

  return (
    <section className="mt-16" id="reviews">
      <h2 className="text-3xl font-bold text-center mb-10">Customer Reviews</h2>
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                {hasUserReviewed ? 'Your Review' : 'Leave a Review'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 animate-pulse bg-muted rounded-md" />
              ) : !user ? (
                <div className="text-center text-muted-foreground p-4">
                  <p>You must be logged in to leave a review.</p>
                  <Button asChild className="mt-4">
                    <Link href="/login">Login to Review</Link>
                  </Button>
                </div>
              ) : hasUserReviewed ? (
                <div className="p-1">
                   {userReview && <ReviewCard review={userReview} />}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Controller
                    name="rating"
                    control={control}
                    render={({ field }) => (
                       <div className="space-y-2">
                        <label className="text-sm font-medium">Your Rating</label>
                        <StarRatingInput field={field} />
                        {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
                       </div>
                    )}
                  />
                  <Controller
                    name="comment"
                    control={control}
                    render={({ field }) => (
                      <Textarea placeholder="Share your thoughts..." {...field} rows={4} />
                    )}
                  />
                   {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
           {reviews.length > 0 ? (
               <div className="divide-y">
                   {reviews.map((review, index) => (
                       <ReviewCard key={review.id || index} review={review} />
                   ))}
               </div>
           ) : (
               <div className="text-center py-16 text-muted-foreground border rounded-lg">
                   <User className="mx-auto h-12 w-12" />
                   <p className="mt-4">No reviews yet for this product.</p>
                   <p>Be the first one to share your thoughts!</p>
               </div>
           )}
        </div>
      </div>
    </section>
  );
}
