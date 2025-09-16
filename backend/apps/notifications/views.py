from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer, NotificationCreateSerializer,
    NotificationPreferenceSerializer, NotificationStatsSerializer
)

class NotificationListView(generics.ListAPIView):
    """List notifications for the authenticated user"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(recipient=user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.select_related('sender', 'course', 'student__user')

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a notification"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    def perform_update(self, serializer):
        # Mark as read when updating
        if 'is_read' in serializer.validated_data and serializer.validated_data['is_read']:
            serializer.save(read_at=timezone.now())
        else:
            serializer.save()

@extend_schema(
    summary="Mark notification as read",
    description="Mark a specific notification as read"
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_as_read(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id, 
            recipient=request.user
        )
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@extend_schema(
    summary="Mark all notifications as read",
    description="Mark all notifications for the user as read"
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_as_read(request):
    """Mark all notifications as read for the user"""
    updated_count = Notification.objects.filter(
        recipient=request.user, 
        is_read=False
    ).update(is_read=True, read_at=timezone.now())
    
    return Response({
        'message': f'{updated_count} notifications marked as read'
    })

@extend_schema(
    summary="Get notification statistics",
    description="Get notification counts and statistics for the user"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_stats(request):
    """Get notification statistics for the user"""
    user_notifications = Notification.objects.filter(recipient=request.user)
    
    # Get counts
    total_count = user_notifications.count()
    unread_count = user_notifications.filter(is_read=False).count()
    today_count = user_notifications.filter(
        created_at__date=timezone.now().date()
    ).count()
    high_priority_count = user_notifications.filter(
        priority='high', is_read=False
    ).count()
    
    # Get counts by type
    type_counts = user_notifications.values('notification_type').annotate(
        count=Count('notification_type')
    )
    by_type = {item['notification_type']: item['count'] for item in type_counts}
    
    stats = {
        'total_notifications': total_count,
        'unread_count': unread_count,
        'today_count': today_count,
        'priority_high_count': high_priority_count,
        'by_type': by_type
    }
    
    serializer = NotificationStatsSerializer(stats)
    return Response(serializer.data)

class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Get or update notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences

# Utility function to create notifications
def create_notification(recipient, title, message, notification_type, 
                       sender=None, course=None, student=None, priority='medium', data=None):
    """Helper function to create notifications"""
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        course=course,
        student=student,
        data=data or {}
    )
    return notification
