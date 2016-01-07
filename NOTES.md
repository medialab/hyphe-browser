Partie droite :

  status →
    corpus.crawler.jobs_pending = nb de crawls prévus
    corpus.crawler.jobs_running = nb de crawls en cours
    corpus.memory_structure.pages_to_index = nb de pages à indexer

    3 situations :
    * running > 0 => working…
    * pending == running == 0 => OK
    * pending > 0 && running == 0 => not OK
      * afficher la météo

  météo crawler globale →
    indicateur numérique fourni par l'API, affiche une image en fonction

  Affichage finale :
    [ icone ] [ nb pending ] [ nb to_index ] [ météo ]


Partie gauche :

  corpus.memory_structure.webentities.DISCOVERED/IN/OUT/UNDECIDED

  Affichage final :
    [ IN ] [ UNDECIDED ] [ OUT ] [ DISCOVERED ] background avec le code couleur


Erreur :

  get status →
    ready = false => freezer l'interface + message rouge
    vérifier ports_left et ram_left > 0, si 0 alors c'est mort
    sinon relancer start_corpus

  erreur runtime →
    message rouge + ne pas freezer


Status Info / Edit :

  [ IN ] [ UNDECIDED ] [ OUT ] fond plein si statut actif, click = passer à ce statut

  webentity.crawling_status/indexing_status => tableau des status => affiche Uncrawled/Scheduled/Running/Done

  Passage à IN  :
  * le webentity.name devient éditable
  * l'URL devient sélection de préfixe
  * bouton de validation "Crawl"

  Bouton "adjust" :
  * passage au mode édit (idem IN)
  * bouton de validation "Apply"


Infos web entity:

  [ bouton Home = lien vers webentity.homepage ]
  [ input webentity.name ]


À chaque chargement d'URL :

  * API declare_page
  * Surlignage du préfixe de la WE : https://github.com/medialab/hyphe/blob/master/hyphe_frontend/app/js/service_utils.js


Dropbox "fill stack" :

  * Prospection => les WE "DISCOVERED" triées par nb de citations
  * Tagging => les WE "IN"
  * Undecided => les WE "UNDECIDED"
  * Hyphe / demo / api
