var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 */
function generirajPodatke(stPacienta) {
    generiraj(stPacienta);
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
// Funkcije so v loceni datoteki: funkcije.js
$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: 'https://jsonp.afeld.me/?url=http%3A%2F%2Fwww.topendsports.com%2Ftesting%2Fheart-rate-resting-chart.htm',
        success: function(data) {
            var tables = $(data).find('table');
            var t1 = tables.eq(0);
            var t2 = tables.eq(1);

            t1.addClass('table api');
            t2.addClass('table api');

            t1.find('h2').prepend('<i class="fa fa-male" aria-hidden="true"></i> ');
            t2.find('h2').prepend('<i class="fa fa-female" aria-hidden="true"></i> ');

            $('#table1').html(t1);
            $('#table2').html(t2);
        },
        error: function(err) {
            console.log(err);
        }
    });

    var heartRate = $('#heartRateResults');
    var bmiResults = $('#bmiResults');

    var dataHeartBeat = {
        labels: [],
        datasets: [
            {
                label: "Meritev srčnega utripa",
                backgroundColor: ["#1abc9c","#3498db","#9b59b6","#f1c40f","#e74c3c"],
                borderColor: ["#16a085","#2980b9","#8e44ad","#f39c12","#c0392b"],
                borderWidth: 2,
                data: [],
            }
        ]
    };

    var dataBMI = {
        labels: [],
        datasets: [
            {
              label: 'Indeks telesne mase',
              fill: true,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 2,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 5,
              pointHitRadius: 10,
              data: [],
            }
        ]
    };
    var bmiChart,heartRateChart;

    if (bmiResults && heartRate && bmiResults.length > 0 && heartRate.length > 0)
    {
        bmiChart = new Chart(bmiResults, {
          type: 'line',
          data: dataBMI,
          options: {
              scales: {
                      xAxes: [{
                              display: false
                      }],
                  }
              }
        });

        heartRateChart = new Chart(heartRate, {
          type: 'bar',
          data: dataHeartBeat,
          options: { scales: { xAxes: [{ display: false }] } }
        });
    }


    izpolniObrazec("#preberiObstojeciEHR","#preberiEHRzapis");
    izpolniObrazec("#preberiObstojeciVitalniZnak","#vnosMeritevVitalnihZnakov");

    $("#generiraj").click(function(){
        sestaviSporocilo("#globalnaSporocila","warning",true,"Poteka generiranje vzorčnih podatkov, prosimo počakajte!");
        generirajPodatke(1);
        generirajPodatke(2);
        generirajPodatke(3);
    });

    $("#preberiEHR").click(function(e){
        e.preventDefault();
        $("#EHR_ID_ACTIVE").val($("#EHR_ID").val());
        var ehrId = $("#EHR_ID_ACTIVE").val();

        osnovneInformacijePacienta();
        pridobiPodatkeIzvida(ehrId);
        posodobiVizualizacijo(dataBMI,dataHeartBeat,bmiChart,heartRateChart);

        $('.patient-data').slideDown();
    });

    $(".refresh").css('cursor','pointer');

    $(".refresh").click(function(){
        var ehrId = $("#EHR_ID_ACTIVE").val();
        pridobiPodatkeIzvida(ehrId);
        posodobiVizualizacijo(dataBMI,dataHeartBeat,bmiChart,heartRateChart);
    });

    $("#dodajMeritve").click(function(e){
        e.preventDefault();
        vnosVitalnihMeritev('',false,false,0,0);
    });


});
