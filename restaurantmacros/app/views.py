from django.http import HttpResponse
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


def add_food(request):
    print("AYE")
    return HttpResponse(status=200)


def results(request):
    calories = request.GET['calories']
    protein = request.GET['protein']
    fat = request.GET['fat']
    carbs = request.GET['carbs']

    search_filters = {}

    if calories:
        search_filters["nf_calories"] = {"lte": calories}
    if protein:
        search_filters["nf_protein"] = {"lte": protein}
    if fat:
        search_filters["nf_total_fat"] = {"lte": fat}
    if carbs:
        search_filters["nf_total_carbohydrate"] = {"lte": carbs}

    restaurant_ids = request.GET.getlist('restaurants')

    # all food items that fit criteria
    items = []

    # search all restaurants given
    for restaurant_id in restaurant_ids:
        cur_rest = Restaurant.objects.filter(id=restaurant_id)[0]
        brand_id = cur_rest.brand_id

        search_filters["brand_id"] = brand_id

        cur_offset = 0
        total_results = 50

        # get all results from restaurant
        while cur_offset < total_results:
            # make call to nix to get foods that fit criteria
            search_results = nix.search().nxql(
                filters=search_filters,
                fields=["item_name", "brand_name", "brand_id", "nf_calories", "nf_protein", "nf_total_fat",
                        "nf_total_carbohydrate"],
                sort={
                    "field": "item_name.sortable_na",
                    "order": "asc"
                },
                offset=cur_offset,
                limit=50
            ).json()

            for hit in search_results['hits']:
                fields = hit['fields']
                items.append(Food(item_id=hit['_id'],
                                  name=fields['item_name'],
                                  calories=fields['nf_calories'],
                                  protein=fields['nf_protein'],
                                  fat=fields['nf_total_fat'],
                                  carbs=fields['nf_total_carbohydrate'],
                                  restaurant=cur_rest))

            cur_offset += 50
            total_results = search_results["total"]

    return render(request, 'results.html', {'items': items})
