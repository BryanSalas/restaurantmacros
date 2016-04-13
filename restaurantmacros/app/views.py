from django.shortcuts import get_object_or_404, render

from .forms import SearchForm

def home(request):
    form = SearchForm()
    return render(request, 'home.html', {'activeTab' : 'homeTab', 'form' : form})

def restaurants(request):
    return render(request, 'restaurants.html', {'activeTab' : 'restaurantsTab'})

def food(request):
    return render(request, 'food.html', {'activeTab': 'foodTab'})
