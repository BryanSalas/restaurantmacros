from django.conf.urls import include, url
from restaurantmacros.app import views

from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    # Examples:
    url(r'^$', views.home, name='home'),
    url(r'^restaurants/', views.restaurants, name='restaurants'),
    url(r'^food/', views.food, name='food'),
    url(r'^results/', views.results, name='results'),
    url(r'^admin/', include(admin.site.urls)),
]
