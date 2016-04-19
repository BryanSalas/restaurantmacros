from django import forms
from dal import autocomplete
from .models import Restaurant


class SearchForm(forms.ModelForm):

    general = {'min_value': '0',
               'label_suffix': "",
               'widget': forms.NumberInput(attrs=
                                           {'class': 'form-control',
                                            'placeholder': 'Goal',
                                            'style': 'width : 71px'})}

    calories = forms.IntegerField(**general)
    protein = forms.IntegerField(**general)
    fat = forms.IntegerField(**general)
    carbs = forms.IntegerField(**general)

    restaurant = forms.ModelChoiceField(
        queryset=Restaurant.objects.all(),
        widget=autocomplete.ModelSelect2(url='restaurant-autocomplete',
                                         attrs={'data-placeholder': 'Restaurant'})
    )

    class Meta:
        model = Restaurant
        fields = []


