from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'restaurantmacros.views.home', name='home'),
    #url(r'^polls/', include('restaurantmacros.app.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
