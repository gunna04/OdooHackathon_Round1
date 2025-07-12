import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageCircle, Star, User } from "lucide-react";
import type { SwapRequestWithDetails } from "@shared/schema";

interface SwapRequestCardProps {
  request: SwapRequestWithDetails;
  currentUserId: string;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
  isLoading: boolean;
}

export default function SwapRequestCard({
  request,
  currentUserId,
  onAccept,
  onReject,
  onComplete,
  isLoading
}: SwapRequestCardProps) {
  const isReceiver = request.receiverId === currentUserId;
  const otherUser = isReceiver ? request.requester : request.receiver;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-l-yellow-400';
      case 'accepted':
        return 'border-l-green-400';
      case 'completed':
        return 'border-l-blue-400';
      case 'rejected':
        return 'border-l-red-400';
      case 'cancelled':
        return 'border-l-gray-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionButtons = () => {
    if (request.status === 'pending' && isReceiver) {
      return (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isLoading}
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={onAccept}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600"
          >
            Accept
          </Button>
        </div>
      );
    }

    if (request.status === 'accepted') {
      return (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Message
          </Button>
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            Mark Complete
          </Button>
        </div>
      );
    }

    if (request.status === 'completed' && request.reviews.length === 0) {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
        >
          <Star className="w-3 h-3 mr-1" />
          Leave Review
        </Button>
      );
    }

    if (request.status === 'completed') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          Request Another Swap
        </Button>
      );
    }

    return null;
  };

  return (
    <Card className={`border-l-4 ${getBorderColor(request.status)}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <img
              className="w-12 h-12 rounded-full object-cover"
              src={otherUser.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`}
              alt={`${otherUser.firstName}'s profile`}
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                {isReceiver ? 'wants to swap' : 'you requested a swap with'}
                {request.offeredSkill && (
                  <span className="font-medium"> {request.offeredSkill.name}</span>
                )}
                {request.requestedSkill && (
                  <span className="font-medium"> for {request.requestedSkill.name}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(request.createdAt)}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>

        {request.message && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-900">{request.message}</p>
          </div>
        )}

        {request.status === 'completed' && request.reviews.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => {
                  const review = request.reviews.find(r => r.revieweeId === currentUserId);
                  const rating = review?.rating || 0;
                  return (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rating ? 'fill-current' : ''}`}
                    />
                  );
                })}
              </div>
              <span className="text-sm text-gray-600">
                {otherUser.firstName} rated you
              </span>
            </div>
            {request.reviews
              .filter(review => review.revieweeId === currentUserId)
              .map(review => (
                <p key={review.id} className="text-sm text-gray-700">
                  "{review.comment}"
                </p>
              ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {request.proposedTime ? (
            <div className="text-xs text-gray-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Proposed: {formatDate(request.proposedTime)}
            </div>
          ) : (
            <div className="text-xs text-gray-500 flex items-center">
              <User className="w-3 h-3 mr-1" />
              {request.status === 'completed' 
                ? `Completed ${formatDate(request.updatedAt)}` 
                : 'No specific time proposed'
              }
            </div>
          )}
          {getActionButtons()}
        </div>
      </CardContent>
    </Card>
  );
}
