from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    website = models.URLField()
    brand_id = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Food(models.Model):
    name = models.CharField(max_length=200)
    item_id = models.CharField(max_length=200)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)

    calories = models.IntegerField()
    protein = models.IntegerField()
    fat = models.IntegerField()
    carbs = models.IntegerField()

    def __str__(self):
        return self.name