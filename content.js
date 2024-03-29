var SCALE = 1.2;

var $ = window.$.noConflict(true); 

function log(msg) {
    console.log(msg);
}

var angle = 0;
var img;
var img_selector;
var	is_member = false;
var	is_public = false;

if (location.href.indexOf("jasenille") > 0) {
	is_member = true;
    img_selector = "#bookimage";
} else {
	is_public = true;
    img_selector = "img";
}
    
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
    if (!position_string) {
	    $(img_selector).css("top",0);
	    $(img_selector).css("left",0);
	    $(img_selector).css("width",window.innerWidth-30);
	    $(img_selector).css("height","auto");
	    return;
    }
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
    var i = url.indexOf("&fbclid=");  // poista facebook-seuranta
    if (i > 0) url = url.substr(0,i);
    viite += "; SSHY: " + url + " / Viitattu " + aika;
    viite = viite.replace(/\n/,"");
    return viite;
}

function run(addon_options) {
    console.log('Settings:'+JSON.stringify(addon_options));
    if (addon_options.set_title) setTitle();

	if (addon_options.new_tab) {
	    $("a[target=kuva]").each(function(i,e) {
	        $(e).attr("target","_blank");
	    });
	}
	
    if (imagepage()) {

		if (addon_options.retain_position) 
			restorePosition();
		else {
		    $(img_selector).css("top",0);
		    $(img_selector).css("left",0);
		    $(img_selector).css("width",window.innerWidth-30);
		    $(img_selector).css("height","auto");
		}
		
		if (addon_options.generate_citation) {
	        var viite = buildCitation();
	        
	        var a = $("a.karajat");
	        $("a#citation").hide();
	        var link = $("<a href=# id=citation>(lähdeviite)</a>");
	        //a.after(link).after(" ");
	        link.click(function() {lahdeviite(viite)});
		}
		        
        $("body").append("<div id='citationwindow' class='citationwindow' title='Lähdeviite'><textarea id='citationtext' rows='10' cols='28'></textarea></div>");
        $( "div.citationwindow" ).hide();
            
        //$("head").append("<link type='text/css' rel='stylesheet' href='//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css'>");
        

        if (addon_options.mousemove) {
	        $(img_selector).next().css("position","fixed").css("bottom","0px");
	        $(img_selector).wrap("<div style='position:fixed;overflow:hidden;left:0px;top:45px;height:3000px;width:3000px;'></div>");
	        $(img_selector).attr('height', window.innerHeight-90 );
	        $(img_selector).attr('width','');
		    $("table.paperi").css("width","100%");

	        $(img_selector).removeAttr("onclick");
	        $(img_selector).prop("onclick",null).unbind("click");
	        $(img_selector).draggable({scroll: false});

	        $("input[type=button]").click(function() {
	            $(img_selector).draggable({scroll: false});
	        });

		}
		
        var menu_options = $("<ul class=menu-options></ul>");

		if (addon_options.menuzoom) {
	        var opt = $('<li class="menu-option">Suurenna</li>');
	        menu_options.append(opt);
	        opt.click(zoom_in);
	
	        var opt = $('<li class="menu-option">Pienennä</li>');
	        menu_options.append(opt);
	        opt.click(zoom_out);
		}
		
		if (addon_options.rotation) {
	        var opt = $('<li class="menu-option">Käännä vastapäivään</li>');
	        menu_options.append(opt);
	        opt.click(function() {angle -= 90;rotate(angle)});
	
	        var opt = $('<li class="menu-option">Käännä myötäpäivään</li>');
	        menu_options.append(opt);
	        opt.click(function() {angle += 90;rotate(angle)});
		}
		
        var opt = $('<li class="menu-option">Palauta alkuperäinen kuva</li>');
        menu_options.append(opt);
        opt.click(restore);

		if (addon_options.generate_citation) {
	        var opt = $('<li class="menu-option">Lähdeviite</li>');
	        menu_options.append(opt);
	        opt.click(function() {lahdeviite(viite)});
		}
		
		if (addon_options.download_image) {
	        var title = $("title").text();
		    if (title.substr(0,7) == "SSHY - ") title = title.substr(7);
	        var fname = "SSHY - " + $("title").text().replace(">","-").replace(":","-");
	        var opt = $('<a class="menu-option" href=' + $("img").attr("src") + ' download="' + fname + '.jpg">Lataa kuva</a>');
	        menu_options.append(opt);
		}
		
		if (addon_options.contextmenu) {
	        var contextmenu = $('<div id="contextmenu" style="position:absolute"></div>');
	        contextmenu.append(menu_options);
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
	            }
	        });
		}

		if (addon_options.mousezoom) {
	        $(img_selector).next().css("position","fixed").css("bottom","0px");
	        $(img_selector).wrap("<div style='position:fixed;overflow:hidden;left:0px;top:45px;height:3000px;width:3000px'></div>");
	        $(img_selector).attr('height', window.innerHeight-90 );
	        $(img_selector).attr('width','');
		    //$("table[height=25]").css("height", "25px !important");
		    $("table.paperi").css("width","100%");
	        window.addEventListener("wheel",function(e){
	            if (e.deltaY < 0) 
	                zoom_in(e);
	            else
	                zoom_out(e);
	        });
		}
		
		if (addon_options.keyboardzoom) {
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
		}        
        
		if (addon_options.retain_position) {
	        $("a[accesskey]").click(function() {
	            savePosition();
	        });
	
	        $("a.painike").click(function() {
	            savePosition();
	        });
		}
		        
    } // imagepage
}

$( function () {
	var key;
	if (is_public) key = "public";
	if (is_member) key = "member";
//	chrome.storage.local.clear();
    chrome.storage.local.get([key], function(addon_options) {
        var options = addon_options[key];
        if (options == undefined) {
            options = {};
            options.contextmenu = true;
            options.generate_citation = true;
            options.set_title = true;
            options.new_tab = true;
            options.mousemove = true;
            options.mousezoom = true;
            options.menuzoom = true;
            options.keyboardzoom = true;
            options.rotation = true;
            options.retain_position = true;
            options.download_image = true;
        }
        run(options);
    });
});


