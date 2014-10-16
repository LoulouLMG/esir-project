<?php

/**
 * Handles the user's login / logout 
 */
class LoginModel
{
    /**
     * Constructor, expects a Database connection
     * @param Database $db The Database object
     */
    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    private function setSession($id, $name)
    {
        Session::init();
        Session::set('user_id', $id);
        Session::set('user_logged_in', true);
        Session::set('user_name', $name);
    }

    /**
     * Login process
     * @return bool success state
     */
    public function login()
    {
        // we do negative-first checks here
        if (!isset($_POST['user_name']) OR empty($_POST['user_name'])) {
            $_SESSION["feedback_negative"][] = FEEDBACK_USERNAME_FIELD_EMPTY;
            return false;
        }
        // get user's data
        $sql = "  SELECT  id, name
                    FROM    user
                    WHERE   name = :user_name";
       
        $query = $this->db->prepare($sql);
        $query->execute(array(':user_name' => $_POST['user_name']));
        $count =  $query->rowCount();
    
        // if there's NOT one result then register user
        if ($count != 1) 
        {
            return $this->registerNewUser();
        }
        else
        {
            $query_result = $query->fetch();
            $this->do_login($query_result->id, $query_result->name);
            return true;
        }
        return false;
    }


    /**
     * Log out process, deletes session
     */
    public function logout()
    {
        $sql = "UPDATE user SET connected = false WHERE id = " . Session::get('user_id');
        $this->db->query($sql);

        // delete the session
        Session::destroy();
    }

    /**
     * Returns the current state of the user's login
     * @return bool user's login status
     */
    public function isUserLoggedIn()
    {
        return Session::get('user_logged_in');
    }

    /**
     * handles the entire login process and creates a new user in the database if everything is fine
     * @return boolean Gives back the success status of the registration
     */
    private function registerNewUser()
    {
        $regex = "/^[a-z\d]{2,45}$/i";
        // perform all necessary form checks
        if (empty($_POST['user_name'])) 
        {
            $_SESSION["feedback_negative"][] = FEEDBACK_USERNAME_FIELD_EMPTY;
        } elseif (strlen($_POST['user_name']) > 45 OR strlen($_POST['user_name']) < 2) 
        {
            $_SESSION["feedback_negative"][] = FEEDBACK_USERNAME_TOO_SHORT_OR_TOO_LONG;
        } elseif (!preg_match($regex, $_POST['user_name'])) 
        {
            $_SESSION["feedback_negative"][] = FEEDBACK_USERNAME_DOES_NOT_FIT_PATTERN;
        }
        // clean the input
        $user_name = strip_tags($_POST['user_name']);

         // check if username already in use (logged)
        $query = $this->db->prepare("SELECT connected FROM user WHERE name = :user_name");
        $query->execute(array(':user_name' => $user_name));
        $result_user_row = $query->fetch();
        $user_status = $result_user_row->connected;
        // if a user with the same name is logged, we cannot log in
        if ($user_status == true) {
            $_SESSION["feedback_negative"][] = FEEDBACK_USERNAME_ALREADY_TAKEN;
            return false;
        }

        // write new users data into database
        $sql = "INSERT INTO  user (name) VALUES (:user_name)";
        $query = $this->db->prepare($sql);
        $query->execute(array(':user_name' => $user_name));
        $count =  $query->rowCount();

        if ($count != 1) 
        {
            $_SESSION["feedback_negative"][] = FEEDBACK_UNKNOWN_ERROR;
            return false;
        }
        else
        {
            $query = $this->db->prepare("SELECT id FROM user WHERE name = :user_name");
            $query->execute(array(':user_name' => $user_name));
            $query_result = $query->fetch();
            $user_id->$query_result->id;
            $this->do_login($user_id, $user_name);
            return true;
        }
        //default return
        return false;
    }

    private function do_login($user_id, $user_name)
    {
        $sql = "UPDATE user SET connected = true WHERE id = " . $user_id;
        $this->db->query($sql);
        $this->setSession($user_id, $user_name);
    }
}
