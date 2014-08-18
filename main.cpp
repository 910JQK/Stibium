#include <QApplication>
#include "window.h"


int main(int argc, char *argv[]){
	QApplication app(argc, argv);
	Window w(&app);
	w.show();
	return app.exec();
}


