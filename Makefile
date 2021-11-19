.PHONY: all
all: src/mug.png public/favicon.ico public/favicon192.png public/favicon512.png

src/mug.png: res/mug.png
	convert $< -fuzz 1% -trim -resize 800x +repage $@
	optipng $@

public/favicon%.png: res/favicon.png
	convert $< -fuzz 1% -trim -gravity center -resize $*x$* +repage $@
	optipng $@

public/favicon.ico: res/favicon.png
	convert $< -fuzz 1% -trim -gravity center -define icon:auto-resize=16,24,32,64 +repage -compress zip $@
