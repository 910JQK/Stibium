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
	void Load();
signals:
	void openTab(QString action, QString argument);
	void titleChangeRequested(QString title, View *view);
public slots:
	void javaScriptWindowObjectCleared();
	void LinkClicked(const QUrl &url);
	void changeTitle(QString title);
protected:
	void init();
};


class Bridge : public QObject {
	Q_OBJECT
public:
	Bridge();
	~Bridge();
	QVariantMap initial_data;
signals:
	void changeTitle(QString title);
public slots:
	void debug(QString msg);
	QVariantMap getInitialData();
};


#endif //STIBIUM_VIEW_H_
