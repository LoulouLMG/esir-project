<?php

/**
 * The index controller
 */
class Score extends Controller
{
    function __construct()
    {
            parent::__construct();
    }

    function index()
    {
            $this->view->render('score/index');
    }
}