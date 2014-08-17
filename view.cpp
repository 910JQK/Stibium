#include <QWebFrame>
#include <QWidget>
#include <QUrl>
#include <QDebug>
#include "view.h"


View::View(QWidget *parent) : QWebView(parent) {
	init();
	load(QUrl("stibium.html"));
}


View::View(QWidget *parent, QString action, QString argument):QWebView(parent) {
	init();
	bridge->initial_data["action"] = action;
	bridge->initial_data["argument"] = argument;
	load(QUrl("stibium.html"));
}


View::~View(){
	qDebug() << "View destructed";
}


void View::init(){
	QWebSettings* defaultSettings = QWebSettings::globalSettings();
	defaultSettings->setAttribute(QWebSettings::DeveloperExtrasEnabled, true);
	defaultSettings->setAttribute(QWebSettings::JavascriptEnabled, true);  
//	defaultSettings->setAttribute(QWebSettings::PluginsEnabled,true);
	defaultSettings->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls,true);
	page()->setLinkDelegationPolicy(QWebPage::DelegateAllLinks);
	connect(this, SIGNAL(linkClicked(const QUrl &)),
		this, SLOT(LinkClicked(const QUrl &)) );
	connect(page()->mainFrame(), SIGNAL(javaScriptWindowObjectCleared()),
		this, SLOT(javaScriptWindowObjectCleared()) );
	bridge = new Bridge();
}


void View::javaScriptWindowObjectCleared(){
	page()->mainFrame()->addToJavaScriptWindowObject("bridge", bridge);
}


void View::LinkClicked(const QUrl &url){
	if(url.scheme() == "action"){
		if( (url.authority() == "kw" || url.authority() == "kz")
		    && url.hasFragment() ){
			emit openTab(url.authority(), url.fragment());
		}
	}
}


Bridge::Bridge() : QObject() {

}


Bridge::~Bridge(){

}


void Bridge::debug(QString msg){
	qDebug() << msg;
}


QVariantMap Bridge::getInitialData(){
	return initial_data;
}
