#include <QApplication>
#include <QDesktopWidget>
#include <QTabWidget>
#include <QPushButton>
#include <QAction>
#include <QKeySequence>
#include <QNetworkAccessManager>
#include <QNetworkCookieJar>
#include <QDebug>
#include "window.h"
#include "view.h"


Window::Window(QApplication *app, QWidget *parent) : QMainWindow(parent) {
	application = app;

	NetworkAccessManager = new QNetworkAccessManager();
	NetworkAccessManager -> setCookieJar(new QNetworkCookieJar());

	Tabs = new QTabWidget(this);
	Tabs -> setTabsClosable(true);
	Tabs -> setMovable(true);

/*
	corner = new QWidget(Tabs);
	queryEdit = new QLineEdit(corner);
	queryEdit -> setPlaceholderText("Query");
	queryButton = new QPushButton("Go", corner);
	queryLayout = new QHBoxLayout(corner);
	queryLayout -> addWidget(queryEdit);
	queryLayout -> addWidget(queryButton);
	corner -> setLayout(queryLayout);
	Tabs -> setCornerWidget(corner);
*/
	newTabButton = new QPushButton("+", this);
	Tabs -> setCornerWidget(newTabButton);

	/* Not work now */
	QKeySequence ks("Crtl+W");
	closeAction = new QAction(this);
	closeAction -> setShortcut(ks);
	addAction(closeAction);

	setCentralWidget(Tabs);
	openTab();

	setWindowTitle(tr("Stibium"));
	resize(800, 600);
	QDesktopWidget *desktop = QApplication::desktop();
	move((desktop->width() - this->width())/2, (desktop->height() - this->height())/2);

	connect(closeAction, SIGNAL(triggered()),
		this, SLOT(closeTab()) );
	connect(Tabs, SIGNAL(tabCloseRequested(int)),
		this, SLOT(closeTab(int)) );
	connect(newTabButton, SIGNAL(clicked()),
		this, SLOT(openTab()) );
/*
	connect(queryEdit, SIGNAL(returnPressed()),
		this, SLOT(query()) );
	connect(queryButton, SIGNAL(clicked()),
		this, SLOT(query()) );
*/
}


Window::~Window(){
	qDebug() << "Window destructed";
}


void Window::addTab(View *v){
	connect(v, SIGNAL(openTab(QString, QString)),
		this, SLOT(openTab(QString, QString)) );
	connect(v, SIGNAL(titleChangeRequested(QString, View*)),
		this, SLOT(changeTabTitle(QString, View*)) );
	v -> page() -> setNetworkAccessManager(NetworkAccessManager);
	v -> Load();
	Tabs -> addTab(v, "New Tab");
	views.append(v);
	Tabs -> setCurrentIndex(Tabs -> count() - 1);
}


void Window::openTab(){
	openTab("index", "");
}


void Window::openTab(QString action, QString argument){
	View *v;
	v = new View(this, action, argument);
	addTab(v);
}


void Window::closeTab(){
	closeTab(Tabs->currentIndex());
}


void Window::closeTab(int index){
	delete Tabs -> widget(index);
	if(Tabs->count() == 0)
		application -> exit();
}


void Window::changeTabTitle(QString title, View *addr){
	for(int i=0; i<Tabs->count(); i++){
		if(Tabs->widget(i) == addr){
			if(title.length() <= 8)
				Tabs -> setTabText(i, title);
			else
				Tabs -> setTabText(i, title.left(8)+"...");
			Tabs -> setTabToolTip(i, title);
		}
	}
}


/*
void Window::query(){
	openTab("kw", queryEdit->text());
}
*/
