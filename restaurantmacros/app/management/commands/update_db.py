from django.core.management.base import BaseCommand, CommandError
from restaurantmacros.app.models import Food, Restaurant
from nutritionix import Nutritionix
from datetime import datetime
import sys

APP_ID = "dba98fde"
API_KEY = "adbe45626226708ccb7d85830347aada"

nix = Nutritionix(app_id=APP_ID, api_key=API_KEY)


class Command(BaseCommand):
    help = 'Updates the db with new info from Nutritionix'

    def update_restaurants(self, total_hits):
        cur_offset = 0
        while cur_offset <= total_hits:
            resp = nix.brand().search(offset=cur_offset, limit=50, type=1).json()
            for hit in resp['hits']:
                restaurant_id = hit['fields']['_id']
                restaurant = Restaurant.objects.filter(brand_id=restaurant_id)

                # restaurant not in DB
                if restaurant.count() != 1:
                    restaurant_info = nix.brand(restaurant_id).json()
                    restaurant_name = restaurant_info['name']
                    restaurant_website = restaurant_info['website']
                    restaurant_updated_at = datetime.strptime(restaurant_info['updated_at'], "%Y-%m-%dT%H:%M:%S.000Z")

                    new_restaurant = Restaurant(name=restaurant_name,
                                                website=restaurant_website,
                                                brand_id=restaurant_id,
                                                updated_at=restaurant_updated_at)

                    print("Adding " + str(hit['fields']) + " to db.")
                    new_restaurant.save()

            cur_offset += 50

    def handle(self, *args, **options):

        # update restaurants
        try:
            total_restaurants_nix = nix.brand().search(type=1).json()['total']
            total_restaurants_db = Restaurant.objects.all().count()

            if total_restaurants_nix > total_restaurants_db:
                print("Need to add restaurants...")
                self.update_restaurants(total_restaurants_nix)
        except KeyError:
            print("Ran out of API calls for restaurants.")
            sys.exit()










