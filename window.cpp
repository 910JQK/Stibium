#include <QApplication>
#include <QDesktopWidget>
#include <QTabWidget>
#include <QWidget>
#include <QHBoxLayout>
#include <QLineEdit>
#include <QPushButton>
#include "window.h"
#include "view.h"


Window::Window(QWidget *parent) : QMainWindow(parent){
	MainView = new QTabWidget(this);
	MainView -> setTabsClosable(true);

	corner = new QWidget(MainView);
	queryEdit = new QLineEdit(corner);
	queryEdit -> setPlaceholderText("Query");
	queryButton = new QPushButton("Go", corner);
	queryLayout = new QHBoxLayout(corner);
	queryLayout -> addWidget(queryEdit);
	queryLayout -> addWidget(queryButton);
	corner -> setLayout(queryLayout);
	MainView -> setCornerWidget(corner);

	setCentralWidget(MainView);
	openTab();

	setWindowTitle(tr("Stibium"));
	resize(800, 600);
	QDesktopWidget *desktop = QApplication::desktop();
	move((desktop->width() - this->width())/2, (desktop->height() - this->height())/2);

	connect(queryEdit, SIGNAL(returnPressed()),
		this, SLOT(query()) );
	connect(queryButton, SIGNAL(clicked()),
		this, SLOT(query()) );
}


Window::~Window(){

}


void Window::addTab(View *v){
	connect(v, SIGNAL(openTab(QString, QString)),
		this, SLOT(openTab(QString, QString)) );
	MainView -> addTab(v, "New Tab");
	views.append(v);
	MainView -> setCurrentIndex(MainView -> count() - 1);
}


void Window::openTab(){
	View *v;
	v = new View(this);
	addTab(v);
}


void Window::openTab(QString action, QString argument){
	View *v;
	v = new View(this, action, argument);
	addTab(v);
}


void Window::query(){
	openTab("kw", queryEdit->text());
}
