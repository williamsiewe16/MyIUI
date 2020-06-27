$(function(){

	$("#wizard").steps({
        headerTag: "h2",
        bodyTag: "section",
        transitionEffect: "fade",
        enableAllSteps: true,
        transitionEffectSpeed: 500,
        labels: {
            finish: "Soumettre",
            next: "Suivant",
            previous: "Précédent"
        },
        onFinishing: function (event, currentIndex)
        {
           $('.inscription-form').submit()
        },
    });

    $('.wizard > .steps li a').click(function(){
    	$(this).parent().addClass('checked');
		$(this).parent().prevAll().addClass('checked');
		$(this).parent().nextAll().removeClass('checked');
    });
    // Custom Jquery Step Button
    $('.forward').click(function(){
    	$("#wizard").steps('next');
    })
    $('.backward').click(function(){
        $("#wizard").steps('previous');
    })
    // Select Dropdown
    $('html').click(function() {
        $('.select .dropdown').hide();
    });
    $('.select').click(function(event){
        event.stopPropagation();
    });
    $('.select .select-control').click(function(){
        $(this).parent().next().toggle();
    })
    $('.select .dropdown li').click(function(){
        $(this).parent().toggle();
        let text = $(this).attr('rel');
        let country = $(this).attr('country');
         let html = `<img src='../assets/images/${country}.png'/><span>${text}</span>`

        if(country != undefined) $(this).parent().prev().find('div').html(html);
        else $(this).parent().prev().find('div').html(text);
    })
})
