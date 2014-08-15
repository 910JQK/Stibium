const TIEBA_KW_URL = "http://tieba.baidu.com/mo/m?kw=";
const TIEBA_KZ_URL = "http://tieba.baidu.com/mo/m?kz=";
const TIEBA_FL_URL = "http://tieba.baidu.com/mo/m/flr";
const TIEBA_SUBMIT_URL = "http://tieba.baidu.com/mo/submit";
var Test = new Object;


function init(){
    var testList = ["linux", "ubuntulinux", "debian"];
    for(var i=0; i<testList.length; i++)
	test(testList[i]);
}


function test(bar){
    var x = new XMLHttpRequest();
    x.open("GET", TIEBA_KW_URL+bar, true);
    x.onreadystatechange = function(){
	if(x.readyState == 4 && x.status == 200){
	    Test[bar] = handle(x.responseXML);
	}
    };
    x.send();
}


function handle(doc){
    var data = [];
    var i, j;
    var items = doc.querySelectorAll("div.i");
    for(i=0; i<items.length; i++){
	var crt = new Object();
	var item = items[i];
	var a = item.querySelector("a");
	var p = item.querySelector("p");
	var span = item.querySelectorAll("span");
	crt.title = a.textContent.replace(/^[\d]+\../, "");
	crt.kz = a.href.replace(/.*kz=/, "").replace(/&.*/, "");
	crt.reply = (function(){
	    var i;
	    var txt = p.textContent;
	    for(i=0; i<txt.length; i++)
		if(txt.charCodeAt(i) == 22238){
		    txt = txt.slice(i+1, txt.length);
		    break;
		}
	    return Number(txt.replace(/[^\d].*/, ""));
	})();
	crt.reply = Number(crt.reply);
	crt.good = false;
	crt.top = false;
	if(typeof span != "undefined")
	    for(j=0; j<span.length; j++){
		if(span[j].textContent.charCodeAt(0) == 31934)
		    crt.good = true;
		if(span[j].textContent.charCodeAt(0) == 39030)
		    crt.top = true;
	    }
	data.push(crt);
    }
    return data;
}
