from django.shortcuts import get_object_or_404, render

from .forms import SearchForm
from .models import Food, Restaurant


def home(request):
    form = SearchForm()
    return render(request, 'home.html', {'activeTab': 'homeTab', 'form': form})


def restaurants(request):
    return render(request, 'restaurants.html', {'activeTab': 'restaurantsTab', 'restaurants': Restaurant.objects.all()})


def food(request):
    return render(request, 'food.html', {'activeTab': 'foodTab'})


def results(request):
    calories = request.GET['calories']
    protein = request.GET['protein']
    fat = request.GET['fat']
    carbs = request.GET['carbs']

    items = Food.objects.filter(calories__lte=calories).filter(protein__lte=protein).filter(fat__lte=fat).filter(carbs__lte=carbs).order_by('restaurant', '-calories')

    return render(request, 'results.html', {'items' : items})
