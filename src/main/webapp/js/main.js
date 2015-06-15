$(document).ready(function () {
    var index = getUrlParameter('index');
    if (index === undefined || index === "") {
        mostrarDiv(1);
    }
    else {
        mostrarDiv(3);
        doPopulaCatalogacao(index);
    }

    /*
     * Inject listeners/callbacks
     */
    $(document)
            .ajaxSend(function () {
            setSpinnerRotating(true);
        })
            .ajaxStop(function () {
            setSpinnerRotating(false);
        });

    $("#idEntrar").click(doLogin);

    $("#idLimparBusca").click(clearBusca);
    $("#idLimparCat").click(clearCatalogo);
    
    $("#idBuscar").click(doBusca);
    $("#idPagProxima").click(doProximaBusca);
    $("#idPagAnterior").click(doAnteriorBusca);
    
    $("#idItemProximo").click(doProximaCatalogacao);
    $("#idItemAnterior").click(doAnteriorCatalogacao);
});

// Upstream: http://stackoverflow.com/questions/19491336/get-url-parameter-jquery
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1), sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
} 

function setSpinnerRotating(status) {
    var spinner = $('#idSpinner i');
    if(status) {
        spinner.addClass('fa-spin');
    } else {
        spinner.removeClass('fa-spin');
    }
}

function mostrarDiv(i) {
    if (i === 1) {
        // login
        document.getElementById('idDivLogin').style.display = "inline";
        document.getElementById('idDivBusca').style.display = "none";
        document.getElementById('idDivCatalogacao').style.display = "none";
    } else if (i === 2) {
        // busca
        document.getElementById('idDivLogin').style.display = "none";
        document.getElementById('idDivBusca').style.display = "inline";
        document.getElementById('idDivCatalogacao').style.display = "none";
    } else if (i === 3) {
        // catálogo
        document.getElementById('idDivLogin').style.display = "none";
        document.getElementById('idDivBusca').style.display = "none";
        document.getElementById('idDivCatalogacao').style.display = "inline";
    }
}
showDiv = mostrarDiv;

//function doLogin() {
//    $.ajax({
//        url: window.location.pathname + 'loginServlet',
//        method: 'POST',
//        data: {
//            user: $('#idUsuario').val(),
//            password: $('#idSenha').val()
//        },
//        success: function () {
//            console.log('INFO: Login succeeded.');
//            $('#idRespAutorizacao').html('');
//            clearLogin();
//            mostrarDiv(2);
//        },
//        error: function () {
//            console.log('INFO: Login failed.');
//            $('#idRespAutorizacao').html('Nome de usuário ou senha incorretos.');
//        }
//    });
//}

function doLogin() {
    console.log('INFO: Login succeeded.');
    $('#idRespAutorizacao').html('');
    clearLogin();
    mostrarDiv(2);
}

function clearLogin() {
    $('#idDivLogin form').trigger('reset');
    $('#idRespAutorizacao').html('');
}
clear1 = clearLogin;

function clearBusca() {
    $('#idpatrimonio2').val('');
    $('#idtitulo2').val('');
    $('#idautoria2').val('');
    $('#idveiculo2').val('');
    $('#iddatapublicacao2').val('');
    $('#idpalchave2').val('');
    $('#idTabelaResultados').val('');
    $('#idPaginaDestino').val('');
    $(':checked').removeAttr('checked');
    $('#idMsgDialogo2').html('');
    $("#idTabelaResultados").html('');
}
clear2 = clearBusca;

function clearCatalogo() {
    $('#idpatrimonio3').val('');
    $('#idtitulo3').val('');
    $('#idautoria3').val('');
    $('#idveiculo3').val('');
    $('#iddatapublicacao3').val('');
    $('#idpalchave3').val('');
    $('#idInputTypeFile').val('');
    $('#idNovoComentario').val('');
    $('#idComentarios').val('');
    $('#idMsgDialogo3').html('');
}
clear3 = clearCatalogo;

function getJsonBusca() {
    if($("#idPaginaDestino").val() === "") {
        $("#idPaginaDestino").val("1");
    }
    
    var jsonBusca = {
        idpatrimonio2: $("#idpatrimonio2").val(),
        idtitulo2: $("#idtitulo2").val(),
        idautoria2: $("#idautoria2").val(),
        idveiculo2: $("#idveiculo2").val(),
        iddatapublicacao2: $("#iddatapublicacao2").val(),
        idpalchave2: $("#idpalchave2").val(),
        idPaginaDestino: $("#idPaginaDestino").val(),
        idcheckpatrimonio: $("#idcheckpatrimonio").prop('checked'),
        idchecktituloOU: $("#idchecktituloOU").prop('checked'),
        idchecktituloE:  $("#idchecktituloE").prop('checked'),
        idcheckautoriaOU: $("#idcheckautoriaOU").prop('checked'),
        idcheckautoriaE:  $("#idcheckautoriaE").prop('checked'),
        idcheckveiculoOU: $("#idcheckveiculoOU").prop('checked'),
        idcheckveiculoE:  $("#idcheckveiculoE").prop('checked'),
        idcheckdatapublicacaoOU: $("#idcheckdatapublicacaoOU").prop('checked'),
        idcheckdatapublicacaoE:  $("#idcheckdatapublicacaoE").prop('checked'),
        idcheckpalchaveOU: $("#idcheckpalchaveOU").prop('checked'),
        idcheckpalchaveE:  $("#idcheckpalchaveE").prop('checked')
    };
    console.log("INFO: json busca:");
    console.log(jsonBusca);
    return jsonBusca;
}

function validateJsonBusca(json) {
    var ans = false;
    
    $("input[id^='id'][id$='OU'],#idcheckpatrimonio").each(function(index) {
        ans = ans || ($(this).prop('checked'));
    });
    
    console.log("INFO: validateJsonBusca: " + ans);
    return ans;
}

function popularBusca(json) {
    console.log("INFO: " + arguments.callee.name);
    
    $("#idTabelaResultados").append("<ul>");
    var list = $("#idTabelaResultados>ul");
    
    if(json.response.length === 0) {
        $("#idTabelaResultados").html('<p><strong>Nenhum livro correspondente à busca foi encontrado no banco de dados.</strong></p>');
        return;
    }
    
    $.each(json.response, function(index, value) {
        link = '#?index=' + value.patrimonio;
        description = value.patrimonio + ": " + value.titulo + " - " + value.autoria; 
        list.append('<li><a href="' + link + '">' + description + '</a></li><br />');
    });
}

function doBusca() {
    console.log("INFO: " + arguments.callee.name);
    $("#idMsgDialogo2").html('');
    $("#idTabelaResultados").html('');
    
    jsonBusca = getJsonBusca();
    
    isValid = validateJsonBusca(jsonBusca);
    if(!isValid) {
        $("#idMsgDialogo2").html('Erro! Por favor selecione pelo menos um critério de busca.');
        return;
    }
    
    $.ajax({
        url: window.location.pathname + 'buscaServlet',
        method: 'POST',
        data: jsonBusca,
        success: function (data, status, jqxhr) {
            var jsonResposta = data;
            console.log("INFO: Json do servlet da busca:");
            console.log(jsonResposta);
            popularBusca(data);
        },
        error: function () {
            $("#idMsgDialogo2").html('Um erro inesperado ocorreu no AJAX da busca.');
        }
    });
}

function doPopulaCatalogacao(patrimonio) {
    console.log("INFO: " + arguments.callee.name);
    $("#idMsgDialogo3").html('');
    
    $.ajax({
        url: window.location.pathname + 'catalogacaoServlet',
        method: 'POST',
        data: {
            "patrimonio": patrimonio
        },
        success: function (data, status, jqxhr) {
            var jsonResposta = data;
            console.log("INFO: Json do servlet da catalogação:");
            console.log(jsonResposta);
            // popularCatalogacao(data);
        },
        error: function () {
            $("#idMsgDialogo3").html('Um erro inesperado ocorreu no AJAX da catalogação.');
        }
    });
}

function doProximaCatalogacao() {
    var patrimonio = parseInt($("#idpatrimonio3").val());
    
    if(isNaN(patrimonio)) {
        patrimonio = 1;
    }
    else {
        patrimonio++;
    }
    
    $("#idpatrimonio3").val(patrimonio);
    doPopulaCatalogacao(patrimonio);
}

function doAnteriorCatalogacao() {
    var patrimonio = parseInt($("#idpatrimonio3").val());
    
    if(isNaN(patrimonio)) {
        patrimonio = 1;
    }
    else {
        patrimonio = Math.max(1, patrimonio - 1);
    }
    
    $("#idpatrimonio3").val(patrimonio);
    doPopulaCatalogacao(patrimonio);
}

function doProximaBusca() {
    var page = parseInt($("#idPaginaDestino").val());
    
    if(isNaN(page)) {
        page = 1;
    }
    else {
        page++;
    }
    
    $("#idPaginaDestino").val(page);
    doBusca();
}

function doAnteriorBusca() {
    var page = parseInt($("#idPaginaDestino").val());
    
    if(isNaN(page)) {
        page = 1;
    }
    else {
        page = Math.max(1, page - 1);
    }
    
    $("#idPaginaDestino").val(page);
    doBusca();
}