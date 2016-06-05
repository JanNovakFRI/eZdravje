/** Funkcija za nakljucno generiranje datuma - vir: StackOverflow */
function nakljucniDatum(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/** Prvo crko v nizu spremeni v veliko */
function velikaZacetnica(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/** Pravilno formatira casovne vrednosti */
function popraviCas(time) {
    if (time == 0) return "00";
    if (parseInt(time) < 10) return "0" + time;
    else return time;
}

/**
    Funkcija samodejno izpolni polja na podlagi izbirnega menija
    @source - select meni
    @destination - div container z vnosnimi polji

    Za vec podatkov uporabi locilnik => |
**/
function izpolniObrazec(source, destination) {
    $("#" + $(destination).find('button').first().attr('id')).prop('disabled', true);

    $(source).find('input').on('input', function() {
        preveriVeljavnostObrazca(destination, "#" + $(destination).find('button').first().attr('id'));
    });

    $(source).on('change', function() {
        var value = $(this).val();
        var arr = value.split("|");

        $(destination).find('input').each(function(index, field) {
                if (source != destination)
                {
                    if (index >= arr.length) $(field).val('');
                    else $(field).val(arr[index]);
                }
        });

        preveriVeljavnostObrazca(destination, "#" + $(destination).find('button').first().attr('id'));
    });
}


function preveriVeljavnostObrazca(source, button) {
    var blank = false;
    $(source).find('input').each(function(index, el) {
        if ($(el).val().trim() == '') blank = true;
    });

    if (blank) $(button).prop('disabled', true);
    else $(button).prop('disabled', false);
}

function sestaviSporocilo(location, type, append, message) {
    var message =
        `<div class="msg alert alert-` + type + ` alert-dissmissable" role="alert" style="display: none;">
        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
        ` + message + `
    </div>`;

    if (append) $(message).appendTo($(location)).fadeIn();
    else {
        $(location).html('');
        $(message).appendTo($(location)).fadeIn();
    }

}

function nastaviUporabnika(pacient, rojstvo) {
    $("#patient-name").html(pacient);
    $("#patient-birthday").html(rojstvo);
}

function nakljucnoStevilo(min, max) {
    return Math.random() * (max - min) + min;
}

function vnosVitalnihMeritev(pacient, globalno, random, teza, visina, callback, callbackData) {
    var ehr = $("#EHR_ID_ACTIVE").val();
    if (pacient != "") ehr = pacient;

    sessionId = getSessionId();

    var datumInUra, telesnaVisina, telesnaTeza, telesnaTemperatura,
        sistolicniKrvniTlak, sistolicniKrvniTlak, diastolicniKrvniTlak,
        srcniUtrip, nasicenostKrviSKisikom, nasicenostKrviSKisikom, merilec;

    if (!random) {
        var date = new Date();

        datumInUra = date.getFullYear() + "-" + popraviCas(date.getMonth() + 1) + "-" + popraviCas(date.getDate()) + "T" + popraviCas(date.getHours()) + ":" + popraviCas(date.getMinutes()) + ":" + popraviCas(date.getSeconds());

        telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
        telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
        telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
        sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
        diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
        srcniUtrip = $("#dodajSrcniUtrip").val();
        nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
        merilec = "medicinska sestra Maja";
    } else {
        var date = new Date();

        datumInUra = date.getFullYear() + "-" + popraviCas(date.getMonth() + 1) + "-" + popraviCas(date.getDate()) + "T" + popraviCas(date.getHours()) + ":" + popraviCas(date.getMinutes()) + ":" + popraviCas(date.getSeconds());
        telesnaVisina = visina;
        telesnaTeza = teza;
        telesnaTemperatura = nakljucnoStevilo(35, 42);
        sistolicniKrvniTlak = nakljucnoStevilo(120, 140);
        diastolicniKrvniTlak = nakljucnoStevilo(80, 90);
        srcniUtrip = nakljucnoStevilo(50, 120);
        nasicenostKrviSKisikom = nakljucnoStevilo(90, 98);
        merilec = "medicinska sestra Maja";
    }


    if (!ehr || ehr.trim().length == 0) {
        if (!globalno) sestaviSporocilo("#dodajMeritveVitalnihZnakovSporocilo", "warning", false, "Prosimo vnesite zahtevane podatke!");
        else sestaviSporocilo("#globalnaSporocila", "warning", true, "Napaka: Podatki niso v celoti vnešeni!");
    } else {

        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });

        var podatki = {
            "ctx/language": "en",
            "ctx/territory": "SI",
            "ctx/time": datumInUra,
            "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
            "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
            "vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
            "vital_signs/body_temperature/any_event/temperature|unit": "°C",
            "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
            "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
            "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom,
            "vital_signs/pulse:0/any_event:0/rate|magnitude": srcniUtrip,
            "vital_signs/pulse:0/any_event:0/rate|unit": "/min"
        };

        var parametriZahteve = {
            ehrId: ehr,
            templateId: 'Vital Signs',
            format: 'FLAT',
            committer: merilec
        };

        $.ajax({
            url: baseUrl + "/composition?" + $.param(parametriZahteve),
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(podatki),
            success: function(res) {
                if (callback) callback(callbackData.ehr,callbackData.ime,callbackData.priimek);
                if (!globalno) sestaviSporocilo("#dodajMeritveVitalnihZnakovSporocilo", "success", false, "Meritve uspešno vnesene. Osvežite podatke!");
            },
            error: function(err) {
                if (!globalno) sestaviSporocilo("#dodajMeritveVitalnihZnakovSporocilo", "danger", false, "Napaka: " + JSON.parse(err.responseText).userMessage);
                else sestaviSporocilo("#globalnaSporocila", "danger", true, "Napaka: " + JSON.parse(err.responseText).userMessage);
            }
        });

    }
}

function osnovneInformacijePacienta() {
    sessionId = getSessionId();

    var ehrId = $("#EHR_ID_ACTIVE").val();

    if (!ehrId || ehrId.trim().length == 0) {
        sestaviSporocilo("#globalnaSporocila", "warning", true, "Prosimo vnesite zahtevane podatke!");
    } else {
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(data) {
                var party = data.party;
                var date = new Date(party.dateOfBirth);

                var rojstvo = date.getFullYear() + "-" + popraviCas(date.getMonth()) + "-" + popraviCas(date.getDay());
                var ura = popraviCas(date.getHours()) + ":" + popraviCas(date.getMinutes());

                nastaviUporabnika(velikaZacetnica(party.firstNames) + " " + velikaZacetnica(party.lastNames), rojstvo);
            },
            error: function(err) {
                sestaviSporocilo("#globalnaSporocila", "danger", true, "Napaka: " + JSON.parse(err.responseText).userMessage);
            }
        });
    }
}

function posodobiVizualizacijo(dataBMI, dataHR, chartBMI, chartHR) {
    var ehrId = $("#EHR_ID_ACTIVE").val();

    $('.patient-graph-info').hide();
    vizualizirajSrcniUtrip(dataHR, chartHR, ehrId);
    vizualizirajITM(dataBMI, chartBMI, ehrId);
    $('.patient-graph-info').fadeIn();
}

function vizualizirajSrcniUtrip(data, chart, id) {
    var ehrId = id;
    sessionId = getSessionId();

    var AQL = "select " +
        "a_a/data[at0002]/events[at0003]/time/value as time, " +
        "a_a/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as pulse " +
        "from EHR e[e/ehr_id/value='" + ehrId + "'] " +
        "contains OBSERVATION a_a[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1] " +
        "order by a_a/data[at0002]/events[at0003]/time/value desc " +
        "offset 0 limit 5";

    var labels = [],
        values = [];
    $.ajax({
        url: baseUrl + "/query?" + $.param({
            "aql": AQL
        }),
        type: 'GET',
        headers: {
            "Ehr-Session": sessionId
        },
        success: function(res) {

            if (res) {
                var rows = res.resultSet;
                for (var i in rows) {
                    labels.push("Čas meritve: " + formatirajCas(rows[i].time));
                    values.push(zaokrozi(rows[i].pulse));
                }

                data.labels = labels;
                data.datasets[0].data = values;

                chart.update();
            } else {
                data.labels = [];
                data.datasets[0].data = [];
                chart.update();
                sestaviSporocilo("#globalnaSporocila", "warning", true, "Ni podatkov ali so pomankljivi, vnesite vzorčne meritve!");
            }
        },
        error: function(err) {
            sestaviSporocilo("#globalnaSporocila", "danger", true, "Napaka: " + JSON.parse(err.responseText).userMessage);
        }
    });
}

function vizualizirajITM(data, chart, id) {
    var ehrId = id;
    sessionId = getSessionId();

    var AQL = "select " +
        "a_b/data[at0002]/events[at0003]/time as time, " +
        "a_b/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as weight, " +
        "a_a/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as height " +
        "from EHR e[ehr_id/value='" + ehrId + "'] " +
        "contains COMPOSITION a " +
        "contains ( " +
        "    OBSERVATION a_a[openEHR-EHR-OBSERVATION.height.v1] and " +
        "    OBSERVATION a_b[openEHR-EHR-OBSERVATION.body_weight.v1]) " +
        "order by a_b/data[at0002]/events[at0003]/time desc " +
        "offset 0 limit 10"

    var labels = [],
        values = [];
    $.ajax({
        url: baseUrl + "/query?" + $.param({
            "aql": AQL
        }),
        type: 'GET',
        headers: {
            "Ehr-Session": sessionId
        },
        success: function(res) {

            if (res) {
                var rows = res.resultSet;
                for (var i in rows) {
                    labels.push("Čas meritve: " + formatirajCas(rows[i].time.value));
                    values.push(Math.round(parseFloat(rows[i].weight) / (Math.pow(parseFloat(rows[i].height) / 100, 2)) * 100) / 100);
                }

                data.labels = labels;
                data.datasets[0].data = values;

                chart.update();
            } else {
                data.labels = [];
                data.datasets[0].data = [];
                chart.update();
                sestaviSporocilo("#globalnaSporocila", "warning", true, "Ni podatkov ali so pomankljivi, vnesite vzorčne meritve!");
            }
        },
        error: function(err) {
            sestaviSporocilo("#globalnaSporocila", "danger", true, "Napaka: " + JSON.parse(err.responseText).userMessage);
        }
    });
}

function formatirajCas(date) {
    var year = date.substring(0, 4);
    var month = date.substring(5, 7);
    var day = date.substring(8, 10);
    var hour = date.substring(11, 13);
    var minute = date.substring(14, 16);
    var seconds = date.substring(17, 19);

    return day + "." + month + "." + year + " " + hour + ":" + minute + ":" + seconds;
}

function sestaviStanje(type) {
    if (type == 'low') return '<span class="label label-warning">NIZKO</span>';
    else if (type == 'high') return '<span class="label label-warning">VISOKO</span>';
    else if (type == 'normal') return '<span class="label label-success">NORMALNO</span>';
    else if (type == 'extreme') return '<span class="label label-danger">PREVISOKO</span>';
    else if (type == 'undefined') return '<span class="label label-default">NI PODATKA</span>';
}

function pridobiPodatkeIzvida(ehr) {
    var AQL = "select " +
        "a_a/data[at0002]/events[at0003]/time as time, " +
        "a_a/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temp, " +
        "a_f/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as pulse, " +
        "a_b/data[at0001]/events[at0006]/data[at0003]/items[at0005]/value/magnitude as diastolic, " +
        "a_d/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as weight, " +
        "a_b/data[at0001]/events[at0006]/data[at0003]/items[at0004]/value/magnitude as systolic, " +
        "a_c/data[at0001]/events[at0002]/data[at0003]/items[at0004]/value/magnitude as d_height, " +
        "a_g/data[at0001]/events[at0002]/data[at0003]/items[at0006]/value/numerator as oximetry " +
        "from EHR e[ehr_id/value='" + ehr + "'] " +
        "contains COMPOSITION a " +
        "contains ( " +
        "OBSERVATION a_a[openEHR-EHR-OBSERVATION.body_temperature.v1] or " +
        "OBSERVATION a_b[openEHR-EHR-OBSERVATION.blood_pressure.v1] or " +
        "OBSERVATION a_c[openEHR-EHR-OBSERVATION.height.v1] or " +
        "OBSERVATION a_d[openEHR-EHR-OBSERVATION.body_weight.v1] or " +
        "OBSERVATION a_f[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1] or " +
        "OBSERVATION a_g[openEHR-EHR-OBSERVATION.indirect_oximetry.v1] ) " +
        "order by a_a/data[at0002]/events[at0003]/time desc " +
        "offset 0 limit 1";

    $.ajax({
        url: baseUrl + "/query?" + $.param({
            "aql": AQL
        }),
        type: 'GET',
        headers: {
            "Ehr-Session": sessionId
        },
        success: function(res) {
            if (res) {
                var rows = res.resultSet;
                for (var i in rows) {
                    nastaviPodatkeIzvida(rows[i].d_height, rows[i].weight, rows[i].temp, rows[i].systolic, rows[i].diastolic, rows[i].oximetry, rows[i].pulse);
                }
            } else {
                nastaviPodatkeIzvida(undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                sestaviSporocilo("#globalnaSporocila", "warning", true, "Ni podatkov ali so pomankljivi, vnesite vzorčne meritve!");
            }
        },
        error: function(err) {
            sestaviSporocilo("#globalnaSporocila", "danger", true, "Napaka: " + JSON.parse(err.responseText).userMessage);
        }
    });


}

function nastaviPodatkeIzvida(height, weight, temp, preasure1, preasure2, blood, pulse) {
    $('.patient-detail-info').hide();
    nastaviPostavkeIzvida("#patient-height", height, "cm", 1);
    nastaviPostavkeIzvida("#patient-weight", weight, "kg", 2);

    var bmi = Math.round(parseFloat(weight) / (Math.pow(parseFloat(height) / 100, 2)) * 100) / 100;
    if (weight === undefined || height === undefined) bmi = undefined;

    nastaviPostavkeIzvida("#patient-bmi", bmi, "", 3);
    nastaviPostavkeIzvida("#patient-temperature", temp, "˚C", 4);
    nastaviPostavkeIzvida("#patient-pressure-1", preasure1, "", 5);
    nastaviPostavkeIzvida("#patient-pressure-2", preasure2, "", 6);
    nastaviPostavkeIzvida("#patient-blood", blood, "%", 7);
    nastaviPostavkeIzvida("#patient-pulse", pulse, "", 8);
    $('.patient-detail-info').fadeIn();
}

function nastaviPostavkeIzvida(postavka, vrednost, enota, omejitve) {
    if (vrednost !== undefined && vrednost !== '' && vrednost != null && !isNaN(vrednost)) $(postavka).children().eq(1).html(zaokrozi(vrednost) + " " + enota);
    else $(postavka).children().eq(1).html("-");
    $(postavka).children().eq(2).html(sestaviStanje(pridobiStanje(vrednost, omejitve)));
}

function pridobiStanje(vrednost, omejitev) {
    if (vrednost === undefined || vrednost === '' || vrednost == null) return 'undefined';

    // visina
    if (omejitev == 1) {
        if (vrednost >= 150 && vrednost <= 210) return 'normal';
        else if (vrednost < 150) return 'low';
        else if (vrednost > 210) return 'high';
    } else if (omejitev == 2) // teza
    {
        if (vrednost >= 50 && vrednost <= 90) return 'normal';
        else if (vrednost > 90 && vrednost <= 110) return 'high';
        else if (vrednost < 50) return 'low';
        else if (vrednost > 110) return 'extreme';
    } else if (omejitev == 3) // itm
    {
        if (vrednost >= 20 && vrednost <= 25) return 'normal';
        else if (vrednost > 25 && vrednost <= 30) return 'high';
        else if (vrednost > 30) return 'extreme';
        else if (vrednost < 20) return 'low';
    } else if (omejitev == 4) // temperatura
    {
        if (vrednost >= 35.5 && vrednost <= 37) return 'normal';
        else if (vrednost > 37 && vrednost <= 39) return 'high';
        else if (vrednost > 39) return 'extreme';
        else if (vrednost < 35.5) return 'low';
    } else if (omejitev == 5) // sistolicni
    {
        if (vrednost <= 129) return 'normal';
        else if (vrednost > 129 && vrednost <= 139) return 'high';
        else if (vrednost > 139) return 'extreme';
    } else if (omejitev == 6) // diastolicni
    {
        if (vrednost <= 84) return 'normal';
        else if (vrednost > 84 && vrednost <= 89) return 'high';
        else if (vrednost > 89) return 'extreme';
    } else if (omejitev == 7) // oximetry
    {
        if (vrednost <= 94) return 'low';
        else if (vrednost > 94) return 'normal';
    } else if (omejitev == 8) // pulse
    {
        if (vrednost <= 45) return 'low';
        else if (vrednost > 45 && vrednost <= 90) return 'normal';
        else if (vrednost > 90 && vrednost <= 120) return 'high';
        else if (vrednost > 120) return 'extreme';
    }
}

function zaokrozi(num) {
    return Math.round(num * 100) / 100;
}

function generiraj(userID) {
    sessionId = getSessionId();

    var seed = nakljucnoStevilo(0,10000000);

    $.ajax({
        url: 'https://randomuser.me/api/?nat=us,gb,de&inc=name&seed=' + Math.round(seed),
        dataType: 'json',
        success: function(data) {
            var date = nakljucniDatum(new Date(1920, 0, 1), new Date(2000, 0, 1));

            var ime = velikaZacetnica(data.results[0].name.first);
            var priimek = velikaZacetnica(data.results[0].name.last);

            var rojstvo_dan = date.getFullYear() + "-" + popraviCas(date.getMonth() + 1) + "-" + popraviCas(date.getDate());
            var rojstvo_ura = popraviCas(date.getHours()) + ":" + popraviCas(date.getMinutes());

            var datumRojstva = rojstvo_dan + "T" + rojstvo_ura;

            if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
                sestaviSporocilo("#globalnaSporocila", "warning", true, "[Generiranje uporabnikov] Prosimo vnesite zahtevane podatke!");
            } else {
                $.ajaxSetup({
                    headers: {
                        "Ehr-Session": sessionId
                    }
                });
                $.ajax({
                    url: baseUrl + "/ehr",
                    type: 'POST',
                    success: function(data) {
                        var ehrId = data.ehrId;
                        
                        var partyData = {
                            firstNames: ime,
                            lastNames: priimek,
                            dateOfBirth: datumRojstva,
                            partyAdditionalInfo: [{
                                key: "ehrId",
                                value: ehrId
                            }]
                        };

                        $.ajax({
                            url: baseUrl + "/demographics/party",
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(partyData),
                            success: function(party) {
                                if (party.action == 'CREATE') {

                                    var initTeza = nakljucnoStevilo(62, 120);
                                    var initVisina = nakljucnoStevilo(160, 210);

                                    var success = function(ehr,ime,priimek) {
                                        sestaviSporocilo("#globalnaSporocila", "success", true,
                                            "Pacient <span class='patient-special'>" + ime + " " + priimek + "</span>, EHR ID: <span class='patient-special'>" + ehr + "</span>"
                                        );
                                    }

                                    var callback_data = {
                                            ime: ime,
                                            priimek: priimek,
                                            ehr: ehrId
                                    };

                                    vnosVitalnihMeritev(ehrId, true, true, initTeza, initVisina);
                                    vnosVitalnihMeritev(ehrId, true, true, nakljucnoStevilo(initTeza - 5, initTeza + 5), initVisina + 2);
                                    vnosVitalnihMeritev(ehrId, true, true, nakljucnoStevilo(initTeza - 5, initTeza + 5), initVisina + 2);
                                    vnosVitalnihMeritev(ehrId, true, true, nakljucnoStevilo(initTeza - 5, initTeza + 5), initVisina + 2);
                                    vnosVitalnihMeritev(ehrId, true, true, nakljucnoStevilo(initTeza - 5, initTeza + 5), initVisina + 2, success,callback_data);
                                }
                            },
                            error: function(err) {
                                sestaviSporocilo("#kreirajSporocilo", "danger", false, "Napaka: " + JSON.parse(err.responseText).userMessage);
                            }
                        });
                    }
                });
            }
        }
    });
}

var map, infowindow, ljubljana, service;

function initMap() {
    ljubljana = new google.maps.LatLng(46.055376, 14.505751499999974);

    var request = {
        location: ljubljana,
        radius: 50000,
        types: ['hospital']
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: ljubljana,
        zoom: 12
    });

    map.setCenter(ljubljana);

    google.maps.event.addDomListener(document.getElementById('preberiEHR'), 'click', function() {
        var elem = document.getElementById("map");
        google.maps.event.trigger(map, 'resize');
    });

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;

    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}
