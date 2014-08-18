#ifndef STIBIUM_WINDOW_H_
#define STIBIUM_WINDOW_H_
#include <QMainWindow>
#include <QString>
#include <QList>

class QApplication;
class QWidget;
class QTabWidget;
class QHBoxLayout;
class QLineEdit;
class QPushButton;
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
	void closeTab(int index);
	void changeTabTitle(QString title, View *addr);
	void query();
protected:
	QTabWidget *Tabs;
	QList<View*> views;
	QWidget *corner;
	QHBoxLayout *queryLayout;
	QLineEdit *queryEdit;
	QPushButton *queryButton;
private:
	QApplication *application;
};


#endif //STIBIUM_WINDOW_H_
