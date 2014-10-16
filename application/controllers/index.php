<?php

/**
 * The index controller
 */
class Index extends Controller
{
    function __construct()
    {
            parent::__construct();
    }

    function index()
    {
            $this->view->render('index/index');
    }

    /**
     * The login action, when you do login/login
     */
    function login()
    {
        // run the login() method in the login-model, put the result in $login_successful (true or false)
        $login_model = $this->loadModel('Login');
        // perform the login method, put result (true or false) into $login_successful
        $login_successful = $login_model->login();

        // check login status
        if ($login_successful) {
            // if YES, then move user to dashboard/index (btw this is a browser-redirection, not a rendered view!)
            header('location: ' . URL . 'game/index');
        } else {
            // if NO, then move user to index/index (login form) again
            header('location: ' . URL . 'index/index');
        }
    }

    /**
     * The logout action, login/logout
     */
    function logout()
    {
        $login_model = $this->loadModel('Login');
        $login_model->logout();
        // redirect user to base URL
        header('location: ' . URL);
    }
}