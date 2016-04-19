from django import forms
from dal import autocomplete
from .models import Restaurant


class SearchForm(forms.ModelForm):

    general = {'min_value': '0',
               'label_suffix': '',
               'widget': forms.NumberInput(attrs=
                                           {'placeholder': 'Any',
                                            'style': 'width : 85px'})}

    calories = forms.IntegerField(**general)
    protein = forms.IntegerField(**general)
    fat = forms.IntegerField(**general)
    carbs = forms.IntegerField(**general)

    restaurants = forms.ModelChoiceField(
        queryset=Restaurant.objects.all(),
        widget=autocomplete.ModelSelect2Multiple(url='restaurant-autocomplete',
                                         attrs={'data-placeholder': 'Choose Restaurants'})
    )

    class Meta:
        model = Restaurant
        fields = []


