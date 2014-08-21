#include <QWebFrame>
#include <QWidget>
#include <QUrl>
#include <QDebug>
#include "view.h"


View::View(QWidget *parent) : QWebView(parent) {
	init();
}


View::View(QWidget *parent, QString action, QString argument):QWebView(parent) {
	init();
	bridge->initial_data["action"] = action;
	bridge->initial_data["argument"] = argument;
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
	defaultSettings->setObjectCacheCapacities(0, 0, 0);
	page()->setLinkDelegationPolicy(QWebPage::DelegateAllLinks);
	bridge = new Bridge();
	connect(this, SIGNAL(linkClicked(const QUrl &)),
		this, SLOT(LinkClicked(const QUrl &)) );
	connect(page()->mainFrame(), SIGNAL(javaScriptWindowObjectCleared()),
		this, SLOT(javaScriptWindowObjectCleared()) );
	connect(bridge, SIGNAL(changeTitle(QString)),
		this, SLOT(changeTitle(QString)) );
}


void View::Load(){
	load(QUrl("stibium.html"));
}


void View::javaScriptWindowObjectCleared(){
	page()->mainFrame()->addToJavaScriptWindowObject("bridge", bridge);
}


void View::LinkClicked(const QUrl &url){
	if(url.scheme() == "tieba"){
		if( (url.authority() == "kw" || url.authority() == "kz")
		    && url.hasFragment() ){
			emit openTab(url.authority(), url.fragment());
		}
	}
}


void View::changeTitle(QString title){
	emit titleChangeRequested(title, this);
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
