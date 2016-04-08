from django import forms

class SearchForm(forms.Form):
    min_cal = forms.IntegerField(min_value=0, label="Calories")
    max_cal = forms.IntegerField(min_value=0, label="")
    min_pro = forms.IntegerField(min_value=0)
    max_pro = forms.IntegerField(min_value=0)
    min_fat = forms.IntegerField(min_value=0)
    max_fat = forms.IntegerField(min_value=0)
    min_carb = forms.IntegerField(min_value=0)
    max_carb = forms.IntegerField(min_value=0)