<?php

/**
 * Class Auth
 * Simply checks if user is logged in. In the app, several controllers use Auth::handleLogin() to
 * check if user if user is logged in, useful to show controllers/methods only to logged-in users.
 */
class Auth
{
    public static function handleLogin()
    {
        // initialize the session
        Session::init();
      
         if (!isset($_SESSION['user_logged_in'])) 
         {
            Session::destroy();
            header('location: ' . URL . 'login');
            exit();
        }
    }
}
