from django.conf.urls import include, url
from restaurantmacros.app import views

from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    # Examples:
    url(r'^$', views.home, name='home'),
    url(r'^polls/', include('restaurantmacros.app.urls')),
    url(r'^admin/', include(admin.site.urls)),
]
