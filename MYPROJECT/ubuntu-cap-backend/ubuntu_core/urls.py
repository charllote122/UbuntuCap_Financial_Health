from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/loans/', include('loans.urls')),
    path('api/mpesa/', include('mpesa.urls')),
    path('api/credit/', include('credit_scoring.urls')),
]

# Debug toolbar URLs (only in development)
if settings.DEBUG:
    urlpatterns = [
        path('__debug__/', include('debug_toolbar.urls')),
    ] + urlpatterns