from django import forms

class SearchForm(forms.Form):

    general = { 'min_value' : '0', 'label_suffix' : "", 'widget' : forms.NumberInput(attrs={'class': 'form-control', 'placeholder' : 'Goal', 'style' : 'width : 71px'}) }

    calories = forms.IntegerField(**general)
    protein = forms.IntegerField(**general)
    fat = forms.IntegerField(**general)
    carbs = forms.IntegerField(**general)

