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
}