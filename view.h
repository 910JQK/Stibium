#ifndef STIBIUM_VIEW_H_
#define STIBIUM_VIEW_H_
#include <QWebView>

class QWidget;


class View : public QWebView {
	Q_OBJECT
public:
	View(QWidget *parent);
	~View();
};


#endif //STIBIUM_VIEW_H_
