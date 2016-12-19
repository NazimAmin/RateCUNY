$(document).ready(function () {
    $CACHE_DATA = {};
    asyncRequest('https://ratesbu.firebaseio.com/names.json', 'GET', function (response) {
        $CACHE_DATA = JSON.parse(response);
    });
    attachEvents();
});

function attachEvents() {
    //check to see if we are in "Search for Classes" page
    var _iframe = $('#ptifrmtgtframe').contents();
    if (_iframe && $(_iframe).find('a#CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH').length > 0) {
        $(_iframe).bind('load change', function () {
            $(_iframe.find('head')).append($('<link>')
                .attr("rel", "stylesheet")
                .attr("type", "text/css")
                .attr("href",
                    chrome.extension.getURL('quality.css')));
            var search_button = $("#ptifrmtgtframe").contents().find("a#CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH");
            $(search_button).on("click", function (e) {
                passThrough();
            });
            $(_iframe).keypress(function (event) {
                if (event.which == 13) {
                    passThrough();
                }
            });
        });
        $(_iframe).trigger('change');
    } else {
        setTimeout(attachEvents, 2000);
    }
}

function passThrough() {
    var iframe = $('#ptifrmtgtframe').contents();
    //check if there is any professor's name on the page
    var existsInIframe = iframe.find('span[id="MTG_INSTR\\$0"]').text();
    var getSchoolName = iframe.find('span[id="DERIVED_CLSRCH_SSS_PAGE_KEYDESCR"]').text().split("|")[0].toString();
    if (existsInIframe && getSchoolName) {
        var getRateSchool = getSchoolNameFromDictionary(getSchoolName);
        getInstructors(iframe, getRateSchool);
    } else {
        setTimeout(passThrough, 2000);
    }
}
/*
- looks through the DOM and gets professors 'name
*/
function getInstructors(iframe, schoolname) {
    iframe.find('span[id*="MTG_INSTR"]').each(function () {
        var profName = $(this).text().split('\n');
        if (profName) {
            var id = $(this).attr("id");
            profName = profName.toString().split(',');
            $.each(profName, function (index, value) {
                if (!value.toLocaleLowerCase().includes('staff')) {
                    if (value.length > 1) {
                        var pName = undefined;
                        var _name = value.toString().replace(/ /g, '');
                        var names = $CACHE_DATA;
                        if (names.hasOwnProperty(_name)) {
                            pName = names[_name];
                        }
                        var link = 'https://ratesbu-wrapper-api.appspot.com/' + schoolname + ' / ' + (pName || value);
                        asyncRequest(link, 'GET', function (response) {
                            append_response(id, value, response);
                        });
                    }
                }
            });
        }
    });
}

function asyncRequest(link, method, callback) {
    chrome.runtime.sendMessage({
        method: method,
        action: 'xhttp',
        url: link,
        data: ""
    }, function (response) {
        callback(response);
    });
}

function append_response(div_id, name, response) {
    response = JSON.parse(response);
    var O_Q_T = ' ';
    var E_T_T = ' ';
    var _href = ' ';
    var o_q = 'N/A';
    var t_a = 'N/A';
    var d_q = 'N/A';
    var r_c = '#AEB9BD';
    var pid = name.replace(/\W/g, '');
    var _id = div_id.replace("$", "\\$");
    var iframe = $('#ptifrmtgtframe').contents();
    var parentDiv = iframe.find('#win0div' + _id);
    var _display = response['hotness'] == 2 || response['hotness'] == 3 ? "visible" : "hidden";
    if (response && response['id']) {
        pid = pid + response['id'];
        O_Q_T = response['ratingText'];
        E_T_T = response['easinessText'];
        o_q = response['avgRating'] ? response['avgRating'].toFixed(2) : 'N/A';
        d_q = response['avgEasiness'] ? response['avgEasiness'].toFixed(2) : 'N/A';
        t_a = response['wouldTakeAgainPercent'] ? response['wouldTakeAgainPercent'] + '%' : 'N/A';
        r_c = response['hotness'] == 2 ? '#FF9F00' : '#CD1A07';
        _href = 'href="http://www.example.com/Ratings.jsp?tid=' + response['id'] + '"';
    }
    if (parentDiv.children(':first').attr('id') == div_id) {
        parentDiv.children().remove();
    }

    //add it back with info
    if (!parentDiv.find("#" + pid).attr('id')) {
        parentDiv.append('<a class="nostyle" ' + _href + ' target="_blank"><div id="' + pid + '" class="wrap-quality"><svg width="177px" height="67px" viewBox="550 285 177 67" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="rating" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(550.000000, 286.000000)"><g id="name" transform="translate(0.000000, 6.000000)"><rect id="Rectangle" fill="#DFF8FF" x="0" y="0" width="173" height="59" rx="23"></rect><text id="Turhan-Canli" font-family="Helvetica" font-size="14" font-weight="normal" fill="#000000"><tspan x="14" y="16.1549296">' + name + '</tspan></text></g><g id="hotness"  transform="translate(149.000000, 0.000000)"><g id="Group"><circle id="Oval" visibility="' + _display + '" stroke="#FFFFFF" fill="#54FFC8" cx="12.5" cy="12.5" r="12.5"></circle><g id="rate_icon" visibility="' + _display + '" transform="translate(3.000000, 4.000000)" fill="' + r_c + '"><path d="M17.9573024,1.82918581 C17.6005592,1.48177574 17.0301217,1.48881153 16.6826758,1.84562659 C16.3352657,2.20240575 16.3423374,2.77284319 16.6991165,3.12025326 C16.7020242,3.12319681 16.9972761,3.46590439 16.969097,4.12141744 C16.9566408,4.41092584 16.8704883,4.83752445 16.5942258,5.38843398 C16.8829804,5.54867768 17.150484,5.74119269 17.3852137,5.97118404 C17.5976156,6.17942189 17.7806898,6.41630544 17.9377745,6.67339895 C18.4482642,5.82422219 18.7359777,4.99676304 18.7701516,4.19830858 C18.8334737,2.72707465 18.0471164,1.91663063 17.9573024,1.82918581 L17.9573024,1.82918581 Z" id="Shape"></path><path d="M11.3982281,7.59871036 C7.83829794,12.5640755 4.23629659,12.8187639 2.34198195,12.8187639 C2.12538013,12.8187639 1.93114208,12.815246 1.76213953,12.815246 C1.10310858,12.815246 0.821425705,12.8656811 1.07083728,13.3580787 C1.66173594,14.5258763 4.3571973,15.9554339 7.6681467,15.9554339 C10.3348188,15.9554339 13.4005206,15.027643 16.0853924,12.2882438 C17.439782,10.906788 17.9398256,8.13745085 16.5589441,6.78356385 C16.028424,6.26366923 15.3113119,6.03184713 14.5654823,6.03184713 C13.3665622,6.03184713 12.0930842,6.63042773 11.3982281,7.59871036 Z" id="Shape"></path><path d="M3.18821072,10.5406795 C3.12054509,9.66379035 3.28412721,7.67449255 5.89785136,6.55433019 C5.89785136,6.55433019 4.9275226,8.90116098 6.24177944,10.0885223 C7.19530845,9.34434395 7.86604179,8.12887535 7.93485612,6.95335999 C8.13261207,3.56254002 5.76521236,1.77792627 4.22821534,0.982774324 C4.07098697,0.901180699 3.87904632,0.928749508 3.75175596,1.05201942 C3.62381945,1.17467908 3.58917895,1.36536335 3.66431114,1.52560705 C4.25815334,2.78619804 4.65779339,5.04141998 2.11737068,7.66634396 C1.34174664,8.46727531 1.97374724,9.94069894 3.18821072,10.5406795 L3.18821072,10.5406795 Z" id="Shape"></path></g></g></g><g id="overall_rating" transform="translate(10.000000, 17.000000)"><text id="3.31" font-family="Helvetica-Bold, Helvetica" font-size="16" font-weight="bold" fill="#013546"><tspan x="10.3379039" y="31.3040877">' + o_q + '</tspan></text><text id="Overall-Rating" font-family="Helvetica" font-size="6" font-weight="bold" fill="#757879"><tspan x="7.66895195" y="15.5882353">Overall Rating</tspan></text><text id="Average" font-family="Helvetica-Light, Helvetica" font-size="6" font-weight="bold" fill="#757879"><tspan x="13.6054847" y="39.1176471">' + O_Q_T + '</tspan></text></g><g id="difficulty" transform="translate(65.555729, 17.000000)"><text id="2.51" font-family="Helvetica-Bold, Helvetica" font-size="16" font-weight="bold" fill="#013546"><tspan x="11.3379039" y="31.3040877">' + d_q + '</tspan></text><text id="Difficulty-Level" font-family="Helvetica" font-size="6" font-weight="bold" fill="#757879"><tspan x="7.66895195" y="15.5882353">Difficulty Level</tspan></text><text id="Tough" font-family="Helvetica-Light, Helvetica" font-size="6" font-weight="bold" fill="#757879"><tspan x="17.0068559" y="39.1176471">' + E_T_T + '</tspan></text></g><g id="take_again" transform="translate(121.111458, 17.000000)"><text id="100%" font-family="Helvetica-Bold, Helvetica" font-size="15" font-weight="bold" fill="#013546"><tspan x="5.80274234" y="31.3040877">' + t_a + '</tspan></text><text id="Take-it-again?" font-family="Helvetica" font-size="6" font-weight="bold" fill="#757879"><tspan x="5.66895195" y="15.5882353">Take it again?</tspan></text></g></g></svg></div></a>');
    }
}

function getSchoolNameFromDictionary(name) {
    var _name = name.toString().replace(/ /g, '');
    var names = {
        "BaruchCollege": "Baruch College",
        "BoroughofManhattanCC": "Borough of Manhattan Community College",
        "BronxCommunityCollege": "Bronx Community College",
        "BrooklynCollege": "Brooklyn College",
        "CUNYSchoolofLaw": "CUNY School of Law",
        "CUNYSchoolofMedicine": "CUNY School of Medicine",
        "CUNYSchoolofPublicHealth": "CUNY School of Public Health",
        "CityCollege": "City College of New York",
        "CollegeofStatenIsland": "College of Staten Island",
        "GuttmanCommunityCollege": "Guttman Community College",
        "HostosCommunityCollege": "Hostos Community College",
        "HunterCollege": "Hunter College",
        "John+Jay+College": "John Jay College of Criminal Justice",
        "KingsboroughCC": "Kingsborough Community College",
        "LaGuardiaCommunityCollege": "LaGuardia Community College",
        "LehmanCollege": "Lehman College",
        "MedgarEversCollege": "Medgar Evers College",
        "NYCCollegeofTechnology": "New York City College of Technology",
        "QueensCollege": "CUNY Queens College",
        "QueensboroughCC": "Queensborough Community College",
        "SchoolofProfessionalStudies": "CUNY School of Professional Studies",
        "TheGraduateCenter": "Graduate Center--CUNY",
        "YorkCollege": "CUNY York College"
    }
    if (names.hasOwnProperty(_name)) {
        return names[_name];
    }
}