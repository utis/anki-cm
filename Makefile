srcdir  := src
distdir := dist
nodedir := node_modules
cmdir := cm-chessboard
ankidir := ~/.local/share/Anki2/Egoge/collection.media/ 
target-files := _anki-cm.js _standard.svg _staunty.svg _chessboard.css
targets := $(target-files:%=$(distdir)/%)
extra-targets := $(distdir)/index.html
chessdir := chess.js/src
boarddir := cm-chessboard/src

# .PHONY: test
# test:
# 	echo $(targets)

.DELETE_ON_ERROR:

.PHONY: all

all: esbuild $(targets) $(extra-targets)

$(distdir)/_anki-cm.js: $(srcdir)/anki-cm.js $(boarddir)/Chessboard.js $(chessdir)/chess.js
	./$(nodedir)/.bin/esbuild $< --bundle --outfile=$@

$(distdir)/_standard.svg: $(cmdir)/assets/pieces/standard.svg
	cp -f $< $@

$(distdir)/_staunty.svg: $(cmdir)/assets/pieces/staunty.svg
	cp -f $< $@

$(distdir)/index.html: $(srcdir)/index.html
	cp -f $< $@

$(distdir)/_chessboard.css: $(cmdir)/assets/chessboard.css
	cp -f $< $@


$(chessdir)/chess.js: $(chessdir)/chess.ts
	cd $(chessdir) && tsc 

.PHONY: esbuild

esbuild: $(nodedir)/esbuild

$(nodedir)/esbuild:
	npm install --save-exact --save-dev esbuild


.PHONY: clean install

clean:
	rm -f $(targets) $(extra-targets)

install: $(targets) $(extra-targets)
	cp -f $^ $(ankidir)

