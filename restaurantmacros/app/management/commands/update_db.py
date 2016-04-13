from django.core.management.base import BaseCommand, CommandError
from restaurantmacros.app.models import Food, Restaurant
from nutritionix import Nutritionix

APP_ID  = "dba98fde"
API_KEY = "adbe45626226708ccb7d85830347aada"

nix = Nutritionix(app_id=APP_ID, api_key=API_KEY)

class Command(BaseCommand):
    help = 'Updates the db with new info from Nutritionix'

    def updateFoods(self, restaurant):
        resp = nix.search('', brand_id=restaurant.brand_id, results="0:50").json()
        for hit in resp['hits']:
            item_name = hit['fields']['item_name']
            item_id   = hit['fields']['item_id']
            item = Food.objects.filter(name=item_name)

            # item not in DB
            if item.count() != 1:
                item_info = nix.item(id=item_id).json()
                item_calories = item_info['nf_calories']
                item_protein = item_info['nf_protein']
                item_fat = item_info['nf_total_fat']
                item_carbs = item_info['nf_total_carbohydrate']

                newFood = Food(name=item_name, calories=item_calories, protein=item_protein, fat=item_fat, carbs=item_carbs, restaurant=restaurant)
                newFood.save()

    def handle(self, *args, **options):
        for restaurant in Restaurant.objects.all():
            self.updateFoods(restaurant)









