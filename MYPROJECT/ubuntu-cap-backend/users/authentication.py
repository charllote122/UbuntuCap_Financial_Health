from rest_framework import authentication
from rest_framework import exceptions
from .models import User

class PhoneNumberAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication based on phone number and password
    """
    
    def authenticate(self, request):
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')
        
        if not phone_number or not password:
            return None

        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('No such user')

        if not user.check_password(password):
            raise exceptions.AuthenticationFailed('Invalid password')
            
        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is disabled')

        return (user, None)