from django.db import models
import uuid
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        """
        Create and return a regular user with the given phone number and password.
        """
        if not phone_number:
            raise ValueError('The Phone Number field must be set')
        
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        """
        Create and return a superuser with the given phone number and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=15, unique=True)
    
    # Personal Information
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    id_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Status Flags
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Registration Details
    registration_channel = models.CharField(
        max_length=10, 
        choices=[('APP', 'App'), ('USSD', 'USSD')],
        default='APP'
    )
    
    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.phone_number

    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.phone_number

    def get_short_name(self):
        return self.first_name if self.first_name else self.phone_number

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Demographic Information
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')],
        blank=True,
        null=True
    )
    
    # Location Information
    county = models.CharField(max_length=50, blank=True, null=True)
    town = models.CharField(max_length=50, blank=True, null=True)
    
    # Employment Information
    employment_status = models.CharField(
        max_length=20,
        choices=[
            ('EMPLOYED', 'Employed'),
            ('SELF_EMPLOYED', 'Self Employed'),
            ('UNEMPLOYED', 'Unemployed'),
            ('STUDENT', 'Student')
        ],
        blank=True,
        null=True
    )
    monthly_income = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    # Additional Details
    profile_completion_percentage = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile - {self.user.phone_number}"

    def calculate_profile_completion(self):
        """Calculate profile completion percentage"""
        fields = [
            self.user.first_name, self.user.last_name, self.user.email,
            self.date_of_birth, self.gender, self.county, self.town,
            self.employment_status, self.monthly_income
        ]
        
        completed_fields = sum(1 for field in fields if field)
        total_fields = len(fields)
        
        self.profile_completion_percentage = int((completed_fields / total_fields) * 100)
        self.save()

class UserConsent(models.Model):
    CONSENT_TYPES = [
        ('MPESA_ANALYSIS', 'M-Pesa Transaction Analysis'),
        ('DATA_PROCESSING', 'Data Processing'),
        ('MARKETING', 'Marketing Communications'),
        ('TERMS_CONDITIONS', 'Terms and Conditions'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consents')
    consent_type = models.CharField(max_length=50, choices=CONSENT_TYPES)
    consented = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'consent_type']
        verbose_name = 'User Consent'
        verbose_name_plural = 'User Consents'

    def __str__(self):
        return f"{self.user.phone_number} - {self.consent_type} - {self.consented}"

class VerificationCode(models.Model):
    VERIFICATION_TYPES = [
        ('PHONE', 'Phone Verification'),
        ('EMAIL', 'Email Verification'),
        ('PASSWORD_RESET', 'Password Reset'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=10)
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPES, default='PHONE')
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'verification_type', 'is_used']),
        ]

    def __str__(self):
        return f"{self.user.phone_number} - {self.code} - {self.verification_type}"

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

class UserActivity(models.Model):
    ACTIVITY_TYPES = [
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('PROFILE_UPDATE', 'Profile Updated'),
        ('PASSWORD_CHANGE', 'Password Changed'),
        ('LOAN_APPLICATION', 'Loan Application Submitted'),
        ('LOAN_REPAYMENT', 'Loan Repayment Made'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'

    def __str__(self):
        return f"{self.user.phone_number} - {self.activity_type} - {self.timestamp}"