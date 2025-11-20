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
    Register a new user - NO auto-login
    """
    try:
        print("🟡 [REGISTER] Request received:", request.data)
        
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            print("🟢 [REGISTER] Serializer valid, creating user...")
            user = serializer.save()
            print(f"🟢 [REGISTER] User created: {user.phone_number} (ID: {user.id})")
            
            # Create user profile
            ProfileService.create_user_profile(user)
            print("🟢 [REGISTER] User profile created")
            
            # ✅ REMOVED AUTO-LOGIN - User must login separately
            # login(request, user)  # This line is removed
            
            # Generate verification code
            code = VerificationService.generate_verification_code(user)
            print(f"🟢 [REGISTER] Verification code generated: {code}")
            
            # Log activity
            ActivityService.log_activity(
                user, 
                'REGISTRATION', 
                'User registered successfully',
                request
            )
            
            response_data = {
                'success': True,
                'message': 'Registration successful! Please login with your credentials.',
                'user_id': str(user.id),
                'phone_number': user.phone_number,
                'verification_code': code  # Remove in production
            }
            
            print("🟢 [REGISTER] Sending success response")
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            print("🔴 [REGISTER] Serializer errors:", serializer.errors)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"🔴 [REGISTER] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
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
    try:
        print("🟡 [LOGIN] Login attempt for:", request.data.get('phone_number'))
        
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            print(f"🟢 [LOGIN] User authenticated: {user.phone_number}")
            
            # Update last login
            user.last_login = timezone.now()
            user.save()
            
            # ✅ LOGIN USER (only during explicit login)
            login(request, user)
            print(f"🟢 [LOGIN] User logged in: {user.phone_number}")
            
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
        
        print("🔴 [LOGIN] Serializer errors:", serializer.errors)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        print(f"🔴 [LOGIN] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'message': 'Login failed. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def logout_user(request):
    """
    User logout
    """
    try:
        print(f"🟡 [LOGOUT] Logging out user: {request.user.phone_number}")
        
        # Log activity
        ActivityService.log_activity(
            request.user, 
            'LOGOUT', 
            'User logged out',
            request
        )
        
        logout(request)
        print("🟢 [LOGOUT] User logged out successfully")
        
        return Response({
            'success': True,
            'message': 'Logout successful'
        })
        
    except Exception as e:
        print(f"🔴 [LOGOUT] Exception: {str(e)}")
        return Response({
            'success': False,
            'message': 'Logout failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get and update user profile - WITH DEBUGGING
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        try:
            user = self.request.user
            print(f"🟡 [PROFILE] Getting profile for user: {user.id} - {user.phone_number}")
            print(f"🟡 [PROFILE] User authenticated: {user.is_authenticated}")
            return user
        except Exception as e:
            print(f"🔴 [PROFILE ERROR] in get_object: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    def retrieve(self, request, *args, **kwargs):
        try:
            print("🟡 [PROFILE] Starting profile retrieval...")
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            print(f"🟢 [PROFILE] Successfully retrieved profile for: {instance.phone_number}")
            return Response(serializer.data)
        except Exception as e:
            print(f"🔴 [PROFILE ERROR] in retrieve: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': 'Failed to retrieve profile',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_profile(request):
    """
    Update user profile information
    """
    try:
        print(f"🟡 [UPDATE PROFILE] Updating profile for: {request.user.phone_number}")
        
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
            
            print("🟢 [UPDATE PROFILE] Profile updated successfully")
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
        
        print("🔴 [UPDATE PROFILE] Validation errors:", errors)
        return Response({
            'success': False,
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        print(f"🔴 [UPDATE PROFILE] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'message': 'Profile update failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    try:
        user = request.user
        print(f"🟡 [DASHBOARD] Getting dashboard for: {user.phone_number}")
        
        # Get user's loan statistics
        loan_stats = {
            'active_loans': 0,
            'total_borrowed': 0,
            'total_repaid': 0,
            'outstanding_balance': 0
        }
        
        # Get user's credit score
        credit_score = None
        try:
            from credit_scoring.models import CreditScore
            latest_score = CreditScore.objects.filter(user=user).order_by('-calculated_at').first()
            if latest_score:
                credit_score = latest_score.score
        except ImportError:
            print("🟡 [DASHBOARD] Credit scoring app not available")
            pass
        
        dashboard_data = {
            'user': UserSerializer(user).data,
            'profile_completion': user.profile.profile_completion_percentage,
            'loan_stats': loan_stats,
            'credit_score': credit_score,
            'is_verified': user.is_verified
        }
        
        print("🟢 [DASHBOARD] Dashboard data retrieved successfully")
        return Response({
            'success': True,
            'dashboard': dashboard_data
        })
        
    except Exception as e:
        print(f"🔴 [DASHBOARD] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'message': 'Failed to load dashboard'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)