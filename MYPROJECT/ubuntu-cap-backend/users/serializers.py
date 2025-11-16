from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile, UserConsent, VerificationCode

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['phone_number', 'password', 'password_confirm', 'registration_channel']
        extra_kwargs = {
            'phone_number': {'required': True},
            'registration_channel': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            registration_channel=validated_data.get('registration_channel', 'APP')
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')
        
        if phone_number and password:
            user = authenticate(phone_number=phone_number, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid phone number or password')
                
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
                
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "phone_number" and "password"')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth', 'gender', 'county', 'town', 
            'employment_status', 'monthly_income', 'profile_completion_percentage'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'first_name', 'last_name', 'email', 
            'id_number', 'is_verified', 'date_joined', 'last_login',
            'full_name', 'profile'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined', 'last_login']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'id_number']

class VerificationSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    code = serializers.CharField(max_length=6)

class PasswordResetSerializer(serializers.Serializer):
    phone_number = serializers.CharField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)
    new_password_confirm = serializers.CharField(min_length=6)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserConsent
        fields = ['consent_type', 'consented', 'timestamp']