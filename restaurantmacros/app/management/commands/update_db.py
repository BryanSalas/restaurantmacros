from django.core.management.base import BaseCommand, CommandError
from restaurantmacros.app.models import Food, Restaurant
from nutritionix import Nutritionix
from datetime import datetime, date, time
import sys

APP_ID  = "dba98fde"
API_KEY = "adbe45626226708ccb7d85830347aada"

nix = Nutritionix(app_id=APP_ID, api_key=API_KEY)

class Command(BaseCommand):
    help = 'Updates the db with new info from Nutritionix'

    def updateFoods(self, restaurant, totalHits):
        low_index = 0
        high_index = 50
        while(low_index <= totalHits):
            resp = nix.search('', brand_id=restaurant.brand_id, results=str(low_index) + ":" + str(high_index)).json()
            for hit in resp['hits']:
                item_id   = hit['fields']['item_id']
                item = Food.objects.filter(item_id=item_id)
                item_info = nix.item(id=item_id).json()

                # item not in DB
                if item.count() != 1:
                    try:
                        item_name = hit['fields']['item_name']
                        item_calories = item_info['nf_calories']
                        item_protein = item_info['nf_protein']
                        item_fat = item_info['nf_total_fat']
                        item_carbs = item_info['nf_total_carbohydrate']
                        item_id = item_info['item_id']
                        item_updated_at = datetime.strptime(item_info['updated_at'], "%Y-%m-%dT%H:%M:%S.000Z")
                    except KeyError:
                        print("Exiting script, API ran out of calls...")
                        sys.exit()

                    new_food = Food(name=item_name, calories=item_calories, protein=item_protein, fat=item_fat, carbs=item_carbs, restaurant=restaurant, item_id=item_id, updated_at=item_updated_at)
                    print("Adding " + str(hit['fields']) + " to db.")
                    new_food.save()

                # item in DB, check if updated
                elif item.count() == 1:
                    print("")

            low_index = high_index
            high_index += 50

    def updateRestaurants(self, totalHits):
        low_index = 0
        high_index = 50
        while low_index <= totalHits:
            resp = nix.brand().search(offset=low_index, limit=high_index, type=1).json()
            for hit in resp['hits']:
                restaurant_id = hit['fields']['_id']
                restaurant = Restaurant.objects.filter(brand_id=restaurant_id)
                restaurant_info = nix.brand(restaurant_id).json()

                # restaurant not in DB
                if restaurant.count() != 1:
                    try:
                        restaurant_name = restaurant_info['name']
                        restaurant_website = restaurant_info['website']
                        restaurant_updated_at = datetime.strptime(restaurant_info['updated_at'] , "%Y-%m-%dT%H:%M:%S.000Z")
                    except KeyError:
                        print("Exiting script, API ran out of calls...")
                        sys.exit()

                    new_restaurant = Restaurant(name=restaurant_name, website=restaurant_website, brand_id=restaurant_id, updated_at=restaurant_updated_at)
                    print("Adding " + str(hit['fields']) + " to db.")
                    new_restaurant.save()

            low_index = high_index
            high_index += 50


    def handle(self, *args, **options):
        # update restaurants
        total_restaurants_nix = nix.brand().search().json()['total']
        total_restaurants_db  = Restaurant.objects.all().count()

        if(total_restaurants_nix > total_restaurants_db):
            self.updateRestaurants(total_restaurants_nix)

        # update foods only if they need be
        for restaurant in Restaurant.objects.all():
            restaurant_info = nix.brand(restaurant.brand_id).json()
            restaurant_updated_at_current = datetime.strptime(restaurant_info['updated_at'], "%Y-%m-%dT%H:%M:%S.000Z")
            if restaurant_updated_at_current.date() != restaurant.updated_at.date():
                try:
                    total_hits = nix.search('', brand_id=restaurant.brand_id, results="0:1").json()['total_hits']
                except KeyError:
                    print("Exiting script, API ran out of calls...")
                    sys.exit()
                self.updateFoods(restaurant, total_hits)

            else:
                print(restaurant.name + " up to date, moving on.")









