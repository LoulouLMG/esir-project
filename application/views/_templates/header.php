<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Projet ESIR</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" href="<?php echo URL;?>public/css/style.css"/>
    
    <script type="text/javascript" src="<?php echo URL;?>public/js/application.js"></script>
</head>
<body>
    <div class="debug-helper-box">
        DEBUG HELPER :</br>
        <?php 
        if(Session::get('user_logged_in'))
        {
            echo "- Connecté en tant que : " . Session::get('user_name');
        }else{
            echo "- Non connecté";
        }
        ?>
    </div>
    <div id ="wrap">
        <div id = "top">
            <div class='title-box'>
                <a href="<?php echo URL; ?>">Projet Esir</a>
            </div>
            <div id="nav-bar">
                <ul>
                    <li>
                        <a href="<?php echo URL; ?>index/index">Accueil</a>
                    </li>
                    <li>
                        <a href="<?php echo URL; ?>score/index">High Scores</a></li>
                    </li>
                    <?php 
                    if(Session::get('user_logged_in'))
                    {
                        echo "
                        <li style=\"float: right; margin-right: 11%;\">
                        <a href=\"".URL."index/logout\">Se déconnecter</a></li>
                        </li>";
                    }?>
                </ul>
                <div class="clr"></div>
            </div>
        </div>
        <!-- Beginning of the "body" of the current page -->
        <div id ="page">
            <div id="main">
