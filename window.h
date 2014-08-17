#ifndef STIBIUM_WINDOW_H_
#define STIBIUM_WINDOW_H_
#include <QMainWindow>
#include <QString>
#include <QList>

class QWidget;
class QTabWidget;
class QHBoxLayout;
class QLineEdit;
class QPushButton;
class View;


class Window : public QMainWindow {
	Q_OBJECT
public:
	Window(QWidget *parent = 0);
	~Window();
public slots:
	void addTab(View *v);
	void openTab();
	void openTab(QString action, QString argument);
	void query();
protected:
	QTabWidget *MainView;
	QList<View*> views;
	QWidget *corner;
	QHBoxLayout *queryLayout;
	QLineEdit *queryEdit;
	QPushButton *queryButton;
};


#endif //STIBIUM_WINDOW_H_
