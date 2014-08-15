#include <QUrl>
#include "view.h"


View::View(QWidget *parent) : QWebView(parent) {
	QWebSettings* defaultSettings = QWebSettings::globalSettings();
	defaultSettings->setAttribute(QWebSettings::DeveloperExtrasEnabled, true);
	defaultSettings->setAttribute(QWebSettings::JavascriptEnabled, true);  
	defaultSettings->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls,true);
	load(QUrl("stibium.html"));
}


View::~View(){

}
