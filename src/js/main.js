(function($) {

    "use strict";

    const ADD_DOCUMENT_URL = "/admission/page/addFile";
    const SUBMIT_DOCUMENTS_URL = "/admission/page/submit";
    const UPLOAD_PAYMENT_RECEIPT_URL = "/admission/payment/receipt";
    const DELETE_DOCUMENT_URL = "/admission/page/removeFile";
    const DELETE_DOCUMENTS_URL = "/admission/page/removeFiles";


    setTimeout(() => {
        $('.spinner-border').fadeOut(500)
        setTimeout(() => {
            $('body').removeClass("center")
            $('.contenu').fadeIn(500)

            $('.wrapper1').css('display','flex')
            $('.wrap-login101').css('display','flex')
            $("#admin_page").removeClass("contenu")
            $("#admin_page").addClass("d-flex")
        },500)
    },500)

    let fullHeight = function() {

        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function(){
            $('.js-fullheight').css('height', $(window).height());
        });

    };
    let fullWidth = function() {

        $('.js-fullwidth').css('width', $(window).width());
        $(window).resize(function(){
            $('.js-fullwidth').css('width', $(window).width());
        });

    };

    fullWidth()
    fullHeight();

    /* Déterminer la visibilité du bouton valider */
    let $validate=true
    $('.filenames').each(function(i,elt){
        if($(this).text() == "") $validate= $validate && false
    })
    if($validate) $('.document_form input[type="submit"]').removeAttr("disabled")
    else $('.document_form input[type="submit"]').attr("disabled","true")

    if($validate) $('#DC').removeAttr("disabled")
    else $('#DC').attr("disabled","true")

    /* HomePage */

      /* Mid Height for homepage */
    $('.js-midHeight').css('height', $(window).height()/2);
    $(window).resize(function(){
        $('.js-midHeight').css('height', $(window).height()/2);
    });

      /* HomeButtons */
    $('.homeButtons').css('top', $(window).height()/2 - 25);
    $(window).resize(function(){
        $('.homeButtons').css('top', $(window).height()/2 - 25);
    });

    setTimeout(() => {
        $('.homeButtons')
            .animate({top: $(window).height()/2 - 50},{duration: 500, queue: false})
            .animate({opacity: 1},500)


        if($('.snack').length != 0){
            showSnackbar("Paiement effectué avec succès","green",2000)
        }
    },1280)


    /* Documents Page */

    /* Position de depart du swiper */
    let val = $('.choices').find('.active-choice').attr('value')
    $('.document_form input[name="cycle"]').val(val)
    let tops = ["0px","90px"]; let angles = ["20px 2px 2px 20px","2px 20px 20px 2px"]
    $('.swiper').css({left: tops[val],borderRadius: angles[val]})

    /* Déplacement du  swiper */
    $('.choices span a').on('click', function(e){
        swal({
            title: "Etes-vous sûr?",
            text: "En changeant de cycle, les données sauvegardées seront perdues",
            buttons: { change: {closeModal: false}, cancel: "cancel"}
        }).then((change) => {
           if(change == null) throw null;
           else{
               let token = $(this).parents('.document_form').find('input[name="token"]')
               let cycle = $(this).parents('.document_form').find('input[name="cycle"]')
               let data_ = {token: token.val(), cycle: cycle.val()}
            return  $.ajax({url:DELETE_DOCUMENTS_URL, type: "POST", dataType:"text", data:data_})
        }
        }).then((response) => {
            if(response == "no token") window.location.href="../admission/page"
            swipe(this)
            swal({text: "Modification effectuée", icon: "success"});
        }).catch(err => {
            if(err) swal({text: "Une erreur est survenue", icon: "error"});
            swal.stopLoading();
            swal.close();
        })
    })

    let swipe = function(that){
        $('.choices span a').removeClass("active-choice")
        $(that).addClass("active-choice")

        let val = $(that).attr('value')
        let tops = ["0px","90px"]; let angles = ["20px 2px 2px 20px","2px 20px 20px 2px"]
        $('.swiper').css({left: tops[val],borderRadius: angles[val]})
        $(that).trigger('change')
    }

    $('.choices span a').on('change', function(e){
        let val = $(this).attr('value')
        $('.document_form input[name="cycle"]').val(val)

        let html = "", val1 = 0

        let request = window.indexedDB.open('Uploads',1)
        request.onsuccess = function(e){
            let db = e.target.result
            db.transaction('FileTabs').objectStore('FileTabs').getAll().onsuccess = function(e){
                let response = e.target.result

                let choices = [response[0].data,response[1].data]
                choices[val].forEach(doc => {
                    html+='<div class="document"> ' +
                        `<span class="title">${doc.title}</span><br/>` +
                        `<span class="subtitle">${doc.subtitle}</span> ` +
                        '<div class="document_file"> ' +
                        `<a href="javascript:void(0)"><i class="fa ${doc.icon}"></i></a> ` +
                        '<div>' +
                        '<div class="filenames"></div>' +
                        '<a href="javascript:void(0)"><div class="modify-button">MODIFIER</div></a>' +
                        `<input accept="application/pdf, image/*" class="file_" type="file" name="${doc.name}"/>` +
                        '</div>' +
                        '</div> ' +
                        '</div>'
                    val1++;
                })

                $('.document_form .documents').html(html)
            }
        }
    })

    // Modification de la valeur d'un champ de fichier
    $('.document_form .documents').on('change','.file_',function(){

        let token = $(this).parents('.document_form').find('input[name="token"]')
        let cycle = $(this).parents('.document_form').find('input[name="cycle"]')

        if(this.files.length != 0){
            let datas = new FormData(); let code = $(this).attr('name').substring(4,$(this).attr('name').length)
            datas.append(`${$(this).attr('name')}`,this.files[this.files.length-1])
            datas.append("token", token.val()), datas.append("cycle", cycle.val())
            let that = this
            let tab = this.files[this.files.length-1].name.split(".")
            let extension = tab[tab.length-1]
            let acceptedExtensions = ["pdf","png","jpg","jpeg"]
            if(acceptedExtensions.indexOf(extension) != -1){
                AjaxPost(`${ADD_DOCUMENT_URL}/${code}`,datas,function(data){
                    if(data == "no token") window.location.href="../admission/page"

                    let link = $(that).parents('.document_file').children('a')
                    link.attr('href',JSON.parse(data).path)
                    link.attr('target',"_blank")

                    $(that).parent().children('.filenames').text(`${that.files[0].name}`)
                    showSnackbar("Fichier téléversé avec succès","green",2000)
                    let $validate=true
                    $('.filenames').each(function(i,elt){
                        if($(this).text() == "") $validate= $validate && false
                    })

                    if($validate) $('.document_form input[type="submit"]').removeAttr("disabled")
                    else $('.document_form input[type="submit"]').attr("disabled","true")

                },() => {
                    /*$('.document_form input[type="submit"]').attr("disabled","true")
                    $(that).val("")
                    $(that).parent().children('.filenames').text("")*/
                    showSnackbar("Erreur lors du téléversement du fichier","red",2000)
                })
            }else showSnackbar("L'extension de votre fichier n'est pas acceptée","red",2000)
        }
        else{
            /*$(this).parent().children('.filenames').text("")
            let data = {token: token.val(), code: $(this).attr('name')}
            Ajax(DELETE_DOCUMENT_URL,function(data){
                showSnackbar("Champ vidé","green",2000)
            },() => {showSnackbar("Une erreur est survenue","red",2000)},data,"POST")
        */}
    })

    $('.validate-application').on('click',function(e){
        e.preventDefault()
        let datas = $('.document_form').serialize()

        swal({text: "Voulez-vous soumettre votre candidature? Cette opération est irréversible ",
            buttons: { soumettre: {closeModal: false}, fermer: "cancel"}})
            .then((change) => {
                if(change == null) throw null;
                else{
                    return  $.ajax({url: SUBMIT_DOCUMENTS_URL, type: "POST", dataType:"text", data:datas})
                }})
            .then((response) => {
                if (response == "no token") window.location.href = "../admission/page"
                swal({text: "Opération effectuée", icon: "success"});
                setTimeout(() => window.location.href = "../admission/home", 1500)})
            .catch(err => {
                if(err) swal({text: "une erreur est survenue", icon: "error"});
                swal.stopLoading();
                swal.close()})
    })

    $('.document_form .documents').on('click','.document_file .modify-button',function(){
        $(this).parent().parent().find('.file_').click()
    })

    $('.upload-file').on('click','.document_file .modify-button',function(){
        $(this).parent().parent().find('.file_').click()
    })

    //Modification du reçu de paiement
    $('.upload-file').on('change','.file_',function(){

        let token = $(this).parents('.paymentForm').find('input[name="token"]')
        if(this.files.length != 0){
            let datas = new FormData();
            datas.append(`${$(this).attr('name')}`, this.files[this.files.length-1])
            datas.append("token", token.val())
            let that = this
            let tab = this.files[this.files.length-1].name.split(".")
            let extension = tab[tab.length-1]
            let acceptedExtensions = ["pdf","png","jpg","jpeg"]
            if(acceptedExtensions.indexOf(extension) != -1){
                AjaxPost(`${UPLOAD_PAYMENT_RECEIPT_URL}`,datas,function(data){
                    if(data == "no token") window.location.href="../admission/payment"
                    let link = $(that).parents('.document_file').children('a')
                    link.attr('href',JSON.parse(data).path)
                    link.attr('target',"_blank")
                    $(that).parent().children('.filenames').text(`${that.files[0].name}`)

                    let $validate=true
                    $('.filenames').each(function(i,elt){
                        if($(this).text() == "") $validate= $validate && false
                    })
                    if($validate) $('#DC').removeAttr("disabled")
                    else $('#DC').attr("disabled","true")

                    showSnackbar("Fichier téléversé avec succès","green",2000)
                },() => {
                    showSnackbar("Erreur lors du téléversement du fichier","red",2000)
                })
            }else showSnackbar("L'extension de votre fichier n'est pas acceptée","red",2000)
        }
    })


    /* Admin Page */

    // Initialisation de dataTable
    $(".datatable").DataTable({
        "searching": true,
        "bFilter": false,
    })

    // SideBar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('shadow');
    });


    $('._candidatures').children('a').click()
    $('.sub-item').eq(0).addClass('sub-item-active')

    $('.sub-item').on('click',function(e){
        $('.sub-item').removeClass("sub-item-active")
        $(this).addClass("sub-item-active")
    })

    $('.side-choice').on('click',function(e){
        $('.sub-item').removeClass('sub-item-active')
        e.preventDefault()
        $('#sidebar').toggleClass('active');
        $('#content').toggleClass('shadow');

        Ajax(`admin/${$(this).text()}`,function(response){
            let data = JSON.parse(response)

            if(data.indexOf(0) == -1){
                //$("#dashboard").html("");
                $("#dashboard").hide(); $('.content2').show();
                $('#p0').text(`Application's Folders (${data.length})`)
                $('.datatable').parents(".dataTables_wrapper").replaceWith(buildAdminTable(data))
                $(".datatable").DataTable({"searching": true, "bFilter": false})
            }else{
                $("#dashboard").show(); $('.content2').hide();
                //buildCharts(); barChart(); $(window).resize(function(){ barChart() });
            }
        })
    })

    /*searchbar Animation*/
    $('.fa-search').on('click',function(e){
        $('.searchbar').css('width','350px')
        $('.searchbar').css('paddingLeft','20px')
        $('.fa-times').css('opacity',1)

        setTimeout(() => {
            $('.searchbar input').animate({paddingTop : '0px'},{duration: 200, queue: false})
                .animate({opacity: 1},300)
        },280)
    })

    $('.fa-times').on('click',function(e){
        $('.searchbar').css('width','45px')
        $('.searchbar').css('paddingLeft','0px')
        $('.fa-times').css('opacity',0)
        $('.searchbar input').animate({opacity: 0},300)
            .animate({paddingTop : '50px'})

    })

    /*ScrollToTop*/
    $(window).scroll(function(){
        $(this).scrollTop() > 100 ? $('.floating').css('display', 'flex')
            : $('.floating').fadeOut()
    })

    $('.floating').click(function(){
        $('html, body').animate({scrollTop : 0},800);
        return false;
    });

    $('.content2').on('click','.openMail',function(){
        let id = $(this).attr('candidate_id')
        let email = $(this).parents('#candidate-line').find('input[type="hidden"]').attr('email')
        if(id == undefined) $('#email-form .email-form-item input[name="to"]').val(email)
        else{
            $('#unlock-form .email-form-item input[name="to"]').val(email)
            $('#unlockModal input[name="id"]').val(id)
            let id_ = $('#unlockModal input[name="token"]').val()
            $(`.unlock[name=${id_}]`).find("i").removeClass("fa-lock")
            $(`.unlock[name=${id_}]`).find("i").addClass("fa-unlock")
        }
    })

    /*Unlock Form*/
    $('#unlock-form').on('submit',function(e){
        e.preventDefault()
        if(validateEmail(true)) sendMail(this,true)
    })

    /*Email Form*/
    $('#email-form').on('submit',function(e){
        e.preventDefault()
        if(validateEmail()) sendMail(this,false)
    })

    const validateEmail = (unlock) => {
        let validate = true;
        let field = unlock ? $('#unlock-form .email-form-item').children('input[name="to"]') : $('#email-form .email-form-item').children('input[name="to"]')
        if(!field.val().match("^[a-zA-Z0-9\._%+-]+@[a-zA-Z_-]+\.(com|fr|net)$")){
            swal('error','Invalid E-mail address','error')
            validate = false
        }
        return validate
    }

    let sendMail = function(that,unlock){
        let text = "The mail will be sent"
        if (unlock) text += " and the candidate's account unlocked"
        swal({title: "Are you sure?", text: text,
            buttons: { send: {closeModal: false}, cancel: "cancel"}})
            .then((change) => {
              if(change == null) throw null;
              else{
                  let data_ = $(that).serialize()
                  return  $.ajax({url: `admin/mail`, type: "POST", dataType:"text", data:data_})
              }})
            .then((response) => {
              if(response == "no token") window.location.href="../admission/page"
              let message = JSON.parse(response).message
              if(message == 'done'){
                  let modal = unlock? $('#unlockModal') : $('#mailModal')
                  if(unlock){
                      $('#unlock-form .email-form-item').children('input').val("")
                      $('#unlock-form .email-form-item').children('textarea').val("")
                  }else{
                      $('#email-form .email-form-item').children('input').val("")
                      $('#email-form .email-form-item').children('textarea').val("")
                  }
                  modal.find('button[data-dismiss="modal"]').click()
                  swal({text: "Done", icon: "success"});
              }else swal({text: message, icon: "error"})})
            .catch(err => {
              if(err) swal({text: "error while sending the mail", icon: "error"});
              swal.stopLoading();
              swal.close()})
    }


    /*Documents*/
    $('.content2').on('click','i[data-target="#documentModal"]',function(){
        let year = $('#pageSubmenu .sub-item-active').text().split('-')[1]
        let token = $('#email-form').find('input[name="token"]').val()
        let id = $(this).attr('candidate_id')

        $('#documentModal .modal-body').addClass('center')
        $('#documentModal .modal-body').html("<div class=\"spinner-border\" role=\"status\">\n" +
            "  <span class=\"sr-only\">Loading...</span>\n" +
            "</div>")

        Ajax(`admin/documents/${year}?id=${id}&token=${token}`,(data) => {
            if(data == "no token") window.location.href="../admission/page"
            $('#documentModal .modal-body').removeClass('center')
            data = JSON.parse(data)
            let docs = data.documents
            let html = ""
            docs.forEach(doc => {
                let doc_name = doc.path.split('\\')[3]; let tab = doc.path.split('.')
                let extension = tab[tab.length-1]
                let code =  '<div class="media"> ' +
                    '<a href="'+data.server+'/'+doc.path+`" class="mr-3" target="_blank"><i class="far ${extension == "pdf" ? 'fa-file-pdf' : 'fa-file-image'}" 
                                                                       style="color: ${extension == "pdf" ? 'red': '#1ad0ff'}; font-size: 250%"></i></a>` +
                    '<div class="media-body" style="font-size: 14px">' +
                    doc_name  +
                    '</div> ' +
                    '</div>'
                html+=code
            })
            $('#documentModal .modal-body').html(html)
        })
    })

    /* Payment */
    $('.content2').on('click','i[data-target="#paymentModal"]',function(){
        let year = $('#pageSubmenu .sub-item-active').text().split('-')[1]
        let token = $('#email-form').find('input[name="token"]').val()
        let id = $(this).attr('candidate_id')

        $('#paymentModal .modal-body').addClass('center')
        $('#paymentModal .modal-body').html("<div class=\"spinner-border\" role=\"status\">\n" +
            "  <span class=\"sr-only\">Loading...</span>\n" +
            "</div>")

        Ajax(`admin/paymentInfo/${year}?id=${id}&token=${token}`,(data) => {
            if(data == "no token") window.location.href="../admission/page"
            $('#paymentModal .modal-body').removeClass('center')
            data = JSON.parse(data)

            let methods = {
                "Bank Deposit": {src: "", alt: "Bank Deposit"},
                "PayPal": {src: "../assets/images/paypal.png", alt: "PayPal"},
            }
            let html = ""
            let method = data.paymentInfo.method
            if(data.paymentInfo.paid){
                html+= `<div style="display: flex; justify-content: space-between">
                 <div><span style="font-weight: bold">Method:</span>
                 <span style="font-style: italic; color: black">${method}</span></div>`
            }
            if(data.paymentInfo.proof != undefined){
               html+=`<a href='${data.server}/${data.paymentInfo.proof.path}' target='_blank'><i class='fa fa-receipt' style='font-size: 30px'></i></a></div>`
            }else html+= `<img class="paymentLogoMin" src="${methods[method].src}" alt="${methods[method].alt}" /> </div>`

            $('#paymentModal .modal-body').html(html)
        })
    })

    $('.content2').on('click','.archive',function(){
        //if($(this).parent().attr('href') == "javascript:void(0)"){
        let year = $('#pageSubmenu .sub-item-active').text()
        let token = $('#email-form').find('input[name="token"]').val()
        let id = $(this).attr('candidate_id')

        Ajax(`admin/archive/${id}?year=${year}&token=${token}`,(data) => {
            if(data == "no token") window.location.href="../admission/page"
            data = JSON.parse(data)
            window.location.href = `${data.server}/${data.archivePath}`
            // 	$(this).parent().attr('href',`${data.server}${data.archivePath}`)
        },(data) => {alert(data)})
        //	}
    })

    /* Cover */
    $('.content2').on('click','.status-item',function(e){

        let token = $('#email-form').find('input[name="token"]').val()
        let status = $(this).data('status')
        let id = $(this).parents('tr').find('a[candidate_id]').eq(0).attr('candidate_id')
        let application_id = $(this).parents('tr').find('a[application_id]').attr('application_id')
        $("#cover").css('display','flex')

        Ajax(`admin/applicationStatus/${id}?applicationId=${application_id}&status=${status}&token=${token}`,(data) => {
            if(data == "no token") window.location.href="../admission/page"
            $("#cover").hide()
            let class_ = status == 0 ? "status-In-Progress" : status == 1 ? "status-Submitted": status == 2 ? "status-Completed" : ""
            let statusText = status == 0 ? "In Progress" : status == 1 ? "submitted" : "completed"

            let statusField = $(this).parents('.dropdown').find('span')

            statusField.text(statusText)
            statusField.removeClass()
            statusField.addClass("status")
            statusField.addClass("btn")
            statusField.addClass("btn-secondary")
            statusField.addClass("dropdown-toggle")
            statusField.addClass(class_)

        },(data) => {
            $("#cover").hide()
            showSnackbar("une erreur est survenue","red")
        })

        //setTimeout( f => $('#cover').hide(),2000)
    })


    function Ajax(url_,success,error,data_,type="GET"){
        $.ajax({
            url:url_, type: type,
            dataType:"text", data:data_,
            success: function(data,statut){
                success(data)
            },
            error: function(data,statut){
                error(data)
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

    function AjaxPost(url_, data_,success,error) {
        $.ajax({
            url: url_,
            type: 'POST',
            dataType: "text",
            processData: false,
            contentType: false,
            enctype: "multipart/form-data",
            data: data_,
            error: function (resultat, statut, erreur) {
                error(erreur);
            },
            success: function (data, statut) {
                success(data);
            }
        });
    }

    /* IndexedDB */
    const request = window.indexedDB.open('Uploads',1)
    let db;

    request.onupgradeneeded = function(){
        db = request.result
        const store = db.createObjectStore('FileTabs',{keyPath: 'id'})
        let docs_1 = [
            {name: "file100", icon: "fa-envelope", title: "Lettre de candidature manuscrite", subtitle: "adressée au Directeur de l’Institut indiquant les raisons du choix de la formation. Le jury y portera une grande attention et appréciera la qualité de l’écrit, la capacité à structurer et à développer une argumentation"},
            {name: "file101", icon: "fa-sticky-note", title: "Fiche de renseignements 1er cycle", subtitle: "(Fiche A) (à télécharger sur internet ou à retirer dans votre centre d’examen). Y coller une photo d’identité de vous récente sur fond blanc"},
            {name: "file102", icon: "fa-book", title: "Bulletins trimestriels de notes", subtitle: "de la Seconde en Terminale"},
            {name: "file103", icon: "fa-briefcase", title: "Curriculum vitae", subtitle: " détaillé : études effectuées année par année depuis les études secondaires (éventuellement supérieures), diplômes obtenus, activités professionnelles, activités sportives et associatives."},
            {name: "file104", icon: "fa-graduation-cap", title: "Document attestant la réussite au baccalauréat", subtitle: "Pour les candidats déjà titulaires d’un baccalauréat : la copie d’un document attestant la réussite au baccalauréat (photocopies du relevé de notes, du diplôme, …) obtenu avant la date de dépôt : l’original devra être présenté lors de l’inscription."},
            {name: "file105", icon: "fa-id-card", title: "Carte d’identité nationale", subtitle: "Une photocopie certifiée de la carte d’identité nationale ou du récépissé."},
            {name: "file106", icon: "fa-portrait", title: "Acte de Naissance", subtitle: "copie certifiée conforme"},
            {name: "file107", icon: "fa-portrait", title: "Photo d’identité", subtitle: "A coller sur la fiche A"},
            {name: "file108", icon: "fa-sticky-note", title: "Fiche de choix de formation", subtitle: "(Fiche D) (à télécharger sur internet ou à retirer dans votre centre d’examen). Valable pour les candidats ayant fait plusieurs choix de formations sur la Fiche A."},
        ]

        let docs_2 = [
            {name: "file200", icon: "fa-envelope", title: "Lettre de candidature manuscrite", subtitle: "adressée au Directeur de l’Institut indiquant les raisons du choix de la formation. Le jury y portera une grande attention et appréciera la qualité de l’écrit, la capacité à structurer et à développer une argumentation"},
            {name: "file201", icon: "fa-sticky-note", title: "Les deux fiches de renseignements 2nd cycle + la fiche de choix de formation", subtitle: "(Fiche A) et Fiche de renseignements Ingénieur Généraliste parcours Intégré (Fiche B), Fiche de renseignements Ingénieur Informatique (Fiche B) ou Fiche de renseignements Ingénieur des Procédés (Fiche B) Et fiche D (choix de formation) (à télécharger sur internet ou à retirer dans votre centre d’examen).\n" +
                    "Y coller une photo d’identité de vous récente sur fond blanc."},
            {name: "file202", icon: "fa-book", title: "Bulletins de notes", subtitle: "photocopie certifiée conforme des relevés de note du Supérieur ainsi que des bulletins trimestriels des deux dernières années du Secondaire."},
            {name: "file203", icon: "fa-briefcase", title: "Curriculum vitae", subtitle: " détaillé : études effectuées année par année depuis les études secondaires (éventuellement supérieures), diplômes obtenus, activités professionnelles, activités sportives et associatives."},
            {name: "file204", icon: "fa-graduation-cap", title: "copie certifiée conforme des diplômes", subtitle: "copie certifiée conforme d’un document attestant la réussite au baccalauréat (photocopies du relevé de notes, du diplôme, …) et copie certifiée conforme des diplômes du supérieur "},
            {name: "file205", icon: "fa-id-card", title: "Carte d’identité nationale", subtitle: "Une photocopie certifiée de la carte d’identité nationale ou du récépissé."},
            {name: "file206", icon: "fa-portrait", title: "Acte de Naissance", subtitle: "copie certifiée conforme"},
            {name: "file207", icon: "fa-portrait", title: "Photo d’identité", subtitle: "A coller sur la fiche A"},
            {name: "file208", icon: "fa-envelope", title: "Deux lettres d’appréciations au mininmum", subtitle: " (Fiches C) à faire remplir par au moins un professeur de matière scientifique, à remettre sous plis fermés. Les identités des professeurs doivent être clairement indiquées (précisez la matière et l’établissement). Il leur est demandé de se prononcer sur la valeur du candidat selon le canevas proposé. Leurs avis sont confidentiels : ils doivent être communiqués sous enveloppes cachetées avec signature du rédacteur à cheval sur le rabat. Ce document est à télécharger sur internet ou à retirer dans votre centre d’examen)"},
        ]
        store.add({id: 1, data: docs_1})
        store.add({id: 2, data: docs_2})
    }

    request.onsuccess = function(){
        db = request.result
    }
    request.onblocked = function(){
        console.log("some error")
    }

    function buildAdminTable(candidates){
        let fields = ["#","Nom","Number","Cycle","Status","Creation Date","Submission Date","Folder","Payment","Actions"]
        let val=1

        let data = '<table class="table table-borderless datatable"><thead><tr>'

        fields.forEach(field => {
            data += `<th scope="col">${field}</th>`
        })

        data += '</tr></thead>' + '<tbody>'
        if(candidates.length != 0){

            candidates.forEach(candidate => {
                let creationDate= new Intl.DateTimeFormat('fr-FR',{year: "numeric", month: "numeric", day: "numeric",
                    hour: "numeric", minute: "numeric", second: "numeric",
                    hour12: false}).format(new Date(candidate.applications.creationDate))

                let submissionDate= new Intl.DateTimeFormat('fr-FR',{year: "numeric", month: "numeric", day: "numeric",
                    hour: "numeric", minute: "numeric", second: "numeric",
                    hour12: false}).format(new Date(candidate.applications.submissionDate))

                let status = candidate.applications.status
                let class_ = status == 0 ? "status-In-Progress" : status == 1 ? "status-Submitted": status == 2 ? "status-Completed" : ""
                let statusText = status == 0 ? "In Progress" : status == 1 ? "submitted" : "completed"

                data += '<tr id="candidate-line">' +
                    `<input type="hidden" email="${candidate.email}"/>` +
                    `<th scope="row">${val}</th>` +
                    `<td>${candidate.name} ${candidate.surname}</td>` +
                    `<td>${candidate.number}</td>` +
                    `<td>${candidate.applications.cycle}</td>` +
                    `<td>` +
                    `<div class="dropdown" style="padding: 0px 10px">` +
                    `<span class="status ${class_} btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${statusText}</span>` +
                    `<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">` +
                    `<a class="dropdown-item status-item" data-status=1 href="#">submitted</a>` +
                    `<a class="dropdown-item status-item" data-status=2 href="#">completed</a>` +
                    `</div>` +
                    `</div>` +
                    `</td>`+
                    `<td>${creationDate}</td>` +
                    `<td>${submissionDate}</td>` +
                    `<td style="position: relative"><i class="fa fa-folder-open icon-admin"  data-toggle="modal" data-target="#documentModal" candidate_id="${candidate._id}"></i></td>` +
                    `<td style="position: relative"><i class="fas fa-money-bill-wave icon-admin"  data-toggle="modal" data-target="#paymentModal" candidate_id="${candidate._id}"></i></td>` +
                    `<td style="position: relative">` +
                    `<div class="dropdown dropdown-action">` +
                      `<a href="javascript:void(0)" class="action-icon dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v icon-admin"></i></a>` +
                      `<div class="dropdown-menu dropdown-menu-right">` +
                      `<a class="dropdown-item openMail" href="javascript:void(0)" data-toggle="modal" data-target="#mailModal"><i class="far fa-envelope"></i> Send an E-mail</a>` +
                      `<a class="dropdown-item openMail unlock" href="javascript:void(0)" data-toggle="modal" data-target="#unlockModal" candidate_id="${candidate._id}" application_id="${candidate.applications._id}"><i class="fas fa-lock"></i> Unlock this application</a>` +
                      //`<a class="dropdown-item archive" href="javascript:void(0)" candidate_id="${candidate._id}"><i class="far fa-file-archive archive"></i> Download archived files</a>` +
                       `</div>` +
                    `</div>` +
                    /*`<i class="fas fa-ellipsis-v"></i>` +
                    `<i class="fas fa-lock icon-admin" data-toggle="modal" data-placement="top" title="unlock this application to allow the candidate to modify a document" data-target="#mailModal"></i>` +
                    `<i class="far fa-envelope icon-admin" data-toggle="modal" data-placement="top" title="send an e-mail" data-target="#mailModal"></i>` +
                    `<a href="javascript:void(0)" class="archive-link"><i class="far fa-file-archive icon-admin archive" data-toggle="tooltip" data-placement="top" title="Download archived files" candidate_id="${candidate._id}"></i></a>` +
                   */ `</td> </tr>`
                val++
            })
        }

        data += '</tbody></table>'
        return data
    }

    //Initializing tooltips
    $('[data-toggle="tooltip"]').tooltip()
    $('.collapse').collapse()
})(jQuery);
