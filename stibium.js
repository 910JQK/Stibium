const TIEBA_KW_URL = "http://tieba.baidu.com/mo/m?kw=";
const TIEBA_KZ_URL = "http://tieba.baidu.com/mo/m?kz=";
const TIEBA_FL_URL = "http://tieba.baidu.com/mo/m/flr";
const TIEBA_SUBMIT_URL = "http://tieba.baidu.com/mo/submit";
var container, initial, doc_global, data_global;


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


function title(val){
    bridge.changeTitle(val);
}


function substr(str, start_code, end_code, reversed){
    var I, i, start, end;
    for(I=0; I<str.length; I++){
	if(reversed)
	    i = str.length-I-1;
	else
	    i = I;
	if(str.charCodeAt(i) == end_code && undef(end))
	    end = i;
	if(str.charCodeAt(i) == start_code && undef(end))
	    start = i;
    }
    if(reversed){
	var tmp = start;
	start = end;
	end = tmp;
    }
    return str.slice(start+1, end);
}


function init(){
    container = $("#list");
    pager = $("#pager");

    initial = bridge.getInitialData();
    if(!undef(initial.action) && !undef(initial.argument)){
	switch(initial.action){
	    case "kw":
	    bar(initial.argument, 1);
	    break;
	    case "kz":
	    topic(initial.argument, 1);
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


function bar(bar, pn){
    var URL = TIEBA_KW_URL+bar+((pn!=1)?"&pnum="+pn:"");
    GET(URL, function(x){
	doc_global = x.responseXML;
	data_global = Handle.bar(x.responseXML, bar);
	Render.bar(data_global);
    });
    title("Loading");
}


function topic(kz, pn){
    var URL = TIEBA_KZ_URL+kz+((pn!=1)?"&pnum="+pn:"");
    GET(URL, function(x){
	doc_global = x.responseXML;
	data_global = Handle.topic(x.responseXML, kz);
	Render.topic(data_global);
    });
    title("Loading");
}


var Handle = {
    "tools":{
	"genPageData":function(page_element){
	    var result = {};
	    if(page_element){
		var page_str = page_element.textContent;
		page_str = substr(page_str, 39029, 31532, true);
		var page_arr = page_str.split("/");
		result.current = Number(page_arr[0]);
		result.total = Number(page_arr[1]);
	    }else{
		result.current = 1;
		result.total = 1;
	    }
	    return result;
	}
    },
    "bar":function(doc, kw){
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

	data.page = {};
	var page_element = doc.querySelector("div.p");
	data.page = this.tools.genPageData(page_element);
	
	var title_element = doc.querySelector("title");
	if(title_element){
	    var tl_txt = title_element.textContent;
	    data.title = tl_txt.replace(/-[^-]*$/, "").replace(/^[^-]*-/, "");
	}else{
	    title = "";
	}
	data.kw = kw;

	return data;
    },
    "topic":function(doc, kz){
	var data = [];
	var items = doc.querySelectorAll("div.i");
	var i;
	for(i=0; i<items.length; i++){
	    var crt = {};
	    var item = items[i];

	    var reply = item.querySelector("a.reply_to");
	    if(reply){
		var pid_str = reply.href.replace(/.*pid=/, "").replace(/[^\d].*/, "");
		crt.pid = Number(pid_str);
		if(reply.textContent.indexOf(")") != -1){
		    crt.reply = Number(substr(reply.textContent, 40, 41));
		}else{
		    crt.reply = 0;
		}
	    }

	    var table = item.querySelector("table");

	    crt.floor = Number(item.textContent.replace(/[^\d].*$/, ""));
	    crt.author = table.querySelector("span.g").children[0].textContent;
	    crt.date = table.querySelector("span.b").textContent;
	    item.removeChild(table);

	    var br = item.querySelectorAll("br");
	    item.removeChild(br[br.length-1]);
	    
	    item.innerHTML = item.innerHTML.replace(/^[\d]*.\.\s/, "");
	    item.className = "post_body";
	    crt.content = item;
	    /* Note: expand content */
	    /* Note: XSS Safety Settings Needed */

	    data.push(crt);
	}

	data.page = {};
	var page_element = doc.querySelector("div.d > form > div.h");
	data.page = this.tools.genPageData(page_element);

	data.title = doc.querySelector("title").textContent;
	data.kz = kz;

	return data;
    }
}


var Render = {
    "tools":{
	"genPager":function(data_page, type){
	    var pager_div = getNode("template_pager").children[0];
	    var prev_btn = pager_div.querySelector(".pager_prev");
	    var next_btn = pager_div.querySelector(".pager_next");
	    var tip = pager_div.querySelector(".pager_tip");
	    if(data_page.current == 1)
		prev_btn.disabled = true;
	    if(data_page.current == data_page.total)
		next_btn.disabled = true;
	    if(type == "bar"){
		prev_btn.onclick = function(){
		    bar(data_global.kw, data_global.page.current-1);
		}
		next_btn.onclick = function(){
		    bar(data_global.kw, data_global.page.current+1);
		}
	    }else if(type == "topic"){
		prev_btn.onclick = function(){
		    topic(data_global.kz, data_global.page.current-1);
		}
		next_btn.onclick = function(){
		    topic(data_global.kz, data_global.page.current+1);
		}
	    }
	    tip.textContent = data_page.current + "/" + data_page.total;
	    pager.innerHTML = "";
	    pager.appendChild(pager_div);
	}
    },
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
	this.tools.genPager(data.page, "bar");
	title(data.title);
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
	this.tools.genPager(data.page, "topic");
	title(data.title);
    }
}
