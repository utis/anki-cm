INSTALLDIR := ~/.local/share/Anki2/Egoge/collection.media/ 

SRCDIR  := src
DISTDIR := dist
CMDIR := cm-chessboard
CHESSDIR := chess.js
NODEDIR := node_modules

TARGET_FILES := _ankicm.js _ankicm-standard.svg _ankicm-staunty.svg _ankicm.css
# TARGET_FILES := _ankicm.js
TARGETS := $(TARGET_FILES:%=$(DISTDIR)/%)
EXTRA_TARGETS := $(DISTDIR)/index.html

# cm-chessboard's extensions:
EXTS := markers accessibility promotion-dialog

exts_js := $(foreach e,$(EXTS),$(wildcard $(CMDIR)/src/extensions/$e/*.js))
exts_css := $(foreach e,$(EXTS),$(wildcard $(CMDIR)/assets/extensions/$e/*.css))
exts_svg := $(foreach e,$(EXTS),$(wildcard $(CMDIR)/assets/extensions/$e/*.svg))
exts_svg_targets := $(EXTS:%=$(DISTDIR)/ankicm-%.svg)

.PHONY: test

vpath %.js $(SRCDIR) $(CMDIR)/src/ $(dir $(exts_js)) $(CHESSDIR)/src
vpath %.css $(SRCDIR)/css $(CMDIR)/assets $(dir $(exts_css))
vpath %.svg $(SRCDIR)/pieces $(CMDIR)/assets/pieces $(dir $(exts_svg))
vpath % $(SRCDIR)

.DELETE_ON_ERROR:

.PHONY: all

#all: esbuild $(TARGETS) $(EXTRA_TARGETS)
all: $(TARGETS) $(EXTRA_TARGETS)

# Main JS target
$(DISTDIR)/_ankicm.js: ankicm.js
	./$(NODEDIR)/.bin/esbuild $^ --bundle --minify --outfile=$@

$(DISTDIR)/_ankicm-%.svg: %.svg
	cp -f $< $@

# $(distdir)/_ankicm-standard.svg: standard.svg
# 	cp -f $< $@

# $(distdir)/_ankicm-staunty.svg: staunty.svg
# 	cp -f $< $@

$(DISTDIR)/index.html: $(SRCDIR)/index.html
	cp -f $< $@

# $(distdir)/_chessboard.css: $(cmdir)/assets/chessboard.css
# 	cp -f $< $@
$(DISTDIR)/_ankicm.css: chessboard.css $(exts_css)
	cat $^ > $@

$(CHESSDIR)/chess.js: $(CHESSDIR)/chess.ts
	cd $(CHESSDIR) && tsc 

.PHONY: esbuild

esbuild: $(NODEDIR)/esbuild

$(NODEDIR)/esbuild:
	npm install --save-exact --save-dev esbuild

.PHONY: clean install

clean:
	rm -f $(TARGETS) $(EXTRA_TARGETS)

install: $(TARGETS) $(EXTRA_TARGETS)
	cp -f $^ $(INSTALLDIR)

