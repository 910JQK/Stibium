const TIEBA_KW_URL = "http://tieba.baidu.com/mo/m?kw=";
const TIEBA_KZ_URL = "http://tieba.baidu.com/mo/m?kz=";
const TIEBA_FL_URL = "http://tieba.baidu.com/mo/m/flr";
const TIEBA_SUBMIT_URL = "http://tieba.baidu.com/mo/submit";
var container, initial, tmpdoc, tmpdata;


function $(selector){
    return document.querySelector(selector);
}


function undef(obj){
    return (typeof obj == "undefined");
}


function getNode(node_id){
    var Instance, NodeHTML;
    try {Instance = document.importNode(document.getElementById(node_id).content);}
    catch(e){}
    if("object" != typeof Instance){
	NodeHTML = document.getElementById(node_id).innerHTML;
	Instance = document.createElement("div");
	Instance.innerHTML = NodeHTML;
    }else if("undefined" == typeof Instance.children){
	NodeHTML = document.getElementById(node_id).innerHTML;
	Instance = document.createElement("div");
	Instance.innerHTML = NodeHTML;
    }else if(0 == Instance.children.length){
	NodeHTML = document.getElementById(node_id).innerHTML;
	Instance = document.createElement("div");
	Instance.innerHTML = NodeHTML;
    }
    return Instance;
}


function init(){
    container = $("#list");

    initial = bridge.getInitialData();
    if(!undef(initial.action) && !undef(initial.argument)){
	switch(initial.action){
	    case "kw":
	    bar(initial.argument);
	    case "kz":
	    topic(initial.argument);
	}
    }
}


function GET(url, reaction){
    var x = new XMLHttpRequest();
    x.open("GET", url, true);
    x.onreadystatechange = function(){
	if(x.readyState == 4 && x.status == 200)
	    reaction(x);
    };
    x.send();
}


function bar(bar){
    GET(TIEBA_KW_URL+bar, function(x){
	tmpdoc = x.responseXML;
	tmpdata = Handle.bar(x.responseXML);
	Render.bar(tmpdata);
    });
}


function topic(kz){
    GET(TIEBA_KZ_URL+kz, function(x){
	tmpdoc = x.responseXML;
	tmpdata = Handle.topic(x.responseXML);
	Render.topic(tmpdata);
    });
}


var Handle = {
    "bar":function(doc){
	var data = [];
	var items = doc.querySelectorAll("div.i");
	var i, j;
	for(i=0; i<items.length; i++){
	    var crt = {};
	    var item = items[i];
	    var a = item.querySelector("a");
	    var p = item.querySelector("p");
	    var span = item.querySelectorAll("span");
	    crt.title = a.textContent.replace(/^[\d]+\../, "");
	    crt.kz = a.href.replace(/.*kz=/, "").replace(/&.*/, "");
	    crt.reply = (function(){
		var list = p.textContent.replace(/^[^\s]*\s./, "").split(/\s/);
		return {
		    "count":Number(list[0]),
		    "last":list[1],
		    "date":list[2]
		}
	    })();
	    crt.good = false;
	    crt.top = false;
	    if(!undef(span))
		for(j=0; j<span.length; j++){
		    if(span[j].textContent.charCodeAt(0) == 31934)
			crt.good = true;
		    if(span[j].textContent.charCodeAt(0) == 39030)
			crt.top = true;
		}
	    data.push(crt);
	}
	return data;
    },
    "topic":function(doc){
	var data = [];
	var items = doc.querySelectorAll("div.i");
	var i;
	for(i=0; i<items.length; i++){
	    var crt = {};
	    var item = items[i];
	    var table = item.querySelector("table");

	    crt.floor = Number(item.textContent.replace(/[^\d].*$/, ""));
	    crt.author = table.querySelector("span.g").children[0].textContent;
	    crt.date = table.querySelector("span.b").textContent;
	    item.removeChild(table);

	    var br = item.querySelectorAll("br");
	    item.removeChild(br[br.length-1]);
	    var reply = item.querySelector("a.reply_to");
	    if(reply)
		item.removeChild(reply);
	    /* Note: PID */
	    
	    item.innerHTML = item.innerHTML.replace(/^[\d]*.\.\s/, "");
	    item.className = "post_body";
	    crt.content = item;

	    data.push(crt);
	}
	return data;
    }
}


var Render = {
    "bar":function(data){
	container.innerHTML = "";
	data.reduce(function(prv, crt){
	    var item = getNode("template_bar").children[0];
	    var count = item.querySelector(".item_count");
	    var link = item.querySelector(".item_link");
	    var last = item.querySelector(".item_last");
	    var date = item.querySelector(".item_date");
	    count.textContent = crt.reply.count;
	    link.textContent = crt.title;
	    link.href = "action://kz#" + crt.kz;
	    last.textContent = crt.reply.last;
	    date.textContent = crt.reply.date;
	    if(crt.top) item.classList.add("item_top");
	    if(crt.good) item.classList.add("item_good");
	    container.appendChild(item);
	}, '');
    },
    "topic":function(data){
	container.innerHTML = "";
	data.reduce(function(prv, crt){
	    var post = getNode("template_topic").children[0];
	    var floor = post.querySelector(".post_floor");
	    var author = post.querySelector(".post_author");
	    var date = post.querySelector(".post_date");
	    floor.textContent = "#" + crt.floor;
	    author.textContent = crt.author;
	    date.textContent = crt.date;
	    post.appendChild(crt.content);
	    container.appendChild(post);
	}, '');
    }
}
