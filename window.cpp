#include <QApplication>
#include <QDesktopWidget>
#include "window.h"
#include "view.h"


Window::Window(QWidget *parent) : QMainWindow(parent){
	MainView = new View(this);
	setCentralWidget(MainView);

	setWindowTitle(tr("Stibium"));
	resize(800, 600);
	QDesktopWidget *desktop = QApplication::desktop();
	move((desktop->width() - this->width())/2, (desktop->height() - this->height())/2);
}


Window::~Window(){

}
