Interactions utilisateur :

* normal link => OK suit le lien
* target=_blank => Event "new-window" + url
* target=custom => Event "new-window" + url + frameName
* ctrl + click => Event "new-window" + url
* click droit => RIEN
* window.open => Event "new-window" + url
* foo => OK avec preload + IPC
* alert => OK affiche une alerte
