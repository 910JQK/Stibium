/* Stibium Javascript Core */
const TIEBA_LOGIN_URL = "http://wappass.baidu.com/passport/login";
const TIEBA_LOGOUT_URL = "http://wappass.baidu.com/passport/?logout";
const TIEBA_KW_URL = "http://tieba.baidu.com/mo/m?kw=";
const TIEBA_KZ_URL = "http://tieba.baidu.com/mo/m?kz=";
const TIEBA_FL_URL = "http://tieba.baidu.com/mo/m/flr?kz=";
const TIEBA_SUBMIT_URL = "http://tieba.baidu.com/mo/m/submit";
const TIEBA_REPLYME_URL = "http://tieba.baidu.com/mo/m/replyme";
const TIEBA_ATME_URL = "http://tieba.baidu.com/mo/m/atme";
//const TIEBA_FAV_URL = "http://tieba.baidu.com/mo/m?tn=bdFBW&tab=favorite";
const TIEBA_INDEX_URL = "http://wapp.baidu.com/";
const TIEBA_EXPANED = "&global=1&expand=";
const TIEBA_PNUM = "&pnum=";
const TIEBA_PID = "&pid=";
var initial, doc_global, data_global, kw_global, kz_global, pn_global;
var doc_reply_global, doc_at_global;
var container, login_div, login_link, msg_link, submit_div, pager;
var logged = false;


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


function find(obj_arr, key, val){
    var i;
    for(i=0; i<obj_arr.length; i++){
	if(obj_arr[i][key] == val){
	    return obj_arr[i];
	}
    }
    return {};
}


function size(str){
    /* Baidu uses GBK so hantzi is two-bytes character */
    var w_chars = str.match(/[^\x00-\xff]/g);
    return (str.length + ((!w_chars)? 0: w_chars.length));
}


function parseObject(obj){
    var result = "";
    var i = 0;
    var I;
    for(I in obj){
	if(obj.hasOwnProperty(I)){
	    if(i != 0) 
		result = result + "&" + I + "=" + obj[I];
	    else
		result = result + I + "=" + obj[I];
	    i++;
	}
    }
    return result;
}


function copyObject(obj){
    var result = {};
    var I;
    for(I in obj){
	if(obj.hasOwnProperty(I)){
	    result[I] = obj[I];
	}
    }
    return result;
}


function fetchHashFromInput(collection){
    var result = {};
    var i;
    for(i=0; i<collection.length; i++){
	result[collection[i].name] = encodeURIComponent(collection[i].value);
    }
    return result;
}


function clear_xss_threat(node){
    function remove(selector){
	var rm = node.querySelectorAll(selector);
	if(rm){
	    var i;
	    for(i=0; i<rm.length; i++){
		rm[i].parentElement.removeChild(rm[i]);
	    }
	}
    }
    remove("script");
/*
    GET request:
    remove("style");
    remove("link");
    remove("audio");
    remove("video");
    remove("embed");
    remove("object");
    remove("iframe");
    remove(" img with some rule ")
*/
}


function Empty(){
    login_div.innerHTML = "";
    container.innerHTML = "";
    pager.innerHTML = "";
    submit_div.display = "";
}


function setNick(nick){
    if(!nick){
	logged = false;
	login_link.textContent = "Login";
	login_link.title = "";
	msg_link.style.display = "none";
    }else{
	logged = true;
	login_link.textContent = nick;
	login_link.title = "Click to logout";
	msg_link.style.display = "";
    }
}


function login_link_clicked(){
    if(!logged)
	Render.login();
    else
	logout();
}


function readyStateText(status){
    var result = "";
    switch(status){
	case 0:
	result = "Uninitialized";
	break;
	case 1:
	result = "Initialized";
	break;
	case 2:
	result = "Connecting...";
	break;
	case 3:
	result = "Receiving...";
	break;
	case 4:
	result = "DONE";
	break;
    }
    return result;
}


function Debug(count, content){
    var header = "[" + count + "] ";
    var body = content.join(" ");
    bridge.debug(header + body);
    console.log(header + body);
}


function debug_status(count, xmlhttp){
    var txt = readyStateText(xmlhttp.readyState);
    if(xmlhttp.statusText)
	Debug(count, [txt, xmlhttp.statusText]);
    else
	Debug(count, [txt]);
}


function GET(url, reaction){
    var counter = bridge.counter + 1;
    bridge.counter++;
    Debug(counter, ["GET", url]);

    var x = new XMLHttpRequest();
    x.open("GET", url, true);
    x.onreadystatechange = function(){
	debug_status(counter, x);
	if(x.readyState == 4 && x.status == 200)
	    reaction(x);
    };
    x.send();
}


function POST(url, data, reaction){
    var data_str = parseObject(data);

    var counter = bridge.counter + 1;
    bridge.counter++;
    Debug(counter, ["POST", url]);
    Debug(counter, ["DATA", data_str.replace(/&password=[^&]+/, "&['MASKED']")]);

    var x = new XMLHttpRequest();
    x.open("POST", url, true);
    x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    x.onreadystatechange = function(){
	debug_status(counter, x);
	if(x.readyState == 4 && x.status == 200)
	    reaction(x);
    };
    x.send(data_str);
}


function index(){
    GET(TIEBA_INDEX_URL, function(x){
	Render.index(Handle.index(x.responseXML));
    });
    title("Loading");
}


function login(username, password, verifycode){
    if(verifycode)
	var data = {"username":username,"password":password,"verifycode":verifycode};
    else
	var data = {"username":username,"password":password};
    POST(TIEBA_LOGIN_URL, data, function(x){
	var parser = new DOMParser();
	var doc = parser.parseFromString(x.responseText.trim(), "text/xml");
	if(doc.querySelector("title").textContent.charCodeAt(0) == 30334){
	    Render.login("succeeded")
	}else if(doc.querySelector('[name="verifycode"]')){
	    Render.login("verifycode", doc.querySelector('img[alt="wait..."]'));
	}else{
	    Render.login("failed", doc.querySelector("#error_area").children[0].textContent);
	}
    });
}


function do_login(){
    function $$(selector){
	return login_div.querySelector(selector);
    }
    var data = [];
    data.push($$(".username").value);
    data.push($$(".password").value);
    if($$(".verifycode").type == "text")
	data.push($$(".verifycode").value);
    login.apply(window, data);
}


function logout(){
    GET(TIEBA_LOGOUT_URL, function(x){
	index();
    });
}


function do_submit(){
    function $$(selector){
	return submit_div.querySelector(selector);
    }
    var ti = $$(".submit_title").value;
    var co = $$(".submit_content").value;
    var data = copyObject(data_global.submit.data);
    if(undef(data.ti))
	data.ti = encodeURIComponent(ti);
    data.co = encodeURIComponent(co);
    POST(TIEBA_SUBMIT_URL, data, function(x){
	init();
    });
}


function bar(bar, pn){
    var URL = TIEBA_KW_URL+bar+((pn!=1)?TIEBA_PNUM+pn:"");
    kw_global = bar;
    pn_global = pn;
    GET(URL, function(x){
	doc_global = x.responseXML;
	data_global = Handle.bar(x.responseXML, bar);
	Render.bar(data_global);
	scroll(0, 0);
    });
    title("Loading");
}


function topic(kz, pn){
    var URL = TIEBA_KZ_URL+kz+((pn!=1)?TIEBA_PNUM+pn:"");
    kz_global = kz;
    pn_global = pn;
    GET(URL, function(x){
	doc_global = x.responseXML;
	data_global = Handle.topic(x.responseXML, kz);
	Render.topic(data_global);
	scroll(0, 0);
    });
    title("Loading");
}


function subPost(floor, pn){
    var pid = find(data_global, "floor", floor).pid;
    var URL = TIEBA_FL_URL + kz_global + TIEBA_PID + pid + TIEBA_PNUM + pn;
    GET(URL, function(x){
	Render.subPost(Handle.subPost(x.responseXML, floor));
    })
}


function msg(){
    GET(TIEBA_REPLYME_URL, function(x1){
	doc_reply_global = x1.responseXML;
	GET(TIEBA_ATME_URL, function(x2){
	    doc_at_global = x2.responseXML;
	    Render.msg(Handle.msg(doc_reply_global, doc_at_global));
	});
    });
    title("Loading");
}


function query(){
    bridge.openTab("kw", $("#query").value);
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
	},
	"genPostData":function(item){
	    var crt = {};

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

	    var first_floor_reply = item.querySelector('[href="#reply"]');
	    if(first_floor_reply)
		item.removeChild(first_floor_reply);

	    var table = item.querySelector("table");

	    crt.floor = Number(item.textContent.replace(/[^\d].*$/, ""));
	    crt.author = table.querySelector("span.g").children[0].textContent;
	    crt.date = table.querySelector("span.b").textContent;
	    item.removeChild(table);

	    var br = item.querySelectorAll("br");
	    item.removeChild(br[br.length-1]);

	    var a = item.querySelectorAll("a")
	    var j;
	    for(j=0; j<a.length; j++){
		if(a[j].href.match(/expand=[\d]+$/) && (function(a){
		    return (a.textContent.charCodeAt(2) == 27573 ||
			    a.textContent.charCodeAt(0) == 20313)
		})(a[j])){
		    if(!crt.expand_button){
			var expand_button = document.createElement("button");
			expand_button.textContent = "Expand";
			expand_button.dataset.floor = crt.floor;
			expand_button.className = "expand_button";
			crt.expand_button = expand_button;
			item.appendChild(expand_button);
		    }
		    item.removeChild(a[j]);
		}else if(a[j].href.match(/^http:\/\/gate\.baidu\.com/)){
		    var txt = a[j].href.replace(/^.*&src=/, "");
		    txt = decodeURIComponent(txt);
		    a[j].href = txt;
		}
	    }

	    var img = item.querySelectorAll(".BDE_Image");
	    for(j=0; j<img.length; j++){
		var src = img[j].src;
		src = src.replace(/quality=\d+/, "quality=100");
		src = src.replace(/size=b\d+_\d+/, "size=b2000_2000");
		img[j].src = src;
	    }

	    item.innerHTML = item.innerHTML.replace(/^[\d]*.\.\s/, "");
	    item.className = "post_body";
	    clear_xss_threat(item);
	    crt.content = item;
	    /* Note: XSS Safety Settings Needed */

	    return crt;
	},
	"genSubmitData":function(form){
	    var result = {};
	    if(!form.querySelector("a")){
		result.valid = true;
		result.data = {};
		var inputs = form.querySelectorAll('input[type="hidden"]');
		result.data = fetchHashFromInput(inputs);
	    }else{
		result.valid = false;
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
	    data.title = "";
	}

	var form = doc.querySelector("div.h > form");
	data.submit = this.tools.genSubmitData(form);

	var nick = doc.querySelectorAll("body > div > div.bc.p");
	if(nick.length == 3)
	    data.nick = nick[2].textContent.replace(/\s.*/, "");

	data.kw = kw;
	return data;
    },
    "topic":function(doc, kz){
	var data = [];
	var items = doc.querySelectorAll("div.i");
	var i;
	for(i=0; i<items.length; i++){
	    data.push(this.tools.genPostData(items[i]));
	}

	var form = doc.querySelector("div.h > form");
	data.submit = this.tools.genSubmitData(form);

	data.page = {};
	var page_element = doc.querySelector("div.d > form > div.h");
	data.page = this.tools.genPageData(page_element);

	data.title = doc.querySelector("title").textContent;

	var nick = doc.querySelectorAll("body > div > div.d.h");
	if(nick.length == 2)
	    data.nick = nick[1].textContent.replace(/\s.*/, "");

	data.kz = kz;
	return data;
    },
    "subPost":function(doc, floor){
	var data = [];
	var items = doc.querySelectorAll("div.i");
	var i;
	for(i=0; i<items.length; i++){
	    var crt = {};
	    var item = items[i];
	    function remove(){
		return item.removeChild(item.children[item.children.length-1]);
	    }
	    var tmp = remove().textContent;
	    if(tmp.charCodeAt(0) == 21024 && tmp.length == 1)
		remove();
	    crt.date = remove().textContent;
	    crt.author = remove().textContent;
	    var a = item.querySelectorAll("a");
	    var j;
	    for(j=0; j<a.length; j++){
		if(a[j].href.match(/^http:\/\/gate\.baidu\.com/)){
		    var txt = a[j].href.replace(/^.*&src=/, "");
		    txt = decodeURIComponent(txt);
		    a[j].href = txt;
		}
	    }
	    crt.content = item;
	    data.push(crt);
	}

	var form = doc.querySelector("div.h > form");
	data.submit = this.tools.genSubmitData(form);
	
	data.page = {};
	var page_element = doc.querySelector("form > div.h");
	data.page = this.tools.genPageData(page_element);
	
	data.floor = floor;
	
	return data;
    },
    "msg":function(doc_reply, doc_at){
	var data = {};
	var items_reply = doc_reply.querySelectorAll("div.ct > div");
	var items_at = doc_at.querySelectorAll("div.ct > div");
	function handle(div){
	    var a = div.querySelectorAll("a");
	    var i;
	    for(i=0; i<a.length; i++){
		if(a[i].href.match(/^http:\/\/[^\/]*\/mo\/[^\/]*\/m\?kz=\d+.*/)){
		    var txt = a[i].href;
		    txt = txt.replace(/^.*m\?kz=/, "tieba://kz#");
		    txt = txt.replace(/&.*/, "");
		    a[i].href = txt;
		}
	    }
	}
	var i;
	for(i=0; i<items_reply.length; i++) handle(items_reply[i]);
	for(i=0; i<items_at.length; i++) handle(items_at[i]);
	data.reply = items_reply;
	data.at = items_at;
	console.log(data);
	return data;
    },
    "index":function(doc){
	var data = {};
	var like = doc.querySelector(".my_love_bar");
	if(like){
	    data.valid = true;
	    var nick = doc.querySelectorAll("div.b > a")[1].textContent;
	    data.nick = nick.slice(0, nick.length-4);
	    var a = like.querySelectorAll("a");
//	    like.removeChild(a[a.length-1]);
	    data.like = [];
	    var i;
	    for(i=0; i<a.length; i++){
		if(!a[i].href.match(/tab=favorite$/))
		    data.like.push(a[i].textContent);
	    }
	}else{
	    data.valid = false;
	}
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
		    bar(kw_global, data_global.page.current-1);
		}
		next_btn.onclick = function(){
		    bar(kw_global, data_global.page.current+1);
		}
	    }else if(type == "topic"){
		prev_btn.onclick = function(){
		    topic(kz_global, data_global.page.current-1);
		}
		next_btn.onclick = function(){
		    topic(kz_global, data_global.page.current+1);
		}
	    }else if(type == "subpost"){
		pager_div.dataset.floor = data_page.floor;
		pager_div.dataset.pn = data_page.current;
	    }
	    tip.textContent = data_page.current + "/" + data_page.total;
	    return pager_div;
	},
	"genExpandEvent":function(){
	    var btn = document.querySelectorAll(".expand_button");
	    var i;
	    for(i=0; i<btn.length; i++){
		btn[i].onclick = function(){
		    var expand_url = TIEBA_KZ_URL+kz_global+TIEBA_PNUM+pn_global+TIEBA_EXPANED+this.dataset.floor;
		    GET(expand_url, function(x){
			var Item = x.responseXML.querySelector("div.i");
			var item = Handle.tools.genPostData(Item);
			var post = $("#post_" + item.floor);
			var post_body = post.querySelector(".post_body");
			post_body.innerHTML = item.content.innerHTML;
		    });
		}	
	    }
	},
	"genSubPostButtonEvent":function(){
	    var btn = document.querySelectorAll(".subpost_button");
	    var i;
	    for(i=0; i<btn.length; i++){
		btn[i].onclick = function(){
		    subPost(this.dataset.floor, 1);
		}
	    }
	},
	"genSubPostSubmitEvent":function(submit_div){
	    var btn = submit_div.querySelector("button");
	    var input = submit_div.querySelector("input");
	    btn.onclick = function(){
		var parent = this.parentElement;
		var data = JSON.parse(parent.dataset.data);
		var floor = parent.dataset.floor;
		var pn = parent.parentElement.querySelector(".pager").dataset.pn;
		var co = parent.querySelector("input");
		data.co = encodeURIComponent(co.value);
		data.ti = encodeURIComponent(data.ti);
		POST(TIEBA_SUBMIT_URL, data, function(x){
		    subPost(floor, pn);
		});
	    }
	    input.onkeyup = function(){
		var tip = this.parentElement.querySelector("span");
		if(size(this.value) > 280)
		    tip.textContent = "Over 280 bytes!";
		else if(this.value.length > 140)
		    tip.textContent = "Over 140 characters!";
		else
		    tip.textContent = "";
	    }
	},
	"genSubPostPagerEvent":function(pager_div){
	    pager_div.querySelector(".pager_prev").onclick = function(){
		var parent = this.parentElement;
		subPost(parent.dataset.floor, Number(parent.dataset.pn)-1)
	    }
	    
	    pager_div.querySelector(".pager_next").onclick = function(){
		var parent = this.parentElement;
		subPost(parent.dataset.floor, Number(parent.dataset.pn)+1)
	    }
	}
    },
    "bar":function(data){
	Empty();
	data.reduce(function(prv, crt){
	    var item = getNode("template_bar").children[0];
	    var count = item.querySelector(".item_count");
	    var link = item.querySelector(".item_link");
	    var last = item.querySelector(".item_last");
	    var date = item.querySelector(".item_date");
	    count.textContent = crt.reply.count;
	    link.textContent = crt.title;
	    link.href = "tieba://kz#" + crt.kz;
	    last.textContent = crt.reply.last;
	    date.textContent = crt.reply.date;
	    if(crt.top) item.classList.add("item_top");
	    if(crt.good) item.classList.add("item_good");
	    container.appendChild(item);
	}, '');
	if(data.submit.valid){
	    submit_div.style.display = "block";
	    submit_div.querySelector(".submit_title").style.display = "";
	    setNick(data.nick);
	}else{
	    submit_div.style.display = "none";
	    setNick(false);
	}
	pager.appendChild(this.tools.genPager(data.page, "bar"));
	title(data.title);
	bridge.setInitialData("kw", data.kw);
    },
    "topic":function(data){
	Empty();
	data.reduce(function(prv, crt){
	    var post = getNode("template_topic").children[0];
	    var floor = post.querySelector(".post_floor");
	    var author = post.querySelector(".post_author");
	    var date = post.querySelector(".post_date");
	    var body = post.querySelector(".post_body");
	    var subpost = post.querySelector(".post_subpost");
	    floor.textContent = "#" + crt.floor;
	    author.textContent = crt.author;
	    date.textContent = crt.date;
	    body.innerHTML = crt.content.innerHTML;
	    if(!undef(crt.reply) && crt.floor != 1){
		var subpost_button = document.createElement("button");
		subpost_button.textContent = "Reply("+crt.reply+")";
		subpost_button.dataset.floor = crt.floor;
		subpost_button.className = "subpost_button";
		subpost.appendChild(subpost_button);
	    }
	    post.id = "post_" + crt.floor;
	    container.appendChild(post);
	}, '');
	if(data.submit.valid){
	    submit_div.style.display = "block";
	    submit_div.querySelector(".submit_title").style.display = "none";
	    setNick(data.nick);
	}else{
	    submit_div.style.display = "none";
	    setNick(false);
	}
	pager.appendChild(this.tools.genPager(data.page, "topic"));
	this.tools.genExpandEvent();
	this.tools.genSubPostButtonEvent();
	title(data.title);
	bridge.setInitialData("kz", data.kz);
    },
    "subPost":function(data){
	var container = $("#post_"+data.floor).querySelector(".post_subpost");
	container.innerHTML = "";
	var list = document.createElement("ul");
	list.classList.add("subpost_list");
	data.reduce(function(prv, crt){
	    var subpost = getNode("template_subpost").children[0];
	    var header = subpost.querySelector(".subpost_header");
	    var body = subpost.querySelector(".subpost_body");
	    header.textContent = crt.author;
	    header.title = crt.date;
	    body.innerHTML = crt.content.innerHTML;
	    list.appendChild(subpost);
	}, '');
	container.appendChild(list);
	if(data.submit.valid){
	    var submit = getNode("template_subpost_submit").children[0];
	    submit.dataset.data = JSON.stringify(data.submit.data);
	    submit.dataset.floor = data.floor;
	    container.appendChild(submit);
	}
	data.page.floor = data.floor;
	var pager = this.tools.genPager(data.page, "subpost");
	delete data.page.floor;
	container.appendChild(pager);
	if(data.submit.valid)
	    this.tools.genSubPostSubmitEvent(submit);
	this.tools.genSubPostPagerEvent(pager);
    },
    "login":function(status, info){
	Empty();
	if(status == "failed"){
	    alert(info);
	}else if(status == "succeeded"){
	    index();
	    alert("Login successfully!");
	}else{
	    var container = getNode("template_login").children[0];
	    if(status == "verifycode"){
		var img = info;
		container.querySelector(".verifycode_img").appendChild(img);
		container.querySelector(".verifycode").type="text";
		alert("Please input verify code!")
	    }
	    login_div.appendChild(container);
	    title("Login");
	    setNick(false);
	    bridge.setInitialData("login", "");
	}
    },
    "msg":function(data){
	Empty();
	function create(){
	    return document.createElement("li");
	}
	var header_reply = create();
	header_reply.textContent = "Reply:";
	header_reply.className = "msg_header";
	var header_at = create();
	header_at.textContent = "At:";
	header_at.className = "msg_header";
	container.appendChild(header_reply);
	var i;
	for(i=0; i<data.reply.length; i++){
	    var item = create();
	    item.innerHTML = data.reply[i].innerHTML;
	    item.className = "msg_item";
	    container.appendChild(item);
	}
	container.appendChild(header_at);
	for(i=0; i<data.at.length; i++){
	    var item = create();
	    item.innerHTML = data.at[i].innerHTML;
	    item.className = "msg_item";
	    container.appendChild(item);
	}
	title("Messages");
	bridge.setInitialData("msg", "");
    },
    "index":function(data){
	Empty();
	if(data.valid){
	    data.like.reduce(function(prv, crt){
		var li = document.createElement("li");
		li.className = "fav_item";
		var a =document.createElement("a");
		a.textContent = crt;
		a.href = "tieba://kw#" + encodeURIComponent(crt);
		li.appendChild(a);
		container.appendChild(li);
	    });
	    setNick(data.nick);
	}else{
	    var li = document.createElement("li");
	    li.textContent = "Not logged in";
	    container.appendChild(li);
	    setNick(false);
	}
	bridge.setInitialData("index", "");
	title("Home");
    }
}


function init(){
    container = $("#list");
    pager = $("#pager");
    login_div = $("#login");
    login_link = $("#login_link");
    msg_link = $("#msg_link");
    submit_div = $("#submit");

    $("#query").onkeyup = function(ev){
	if(ev.keyCode == 13){
	    query();
	}
    }

    initial = bridge.getInitialData();
    if(initial.action){
	switch(initial.action){
	    case "index":
	    index();
	    break;
	    case "kw":
	    bar(initial.argument, 1);
	    break;
	    case "kz":
	    topic(initial.argument, 1);
	    break;
	    case "login":
	    Render.login();
	    break;
	    case "msg":
	    msg();
	}
    }
}
