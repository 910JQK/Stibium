#ifndef STIBIUM_WINDOW_H_
#define STIBIUM_WINDOW_H_
#include <QMainWindow>
#include <QString>
#include <QList>

class QApplication;
class QWidget;
class QTabWidget;
class QPushButton;
class QNetworkAccessManager;
class View;


class Window : public QMainWindow {
	Q_OBJECT
public:
	Window(QApplication *app, QWidget *parent = 0);
	~Window();
public slots:
	void addTab(View *v);
	void openTab();
	void openTab(QString action, QString argument);
	void closeTab();
	void closeTab(int index);
	void changeTabTitle(QString title, View *addr);
protected:
	QAction *closeAction;
	QTabWidget *Tabs;
	QList<View*> views;
	QPushButton *newTabButton;
private:
	QApplication *application;
	QNetworkAccessManager *NetworkAccessManager;
};


#endif //STIBIUM_WINDOW_H_
