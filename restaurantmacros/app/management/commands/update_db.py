from django.core.management.base import BaseCommand, CommandError
from restaurantmacros.app.models import Food, Restaurant
from nutritionix import Nutritionix
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
            #print(resp)
            for hit in resp['hits']:
                item_id   = hit['fields']['item_id']
                item = Food.objects.filter(item_id=item_id)

                # item not in DB
                if item.count() != 1:
                    print("Adding " + str(hit['fields']) + " to db.")
                    item_info = nix.item(id=item_id).json()
                    try:
                        item_name = hit['fields']['item_name']
                        item_calories = item_info['nf_calories']
                        item_protein = item_info['nf_protein']
                        item_fat = item_info['nf_total_fat']
                        item_carbs = item_info['nf_total_carbohydrate']
                        item_id = item_info['item_id']
                    except KeyError:
                        print("Exiting script, API ran out of calls...")
                        sys.exit()
                    newFood = Food(name=item_name, calories=item_calories, protein=item_protein, fat=item_fat, carbs=item_carbs, restaurant=restaurant, item_id=item_id)
                    newFood.save()
            low_index = high_index
            high_index += 50

    def handle(self, *args, **options):
        for restaurant in Restaurant.objects.all():
            try:
                totalHits = nix.search('', brand_id=restaurant.brand_id, results="0:1").json()['total_hits']
            except KeyError:
                print("Exiting script, API ran out of calls...")
                sys.exit()
            self.updateFoods(restaurant, totalHits)









