update:
	node scraping/scripts/actu.js
	node scraping/scripts/charentelibre.js
	node scraping/scripts/dna.js
	node scraping/scripts/estrepublicain.js
	node scraping/scripts/ladepeche.js
	node scraping/scripts/lalsace.js
	node scraping/scripts/lamontagne-filiales.js
	node scraping/scripts/lamontagne.js
	node scraping/scripts/laprovence.js
	node scraping/scripts/lavoixdunord.js
	node scraping/scripts/lebienpublic.js
	node scraping/scripts/ledauphine.js
	node scraping/scripts/lefigaro.js
	node scraping/scripts/lejsl.js
	node scraping/scripts/lemonde.js
	node scraping/scripts/leparisien.js
	node scraping/scripts/leprogres.js
	node scraping/scripts/letelegramme.js
	node scraping/scripts/liberation.js
	node scraping/scripts/lindependant.js
	node scraping/scripts/midilibre.js
	node scraping/scripts/nicematin.js
	node scraping/scripts/nouvellerepublique.js
	node scraping/scripts/ouestfrance.js
	node scraping/scripts/republicainlorrain.js
	node scraping/scripts/sudouest.js
	node scraping/scripts/varmatin.js
	node scraping/scripts/vosgesmatin.js
	echo 'All crawls are done - Headlines updated 🎉 !'

upgrade:
	node scraping/enhancing/enhance_dating.js
	sqlite3 data.db '.mode json' '.once docs/data.json' 'select * from articles'
	node scraping/enhancing/reduce_size.js
