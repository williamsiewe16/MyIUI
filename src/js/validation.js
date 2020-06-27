jQuery(function($){

    let viewpay_transaction_url_in = "https://view-pay.com/api/repo/cash/in";
    let viewpay_transaction_url_out = "https://view-pay.com/api/repo/cash/out";
    let monetbil_transaction_url = "https://api.monetbil.com/payment/v1/placePayment";
    let validate_url = "http://localhost/BDE_Website/PHP_server/treat_transactions.php";


    function TransactionNumberIsValid(){
        let num = $('#phone').val();

        if(num.match("^6([0-9]{8})$")){
            return true;
        }else{
            alert('Mauvais numéro de téléphone');
            return false
        }
    }

    $(".cash_in").on('click',function(e){
                let transaction_data = {
                    operator_code: "ORANGE_CMR",
                    amount: 500,
                    token: "",
                    number: "237695893880",
                    client_reference: new Date().getTime(),
                    have_prefix: true,
                    callback: "http://localhost/admission/test"
                }

                console.log(transaction_data)

                Ajax(viewpay_transaction_url_in,transaction_data,'POST',function(data){
                    console.log(data)
                })
                let url = "http://www.ip-api.com/json/145.25.65.41"
                   /* "http://localhost:3000/admission/login"*/
                /*Ajax(url,{},'GET',function(data){
                    console.log(data)
                })*/
    })

    $(".cash_out").on('click',function(e){
                let transaction_data = {
                    operator_code: "ORANGE_CMR",
                    amount: 500,
                    token: "",
                    number: "237695893880",
                }

                console.log(transaction_data)

                Ajax(viewpay_transaction_url_out,transaction_data,'POST',function(data){
                    console.log(data)
                })
    });

    function AjaxPost(url_, data_,success) {
        $.ajax({
            url: url_,
            type: 'POST',
            dataType: "text",
            processData: false,
            contentType: false,
            enctype: "multipart/form-data",
            data: data_,
            error: function (resultat, statut, erreur) {
                console.error(erreur);
            },
            success: function (data, statut) {
                success(data);
            }
        });
    }

    function Ajax(url_, data_, method_, success) {
        $.ajax({
            url: url_,
            type: method_,
            dataType: "application/json",
            data: data_,
            error: function (resultat, statut, erreur) {
                console.error(erreur);
            },
            success: function (data, statut) {
                success(data);
            }
        });
    }


});