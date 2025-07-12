VIVALDI_PATH = /Applications/Vivaldi.app/Contents/Frameworks/Vivaldi\ Framework.framework/Versions/Current/Resources/vivaldi

install:
	sass styles/sass/:styles/css
	npm run build:prod
	
	rm -rf $(VIVALDI_PATH)/*

	cp -R * $(VIVALDI_PATH)/