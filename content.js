var SCALE = 1.2;

var $ = window.$.noConflict(true); 

function log(msg) {
    console.log(msg);
}

var angle = 0;
var img;
var img_selector;
if (location.href.indexOf("jasenille") > 0)
    img_selector = "#bookimage";
else
    img_selector = "img";
img = $(img_selector);
    
function savePosition() {
    var position = {};
    position.left = $(img_selector).css("left");
    position.top = $(img_selector).css("top");
    position.width = $(img_selector).css("width");
    position.height = $(img_selector).css("height");
    position.angle = angle;

    sessionStorage.setItem("position",JSON.stringify(position));
}

function restorePosition() {
    var position_string = sessionStorage.getItem("position");
    if (!position_string) return;
    var position = JSON.parse(position_string);
    $(img_selector).css("top",position.top);
    $(img_selector).css("left",position.left);
    $(img_selector).css("width",position.width);
    $(img_selector).css("height","auto");
    angle = parseInt(position.angle);
    rotate(position.angle);
}

function lahdeviite(viite) {
    $( "#citationwindow" ).dialog();
    $( "#citationtext" ).text(viite).select().focus();
}

function rotate(degrees) {
    $(img_selector).get(0).style.transform = "rotate(" + degrees +"deg)";
}
    

function zoom_in(mouseEvent) { 
    if (mouseEvent) {
        var x = mouseEvent.clientX;
        var y = mouseEvent.clientY - 45;
    } else {
        var x = 0;
        var y = 0;
    }
    
    var left = parseInt($(img_selector).css("left"));
    var top = parseInt($(img_selector).css("top"));
    var width = parseInt($(img_selector).css("width"));
    var height = parseInt($(img_selector).css("height"));
    $(img_selector).css("left",x - SCALE*(x - left));
    $(img_selector).css("top", y - SCALE*(y - top));
    $(img_selector).css("width",width*SCALE);
    $(img_selector).css("height",height*SCALE);
}

function zoom_out(mouseEvent) { 
    if (mouseEvent) {
        var x = mouseEvent.clientX;
        var y = mouseEvent.clientY - 45;
    } else {
        var x = 0;
        var y = 0;
    }
    var width = parseInt($(img_selector).css("width"));
    var height = parseInt($(img_selector).css("height"));
    var top = parseInt($(img_selector).css("top"));
    var left = parseInt($(img_selector).css("left"));

    if (width < 200 || height < 200) return; // don't zoom too small

    $(img_selector).css("left",x - (x - left)/SCALE);
    $(img_selector).css("top",y - (y - top)/SCALE);
    $(img_selector).css("width",width/SCALE);
    $(img_selector).css("height",height/SCALE);
}

function restore() { 
    $(img_selector).css("top","");
    $(img_selector).css("left","");  
    // remove the attributes
    $(img_selector).css("width","");  
    $(img_selector).css("height","");
    angle = 0;
    rotate(0);
    sessionStorage.removeItem("position");
}

function imagepage() {
    return location.href.indexOf("&pnum=") > 0 || $("a.painike").length > 0;
}

function buildTitle() {
    if (location.href.indexOf("&pnum=") > 0) {
        var td = $("td.otsikko").get(3);
        var td4 = $("td.otsikko").get(4);
        var lahde = $(td4).text();
        var viite = "";
        var title = "";

        $.each($(td).contents(), function(i,x) {
            if (i == 1) viite += $(x).text();         // seurakunta
            if (i == 3) viite += " - " + $(x).text(); // kirja 
            if (i == 4) viite += $(x).text();         // kuvanumero
            if (i == 5) {
                viite += $(x).text();         // kuvaus
                title = viite;
            }
        });
        return title;
    }
    if (location.href.indexOf("?bid=") > 0) {
        var title = $("td.otsikko").first().text();
        var m = title.match(/.*\d{4}-\d{4}/);
        if (m) title = m[0];
        return title;
    }
    var title = $("title").text();
    if (title.substr(0,7) == "SSHY - ") title = title.substr(7);
    return title;
}

function setTitle() {
    var title = buildTitle();
    if (title) {
        $("title").text(title);
    }
}

function buildCitation() {

    if (location.href.indexOf("&pnum=") > 0) {
        var td = $("td.otsikko").get(3);
        var td4 = $("td.otsikko").get(4);
        var lahde = $(td4).text();
        var viite = "";
        $.each($(td).contents(), function(i,x) {
            if (i == 1) viite += $(x).text();         // seurakunta
            if (i == 3) viite += " - " + $(x).text() + " (" + lahde + ")"; // kirja + lahde
            if (i == 4) viite += $(x).text() + "sivu ???";         // kuvanumero
            if (i == 5 && $(x).text().trim()) {
                viite += ": " + $(x).text().trim();         // kuvaus
            }
        });
    }
    else {
        viite = $("title").text().replace(/\s+/," ") + ", sivu ???";
    }
    var date = new Date();
    var aika = date.getDate() + "." + (date.getMonth()+1) + "." + (1900+date.getYear());
    var url = location.href.replace("#","");
    url = url.replace("digiarkisto.org","sukuhistoria.fi");
    viite += "; SSHY: " + url + " / Viitattu " + aika;
    viite = viite.replace(/\n/,"");
    return viite;
}

function run(addon_options) {
    setTitle();

    $("a[target=kuva]").each(function(i,e) {
        $(e).attr("target","_blank");
    });

    if (imagepage()) {

        restorePosition();

        var viite = buildCitation();
        
        var a = $("a.karajat");
        $("a#citation").hide();
        var link = $("<a href=# id=citation>(lähdeviite)</a>");
        a.after(link).after(" ");
        link.click(function() {lahdeviite(viite)});
        
        $("body").append("<div id='citationwindow' class='citationwindow' title='Lähdeviite'><textarea id='citationtext' rows='10' cols='28'></textarea></div>");
        $( "div.citationwindow" ).hide();
            
        $("head").append("<link type='text/css' rel='stylesheet' href='//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'>");
        
        $(img_selector).next().css("position","fixed").css("bottom","0px");
        $(img_selector).wrap("<div style='position:fixed;overflow:hidden;left:0px;top:45px;height:2000px;width:2000px'></div>");
        $(img_selector).attr('height', window.innerHeight-90 );
        //$(img_selector).removeAttr('width');
        //$(img_selector).attr('width','auto');
        $(img_selector).attr('width','');
        $(img_selector).draggable({scroll: false});


        var options = $("<ul class=menu-options></ul>");

        var opt = $('<li class="menu-option">Suurenna</li>');
        options.append(opt);
        opt.click(zoom_in);

        var opt = $('<li class="menu-option">Pienennä</li>');
        options.append(opt);
        opt.click(zoom_out);

        var opt = $('<li class="menu-option">Käännä vastapäivään</li>');
        options.append(opt);
        opt.click(function() {angle -= 90;rotate(angle)});

        var opt = $('<li class="menu-option">Käännä myötäpäivään</li>');
        options.append(opt);
        opt.click(function() {angle += 90;rotate(angle)});

        var opt = $('<li class="menu-option">Palauta alkuperäinen kuva</li>');
        options.append(opt);
        opt.click(restore);

        var opt = $('<li class="menu-option">Lähdeviite</li>');
        options.append(opt);
        opt.click(function() {lahdeviite(viite)});

        var fname = "SSHY - " + $("title").text().replace(">","-").replace(":","-");
        var opt = $('<a class="menu-option" href=' + $("img").attr("src") + ' download="' + fname + '.jpg">Lataa kuva</a>');
        options.append(opt);

        var contextmenu = $('<div id="contextmenu" style="position:absolute"></div>');
        contextmenu.append(options);
        $(img_selector).parent().append(contextmenu);
        var menu = document.getElementById("contextmenu");
        menu = contextmenu.get(0);
      
        function contextmenuListener(e) {
            e.preventDefault();
            menu.style.left = e.pageX + "px";
            menu.style.top = (e.pageY-90) + "px";
            menu.style.display = "block";
            return false;
        }

        $(img_selector).get(0).addEventListener("contextmenu", contextmenuListener );

        window.addEventListener("click", e => {
            if (e.which == 1) {
                menu.style.display = "none";
                // $( "#citationwindow" ).hide();
            }
        });

        window.addEventListener("wheel",function(e){
            if (e.deltaY < 0) 
                zoom_in(e);
            else
                zoom_out(e);
        });

        // $(img_selector).get(0)
        window.addEventListener("keydown", function(e) {
            // Ctrl+, Ctrl-
            if (e.ctrlKey && e.keyCode == 107) {
                e.preventDefault();
                zoom_in();
            }
            if (e.ctrlKey && e.keyCode == 109) {
                e.preventDefault();
                zoom_out();
            }
        } );
        
        
        $("a[accesskey]").click(function() {
            savePosition();
        });

        $("a.painike").click(function() {
            savePosition();
        });
        
        $("input[type=button]").click(function() {
            $(img_selector).draggable({scroll: false});
        });
    } // imagepage
}

$( function () {
    chrome.storage.local.get(null, function(addon_options) {
        run(addon_options);
    });
});

