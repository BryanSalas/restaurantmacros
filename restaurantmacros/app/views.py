from django.shortcuts import get_object_or_404, render
from nutritionix import Nutritionix

from .forms import SearchForm
from .models import Food, Restaurant

from dal import autocomplete

APP_ID = "dba98fde"
API_KEY = "adbe45626226708ccb7d85830347aada"

nix = Nutritionix(app_id=APP_ID, api_key=API_KEY)


def home(request):
    form = SearchForm()
    return render(request, 'home.html', {'activeTab': 'homeTab', 'form': form})


def restaurants(request):
    all_restaurants = list(Restaurant.objects.all().order_by('name'))
    restaurant_rows = []
    index = 0

    try:
        while True:
            row = []
            row.append(all_restaurants[index])
            index += 1
            row.append(all_restaurants[index])
            index += 1
            row.append(all_restaurants[index])
            index += 1
            restaurant_rows.append(row)
    except IndexError:
        view_dict = {'activeTab': 'restaurantsTab', 'restaurant_rows': restaurant_rows}
        return render(request, 'restaurants.html', view_dict)


class RestaurantAutocomplete(autocomplete.Select2QuerySetView):
    def get_queryset(self):
        # Don't forget to filter out results depending on the visitor !
        #if not self.request.user.is_authenticated():
        #    return Restaurant.objects.none()

        qs = Restaurant.objects.all().order_by('name')

        if self.q:
            qs = qs.filter(name__istartswith=self.q)

        return qs


def food(request):
    return render(request, 'food.html', {'activeTab': 'foodTab'})


def results(request):
    calories = request.GET['calories']
    protein = request.GET['protein']
    fat = request.GET['fat']
    carbs = request.GET['carbs']

    restaurant = request.GET['restaurant']

    brand_id = Restaurant.objects.filter(id=restaurant)[0].brand_id

    search_results = nix.search().nxql(
        filters={
            "brand_id": brand_id,
            "nf_calories": {
                "lte": calories
            },
            "nf_protein": {
                "lte": protein
            },
            "nf_total_fat": {
                "lte": fat
            },
            "nf_total_carbohydrate": {
                "lte": carbs
            }
        },
        fields=["item_name", "brand_name", "brand_id", "nf_calories", "nf_protein", "nf_total_fat",
                "nf_total_carbohydrate"],
        sort={
            "field": "item_name.sortable_na",
            "order": "asc"
        },
        offset=0,
        limit=50
    ).json()

    items = []
    cur_rest = Restaurant.objects.filter(id=restaurant)[0]

    for hit in search_results['hits']:
        fields = hit['fields']
        items.append(Food(name=fields['item_name'],
                          calories=fields['nf_calories'],
                          protein=fields['nf_protein'],
                          fat=fields['nf_total_fat'],
                          carbs=fields['nf_total_carbohydrate'],
                          restaurant=cur_rest))

    return render(request, 'results.html', {'items': items})
