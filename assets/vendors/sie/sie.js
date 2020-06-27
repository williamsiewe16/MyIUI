
jQuery(function($){

    var liste = ["bonjour"];

    
    $(".autocomplete .text-autocomplete").on("input",function(e){
        AjaxGet("http://localhost/server/php/tchat_begin.php",$(this));
    });

  /* $(".text-autocomplete").on("blur",function(liste){
       // list_section.hide();
       $(this).parents(".autocomplete").children(".list-autocomplete").hide();
    });*/

    function AjaxGet(u,that){
        if(!that.val().match("^([ ]*)$")){
    $.ajax({
        url:u,
        type:"GET",
        dataType:"text",
        data:"&text="+that.val(),
        error: function(){
               console.error("error");
                },  
        success: function(data){
            console.log(data);
                  display(data);
                  autocompletion(liste,that);  
                 } 
       });
    }else{
        that.parents().filter(".autocomplete").children().filter(".list-autocomplete").hide();
    }
    }

    function autocompletion(liste,that){
        this_text_section = that;
        var list_section = that.parents().filter(".autocomplete").find(".list-autocomplete");
      console.log(that.parents().filter(".autocomplete").find(".list-autocomplete").length);
            if(that.val() == "" || liste.length == 0){list_section.hide()}
        else{
            var width =that.innerWidth()+"px";
            var left = (that.offset().left-15)+"px";
            console.log(left);

          // list_section.offset({left:left});
           console.log(list_section.css("left"));
           list_section.css({
               "width": width,
               "left":left,
               "padding" : "10px",
               "borderBottomLeftRadius" : "10px",
               "borderBottomRightRadius" : "10px",
           });

           list_section.html("");
           var mid=parseInt((liste.length/2));

           for(var j=0;j<mid;j++){ 
            link="<a class='autocomplete-item' href='#'><img src='"+liste[j+mid]+"' alt='image' style='width:10%;height:10%;display:inline;margin:10px'/>"+liste[j]+"</a></br>";
            list_section.html(list_section.html()+link);
           }

           list_section.slideDown();
       }
    }

       function display(data){
        if(data != ""){
      var tab = data.split("$");
      liste=[];
       for(var i=0;i<tab.length-1;i++){ 
          liste.push(tab[i]);
       }
     }
    }

    $(".list-autocomplete").on("click",".autocomplete-item",function(){
      var text_section=$(this).parents(".autocomplete").find(".text-autocomplete");
      text_section.val($(this).text());
      $(this).parent().slideUp();
      console.log("a");
    });

});