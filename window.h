#ifndef STIBIUM_WINDOW_H_
#define STIBIUM_WINDOW_H_
#include <QMainWindow>

class QWidget;
class View;


class Window : public QMainWindow {
	Q_OBJECT
public:
	Window(QWidget *parent = 0);
	~Window();
	View *MainView;
};


#endif //STIBIUM_WINDOW_H_
