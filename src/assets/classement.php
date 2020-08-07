<?php
    header('Access-Control-Allow-Origin: *');
     $servername = "SERVER_NAME";
     $username   = "USERNAME";
     $password   = "PASS";
     $dbname     = "DATABASE_NAME";

     $action = valider("action");
     if($action == null)
        die('ERREUR');
    
    switch($action) {
        case 'Lister Classement' :
            $sql = "SELECT * FROM scores ORDER BY score DESC LIMIT 10";
            echo(json_encode(parcoursRs(SQLSelect($sql,$servername,$dbname,$username,$password))));
		break;
		
		case 'addscore' :
			// j'ajoute dans la bdd (on a donc 11 éléments dedans);
			// je liste l'ensemble, je récupère l'id du dernier et je le supprime de la bdd
			if (valider("score","POST") && valider("name","POST")){
				$score =(int)valider("score","POST");
				$name = valider("name","POST");
				$sql = "INSERT INTO scores (nom,score) VALUES ('$name','$score')";
				SQLInsert($sql,$servername,$dbname,$username,$password); // on insère le nouveau score
				// puis on supprime le plus mauvais
				$sql = "DELETE FROM scores ORDER BY score LIMIT 1";
				SQLUpdate($sql,$servername,$dbname,$username,$password); // on supprime le plus mauvais
			}
            echo json_encode("SUCCESS");
		break;
    }
     
     
/**
 * Effectue une requete SELECT dans une base de données SQL SERVER
 * Renvoie FALSE si pas de resultats, ou la ressource sinon
 * @pre Les variables  $BDD_login, $BDD_password $BDD_chaine doivent exister
 * @param string $SQL
 * @return boolean|resource
 */
function SQLSelect($sql,$BDD_host,$BDD_base,$BDD_user,$BDD_password)
{	
	try {
		$dbh = new PDO("mysql:host=$BDD_host;dbname=$BDD_base", $BDD_user, $BDD_password);
	} catch (PDOException $e) {
		die("<font color=\"red\">SQLSelect: Erreur de connexion : " . $e->getMessage() . "</font>");
	}

	$dbh->exec("SET CHARACTER SET utf8");
	$res = $dbh->query($sql);
	if ($res === false) {
		$e = $dbh->errorInfo(); 
		die("<font color=\"red\">SQLSelect: Erreur de requete : " . $e[2] . "</font>");
	}
	
	$num = $res->rowCount();
	$dbh = null;

	if ($num==0) return false;
	else return $res;
}

/**
*
* Parcours les enregistrements d'un résultat mysql et les renvoie sous forme de tableau associatif
* On peut ensuite l'afficher avec la fonction print_r, ou le parcourir avec foreach
* @param resultat_Mysql $result
*/
function parcoursRs($result)
{
	if  ($result == false) return array();

	$result->setFetchMode(PDO::FETCH_ASSOC);
	while ($ligne = $result->fetch()) 
		$tab[]= $ligne;

	return $tab;
}

/**
 * Exécuter une requête UPDATE. Renvoie le nb de modifs ou faux si pb
 * On testera donc avec === pour différencier faux de 0 
 * @return le nombre d'enregistrements affectés, ou false si pb...
 * @param string $sql
 * @pre Les variables  $BDD_login, $BDD_password $BDD_chaine doivent exister
 */
function SQLUpdate($sql,$BDD_host,$BDD_base,$BDD_user,$BDD_password)
{
	try {
		$dbh = new PDO("mysql:host=$BDD_host;dbname=$BDD_base", $BDD_user, $BDD_password);
	} catch (PDOException $e) {
		die("<font color=\"red\">SQLUpdate/Delete: Erreur de connexion : " . $e->getMessage() . "</font>");
	}

	$dbh->exec("SET CHARACTER SET utf8");
	$res = $dbh->query($sql);
	if ($res === false) {
		$e = $dbh->errorInfo(); 
		die("<font color=\"red\">SQLUpdate/Delete: Erreur de requete : " . $e[2] . "</font>");
	}

	$dbh = null;
	$nb = $res->rowCount();
	if ($nb != 0) return $nb;
	else return false;
	
}

/**
 * Exécuter une requête INSERT 
 * @param string $sql
 * @pre Les variables  $BDD_login, $BDD_password $BDD_chaine doivent exister
 * @return Renvoie l'insert ID ... utile quand c'est un numéro auto
 */

function SQLInsert($sql,$BDD_host,$BDD_base,$BDD_user,$BDD_password)
{
	
	try {
		$dbh = new PDO("mysql:host=$BDD_host;dbname=$BDD_base", $BDD_user, $BDD_password);
	} catch (PDOException $e) {
		die("<font color=\"red\">SQLInsert: Erreur de connexion : " . $e->getMessage() . "</font>");
	}

	$dbh->exec("SET CHARACTER SET utf8");
	$res = $dbh->query($sql);
	if ($res === false) {
		$e = $dbh->errorInfo(); 
		die("<font color=\"red\">SQLInsert: Erreur de requete : " . $e[2] . "</font>");
	}

	$lastInsertId = $dbh->lastInsertId();
	$dbh = null; 
	return $lastInsertId;
}

/**
*
* Evite les injections SQL en protegeant les apostrophes par des '\'
* Attention : SQL server utilise des doubles apostrophes au lieu de \'
* ATTENTION : LA PROTECTION N'EST EFFECTIVE QUE SI ON ENCADRE TOUS LES ARGUMENTS PAR DES APOSTROPHES
* Y COMPRIS LES ARGUMENTS ENTIERS !!
* @param string $str
*/
function proteger($str)
{
	// attention au cas des select multiples !
	// On pourrait passer le tableau par référence et éviter la création d'un tableau auxiliaire
	if (is_array($str))
	{
		$nextTab = array();
		foreach($str as $cle => $val)
		{
			$nextTab[$cle] = htmlspecialchars(addslashes($val));
		}
		return $nextTab;
	}
	else 	
		return htmlspecialchars(addslashes ($str));
	//return str_replace("'","''",$str); 	//utile pour les serveurs de bdd Crosoft
}

/**
 * Vérifie l'existence (isset) et la taille (non vide) d'un paramètre dans un des tableaux GET, POST, COOKIES, SESSION
 * Renvoie false si le paramètre est vide ou absent
 * @note l'utilisation de empty est critique : 0 est empty !!
 * Lorsque l'on teste, il faut tester avec un ===
 * @param string $nom
 * @param string $type
 * @return string|boolean
 */
function valider($nom,$type="REQUEST")
{	
	switch($type)
	{
		case 'REQUEST': 
		if(isset($_REQUEST[$nom]) && !($_REQUEST[$nom] == "")) 	
			return proteger($_REQUEST[$nom]); 	
		break;
		case 'GET': 	
		if(isset($_GET[$nom]) && !($_GET[$nom] == "")) 			
			return proteger($_GET[$nom]); 
		break;
		case 'POST': 	
		if(isset($_POST[$nom]) && !($_POST[$nom] == "")) 	
			return proteger($_POST[$nom]); 		
		break;
		case 'COOKIE': 	
		if(isset($_COOKIE[$nom]) && !($_COOKIE[$nom] == "")) 	
			return proteger($_COOKIE[$nom]);	
		break;
		case 'SESSION': 
		if(isset($_SESSION[$nom]) && !($_SESSION[$nom] == "")) 	
			return $_SESSION[$nom]; 		
		break;
		case 'SERVER': 
		if(isset($_SERVER[$nom]) && !($_SERVER[$nom] == "")) 	
			return $_SERVER[$nom]; 		
		break;
	}
	return false; // Si pb pour récupérer la valeur 
}