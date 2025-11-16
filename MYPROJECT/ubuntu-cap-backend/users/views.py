from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.contrib.auth import login, logout
from django.utils import timezone
from .models import User, UserProfile, UserConsent, VerificationCode
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserUpdateSerializer, UserProfileSerializer, VerificationSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer, ConsentSerializer
)
from .services import VerificationService, ProfileService, ActivityService
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_user(request):
    """
    Register a new user
    """
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Create user profile
            ProfileService.create_user_profile(user)
            
            # Generate verification code
            code = VerificationService.generate_verification_code(user)
            
            # TODO: Send SMS with verification code via Africa's Talking
            logger.info(f"Registration verification code for {user.phone_number}: {code}")
            
            # Log activity
            ActivityService.log_activity(
                user, 
                'REGISTRATION', 
                'User registered successfully',
                request
            )
            
            return Response({
                'success': True,
                'message': 'Registration successful. Please verify your phone number.',
                'user_id': str(user.id),
                'verification_code': code  # Remove in production - only for testing
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred during registration'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def verify_phone(request):
    """
    Verify user's phone number
    """
    serializer = VerificationSerializer(data=request.data)
    
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        code = serializer.validated_data['code']
        
        try:
            user = User.objects.get(phone_number=phone_number)
            
            if VerificationService.verify_code(user, code):
                user.is_verified = True
                user.save()
                
                # Log activity
                ActivityService.log_activity(
                    user, 
                    'PROFILE_UPDATE', 
                    'Phone number verified successfully',
                    request
                )
                
                return Response({
                    'success': True,
                    'message': 'Phone number verified successfully'
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid or expired verification code'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    """
    User login with phone number and password
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login = timezone.now()
        user.save()
        
        # Log activity
        ActivityService.log_activity(
            user, 
            'LOGIN', 
            'User logged in successfully',
            request
        )
        
        # Serialize user data
        user_data = UserSerializer(user).data
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'user': user_data
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def logout_user(request):
    """
    User logout
    """
    # Log activity
    ActivityService.log_activity(
        request.user, 
        'LOGOUT', 
        'User logged out',
        request
    )
    
    logout(request)
    
    return Response({
        'success': True,
        'message': 'Logout successful'
    })

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        
        # Update profile completion
        ProfileService.update_profile_completion(request.user)
        
        # Log activity
        ActivityService.log_activity(
            request.user, 
            'PROFILE_UPDATE', 
            'User profile updated',
            request
        )
        
        return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_profile(request):
    """
    Update user profile information
    """
    user_serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    profile_serializer = UserProfileSerializer(request.user.profile, data=request.data, partial=True)
    
    if user_serializer.is_valid() and profile_serializer.is_valid():
        user_serializer.save()
        profile_serializer.save()
        
        # Update profile completion
        ProfileService.update_profile_completion(request.user)
        
        # Log activity
        ActivityService.log_activity(
            request.user, 
            'PROFILE_UPDATE', 
            'User profile information updated',
            request
        )
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': UserSerializer(request.user).data
        })
    
    errors = {}
    if user_serializer.errors:
        errors.update(user_serializer.errors)
    if profile_serializer.errors:
        errors.update(profile_serializer.errors)
    
    return Response({
        'success': False,
        'errors': errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def record_consent(request):
    """
    Record user consent for various purposes
    """
    consent_type = request.data.get('consent_type')
    consented = request.data.get('consented', False)
    
    if not consent_type:
        return Response({
            'success': False,
            'message': 'Consent type is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    consent, created = UserConsent.objects.update_or_create(
        user=request.user,
        consent_type=consent_type,
        defaults={
            'consented': consented,
            'ip_address': ActivityService.get_client_ip(request)
        }
    )
    
    # Log activity
    activity_type = 'PROFILE_UPDATE'
    description = f"User {'granted' if consented else 'revoked'} consent for {consent_type}"
    ActivityService.log_activity(request.user, activity_type, description, request)
    
    return Response({
        'success': True,
        'message': f"Consent {'recorded' if created else 'updated'} successfully",
        'consent': ConsentSerializer(consent).data
    })

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def request_password_reset(request):
    """
    Request password reset code
    """
    serializer = PasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        
        try:
            user = User.objects.get(phone_number=phone_number)
            code = VerificationService.generate_verification_code(user, 'PASSWORD_RESET')
            
            # TODO: Send SMS with password reset code
            logger.info(f"Password reset code for {phone_number}: {code}")
            
            return Response({
                'success': True,
                'message': 'Password reset code sent to your phone',
                'code': code  # Remove in production - only for testing
            })
            
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist for security reasons
            return Response({
                'success': True,
                'message': 'If the phone number exists, a reset code has been sent'
            })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def confirm_password_reset(request):
    """
    Confirm password reset with code
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    
    if serializer.is_valid():
        phone_number = serializer.validated_data['phone_number']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(phone_number=phone_number)
            
            if VerificationService.verify_code(user, code, 'PASSWORD_RESET'):
                user.set_password(new_password)
                user.save()
                
                # Log activity
                ActivityService.log_activity(
                    user, 
                    'PASSWORD_CHANGE', 
                    'Password reset successfully',
                    request
                )
                
                return Response({
                    'success': True,
                    'message': 'Password reset successful'
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid or expired verification code'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """
    Get user dashboard data
    """
    user = request.user
    
    # Get user's loan statistics (you'll integrate this with loans app)
    loan_stats = {
        'active_loans': 0,
        'total_borrowed': 0,
        'total_repaid': 0,
        'outstanding_balance': 0
    }
    
    # Get user's credit score (you'll integrate this with credit scoring app)
    credit_score = None
    try:
        from credit_scoring.models import CreditScore
        latest_score = CreditScore.objects.filter(user=user).order_by('-calculated_at').first()
        if latest_score:
            credit_score = latest_score.score
    except ImportError:
        pass
    
    dashboard_data = {
        'user': UserSerializer(user).data,
        'profile_completion': user.profile.profile_completion_percentage,
        'loan_stats': loan_stats,
        'credit_score': credit_score,
        'is_verified': user.is_verified
    }
    
    return Response({
        'success': True,
        'dashboard': dashboard_data
    })