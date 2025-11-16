import random
import logging
from django.utils import timezone
from datetime import timedelta
from django.core.cache import cache
from .models import User, VerificationCode, UserProfile, UserActivity

logger = logging.getLogger(__name__)

class VerificationService:
    """
    Service for handling verification codes
    """
    
    @staticmethod
    def generate_verification_code(user, verification_type='PHONE'):
        """
        Generate and save a verification code for a user
        """
        # Generate 6-digit code
        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Create verification code record
        verification_code = VerificationCode.objects.create(
            user=user,
            code=code,
            verification_type=verification_type,
            expires_at=expires_at
        )
        
        logger.info(f"Generated {verification_type} verification code for {user.phone_number}: {code}")
        return code
    
    @staticmethod
    def verify_code(user, code, verification_type='PHONE'):
        """
        Verify a code for a user
        """
        try:
            verification_code = VerificationCode.objects.filter(
                user=user,
                code=code,
                verification_type=verification_type,
                is_used=False,
                expires_at__gt=timezone.now()
            ).latest('created_at')
            
            if verification_code:
                verification_code.is_used = True
                verification_code.save()
                
                # Mark user as verified if it's phone verification
                if verification_type == 'PHONE':
                    user.is_verified = True
                    user.save()
                
                logger.info(f"Successfully verified {verification_type} for {user.phone_number}")
                return True
                
        except VerificationCode.DoesNotExist:
            logger.warning(f"Invalid verification attempt for {user.phone_number}")
        
        return False

class ProfileService:
    """
    Service for user profile operations
    """
    
    @staticmethod
    def create_user_profile(user):
        """
        Create a profile for a new user
        """
        profile, created = UserProfile.objects.get_or_create(user=user)
        if created:
            logger.info(f"Created profile for user: {user.phone_number}")
        return profile
    
    @staticmethod
    def update_profile_completion(user):
        """
        Update profile completion percentage
        """
        try:
            profile = user.profile
            profile.calculate_profile_completion()
            logger.debug(f"Updated profile completion for {user.phone_number}: {profile.profile_completion_percentage}%")
        except UserProfile.DoesNotExist:
            logger.warning(f"Profile not found for user: {user.phone_number}")

class ActivityService:
    """
    Service for tracking user activities
    """
    
    @staticmethod
    def log_activity(user, activity_type, description, request=None):
        """
        Log a user activity
        """
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = ActivityService.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        activity = UserActivity.objects.create(
            user=user,
            activity_type=activity_type,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        logger.info(f"Logged activity: {activity_type} for {user.phone_number}")
        return activity
    
    @staticmethod
    def get_client_ip(request):
        """
        Get client IP address from request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip