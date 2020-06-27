
(function ($) {

    "use strict";
    const API_LOGIN_URL = "/admission/login";
    const API_REGISTER_URL = "/admission/register";


    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/

    $("#password_instructions").find(".fa-check").hide();

    $('.connexion-form').on('submit',function(e){
        e.preventDefault();

        let input = $('.connexion-form .validate-input .input100');
        let $validate=true;
        let $data= $(this).serialize();

        for(let i=0; i<input.length; i++) {
            let $error_message = validate(input[i]);
            $validate=($validate && ($error_message=="" ? true : false));
            showValidate(input[i],$error_message);
        }

        if($validate){
            $("#loading").show()
            setTimeout(() => {
                AjaxPost(API_LOGIN_URL,$data,"connexion");
            },1000)
        }
    });

    $('.inscription-form').on('submit',function(e){
        e.preventDefault();

        let input = $('.inscription-form div[data-validate] input');
        let $validate=true;
        let $data= $(this).serialize();

        for(let i=0; i<input.length; i++) {
            let $error_message = validate(input[i]);
            $validate=($validate && ($error_message=="" ? true : false));
            showValidate(input[i],$error_message);
        }

        if($validate){
            $data = `${$data}&level_inscription=${$('.level').text()}&country_inscription=${$('.country').find('span').text()}&countryCode_inscription=${$('.country-code').find('span').text()}`
            setTimeout(() => {
                AjaxPost(API_REGISTER_URL,$data,"inscription");
            },1000)
        }else showSnackbar("une ou plusieurs erreurs ont été détectées","red", 2000)
    })


    $("#wizard").on('input',"input[name='password_inscription']",function(e){
        let input = $(this);

        atLeast8(input);
        contains_maj(input);
        contains_num(input);
    })


    $('.login100-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });


    function validate (input) {
       let $error="";
        if($(input).val().trim() == '' || $(input).val()=="Default"){
            $error = $(input).parent().attr("data-validate");
        }
        else {
            if($(input).attr('type') == 'email') {
                /*"^([a-zA-Z0-9]+)\.[a-zA-Z0-9]@202[0-9]{1}\.(ucac-icam)\.(com)$"*/
                if(!$(input).val().match("^[a-zA-Z0-9\._%+-]+@[a-zA-Z_-]+\.(com|fr|net)$")) {
                    $error = "Email invalide";
                }
            }else if($(input).attr("name") == "password_inscription"){
                if(!atLeast8(input) || !contains_maj(input) || !contains_num(input)){
                $error = "votre mot de passe doit respecter tous les critères énumérés ci-dessous";
                }
            }if($(input).attr('type') == 'tel') {
                if(!$(input).val().match("^[0-9]{8,12}$")){
                    $error = "Numéro incorrect"
                }
            }
        }

        return $error;
    }


    function atLeast8(input){
        if($(input).val().length < 8){
           $("#password_instructions").find(".fa-check").eq(0).hide();
            return false;    
        }else{
            $("#password_instructions").find(".fa-check").eq(0).show();
            return true;
        }
    }

    function contains_maj(input){
        if($(input).val().match("[A-Z]+")){
            $("#password_instructions").find(".fa-check").eq(1).show();
            return true;
        }else{
            $("#password_instructions").find(".fa-check").eq(1).hide();
            return false;
        }
    }

    function contains_num(input){
        if($(input).val().match("[0-9]+")){
            $("#password_instructions").find(".fa-check").eq(2).show();
            return true;
        }else{
            $("#password_instructions").find(".fa-check").eq(2).hide();
            return false;
        }
    }

    // Les validations du serveur 
    function serverValidation ($errors) {

       for(let key in $errors){

        let input = $("input[name='"+key+"']");
        let $error_zone = $(input).parent().next(".input-error");
           if($error_zone.length == 0) $error_zone = $(input).next(".input-error")

           $error_zone.text($errors[key]);

       }
     }

 
    function showValidate(input,$error_message) {
        let $error_zone = $(input).parent().next(".input-error");
        if($error_zone.length == 0) $error_zone = $(input).next(".input-error")

        $error_zone.text($error_message);

        if($(input).find("option").length != 0){
            $(input).parent().css({
                borderColor : "red",
            });
        }
        else{
            $(input).parent().css({
                borderBottomColor : "red",
            });
        }
    }

    function hideValidate(input) {
        let $error_zone = $(input).parent().next(".input-error");
        if($error_zone.length == 0) $error_zone = $(input).next(".input-error")

        $error_zone.text("");

        if($(input).find("option").length == 0){
            $(input).parent().css({
                borderBottomColor : "#adadad",
            });
        }
     
        
    }

 function AjaxPost(url_,data_,type){
    $.ajax({
        url:url_,
        type:"POST",
        dataType:"text",
        data:data_,
        success: function(data,statut){

            $("#loading").hide()

            if(type == "inscription"){
                if(data != "done"){
                  serverValidation(JSON.parse(data));
                    console.log(data)
                    showSnackbar("une ou plusieurs erreurs ont été détectées","red",5000)
                }else{
                    $("#password_instructions").find(".fa-check").hide();
                    $('div[data-validate] input').val('')
                    let valid_text = "Un courrier électronique a été envoyé à l’adresse que vous avez spécifiée.\n" +
                          "Ce courrier contient un lien sur lequel vous devez cliquer pour activer votre compte."

                    showSnackbar(valid_text,"green")
                }
            }

            else if(type == "connexion"){
                if(data != "done"){
                    let error = JSON.parse(data)
                    showSnackbar(error.error,"red",5000)
                }else{
                   window.location.href="./admin"
                }
            }
        } 
     });
}


    function showSnackbar(text,color,timeout=15000) {
        // Get the snackbar DIV
        let x = $("#snackbar")
        x.text(text)
        x.css("backgroundColor",color)
        x.addClass("show")

        // After 3 seconds, remove the show class from DIV
        setTimeout(() => { x.removeClass("show") }, timeout);
    }


    /*==================================================================
    [ Show pass ]*/
    let showPass = 0;
    $('.btn-show-pass').on('click', function(){
        if(showPass == 0) {
            $(this).next('input').attr('type','text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type','password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }
        
    });

})(jQuery);
