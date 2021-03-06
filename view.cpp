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
	delete bridge;
//	qDebug() << "View destructed";
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
	bridge -> counter_ptr = NULL;
	connect(this, SIGNAL(linkClicked(const QUrl &)),
		this, SLOT(LinkClicked(const QUrl &)) );
	connect(page()->mainFrame(), SIGNAL(javaScriptWindowObjectCleared()),
		this, SLOT(javaScriptWindowObjectCleared()) );
	connect(bridge, SIGNAL(changeTitle(QString)),
		this, SLOT(changeTitle(QString)) );
	connect(bridge, SIGNAL(openTab(QString, QString)),
		this, SIGNAL(openTab(QString, QString)) );
}


void View::Load(){
	load(QUrl("stibium.html"));
}


void View::javaScriptWindowObjectCleared(){
	page()->mainFrame()->addToJavaScriptWindowObject("bridge", bridge);
}


void View::LinkClicked(const QUrl &url){
	if(url.scheme() == "tieba"){
		emit openTab(url.authority(), url.fragment());
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


void Bridge::setCounter(unsigned int val){
	*counter_ptr = val;
}


unsigned int Bridge::getCounter(){
	if(counter_ptr != NULL)
		return *counter_ptr;
	else
		return 0;
}


void Bridge::setInitialData(QString action, QString argument){
	initial_data["action"] = action;
	initial_data["argument"] = argument;
}


QVariantMap Bridge::getInitialData(){
	return initial_data;
}
