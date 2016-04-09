from django import forms

class SearchForm(forms.Form):

    general_min = { 'min_value' : '0', 'label_suffix' : "", 'widget' : forms.NumberInput(attrs={'class': 'form-control', 'placeholder' : 'Min', 'style' : 'width : 67px'}) }
    general_max = { 'min_value' : '0', 'label_suffix' : "", 'widget' : forms.NumberInput(attrs={'class': 'form-control', 'placeholder' : 'Max', 'style' : 'width : 67px'}), 'label':"-"}

    # calories
    cal_min = forms.IntegerField(label = "Calories", **general_min)
    cal_max = forms.IntegerField(**general_max)

    # protein
    pro_min = forms.IntegerField(label = "Protein", **general_min)
    pro_max = forms.IntegerField(**general_max)

    # fat
    fat_min = forms.IntegerField(label = "Fat", **general_min)
    fat_max = forms.IntegerField(**general_max)

    # carbs
    carb_min = forms.IntegerField(label = "Carbs", **general_min)
    carb_max = forms.IntegerField(**general_max)