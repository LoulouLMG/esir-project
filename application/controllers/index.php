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

        /*all login are succesful in a first time, there is no password and different 
          users can have the same name in the same time */
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