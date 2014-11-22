<?php

/**
 * Class Index
 * The index controller
 */
class Game extends Controller
{
    function __construct()
    {
            parent::__construct();

            Auth::handleLogin();
    }

    function index()
    {
            $this->view->render('game/index');
    }

    function game()
    {
    	//TODO: model de connexion à la base de donnée
    	//TODO: une fois db gérée, header vers game/game
    		$this->view->render('game/game');
    }

    function multiplayer()
    {
        $this->view->render('game/gameMultiplayer');
    }

    function dev()
    {
        $this->view->render('game/dev');
    }
}