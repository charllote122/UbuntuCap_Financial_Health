from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'csrfToken': 'available', 'status': 'success'})

def api_root(request):
    return JsonResponse({
        'message': 'Ubuntu Capital API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'users': '/api/users/',
            'loans': '/api/loans/',
            'mpesa': '/api/mpesa/',
            'credit': '/api/credit/',
            'csrf_token': '/csrf-token/'
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/credit/', include('credit_scoring.urls')),
    path('api/loans/', include('loans.urls')),
    path('api/mpesa/', include('mpesa.urls')),
    path('csrf-token/', get_csrf_token, name='csrf-token'),  # Add this line
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]