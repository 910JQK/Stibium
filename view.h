#ifndef STIBIUM_VIEW_H_
#define STIBIUM_VIEW_H_
#include <QWebView>
#include <QObject>
#include <QString>
#include <QVariant>

class QWidget;
class Bridge;


class View : public QWebView {
	Q_OBJECT
public:
	View(QWidget *parent);
	View(QWidget *parent, QString action, QString argument);
	~View();
	Bridge *bridge;
signals:
	void openTab(QString action, QString argument);
public slots:
	void javaScriptWindowObjectCleared();
	void LinkClicked(const QUrl &url);
protected:
	void init();
};


class Bridge : public QObject {
	Q_OBJECT
public:
	Bridge();
	~Bridge();
	QVariantMap initial_data;
public slots:
	void debug(QString msg);
	QVariantMap getInitialData();
};


#endif //STIBIUM_VIEW_H_
