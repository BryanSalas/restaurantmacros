from django.conf.urls import include, url
from restaurantmacros.app import views
from restaurantmacros import settings
from django.views.static import serve

from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^restaurants/', views.restaurants, name='restaurants'),
    url(r'^food/', views.food, name='food'),
    url(r'^results/', views.results, name='results'),
    url(r'^admin/', include(admin.site.urls)),
]

if settings.DEBUG:
    urlpatterns += [
        url(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
    ]
