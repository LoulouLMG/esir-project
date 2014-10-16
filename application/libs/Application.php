<?php

/**
 * Class Application is the "dispatcher"
 */
class Application
{
    /** @var null The controller part of the URL */
    private $url_controller;
    /** @var null The method part (of the above controller) of the URL */
    private $url_action;
    /** @var null Parameters of the URL */
    private $url_parameters;


    /**
     * Starts the Application
     * Takes the parts of the URL and loads the according controller & method and passes the parameter arguments to it
     */
    public function __construct()
    {
        $url_parameters = array();
        $this->splitUrl();
        // check for controller: is the url_controller NOT empty ?
        if ($this->url_controller) 
        {
            // check for controller: does such a controller exist ?
            if (file_exists(CONTROLLER_PATH . $this->url_controller . '.php')) 
            {
                require CONTROLLER_PATH . $this->url_controller . '.php';
                $this->url_controller = new $this->url_controller();
                // check for method: does such a method exist in the controller ?
                if ($this->url_action) {
                    if (method_exists($this->url_controller, $this->url_action)) 
                    {
                        // call the method and pass the arguments to it
                        if (!empty($this->url_parameters))
                        {
                            $this->url_controller->{$this->url_action}($this->url_parameters);
                        } 
                        else 
                        {
                            // if no parameters given, just call the method without arguments
                            $this->url_controller->{$this->url_action}();
                        }
                    } 
                    else 
                    {
                        // redirect user to error page (there's a controller for that)
                        header('location: ' . URL . 'error/index');
                    }
                } 
                else 
                {
                    // default/fallback: call the index() method of a selected controller
                    $this->url_controller->index();
                }
            // show 404
            } 
            else 
            {
                // redirect user to error page (there's a controller for that)
                header('location: ' . URL . 'error/index');
            }
        // if url_controller is empty, simply show the main page (index/index)
        } 
        else 
        {
            // invalid URL, so simply show home/index
            require CONTROLLER_PATH . 'index.php';
            $controller = new Index();
            $controller->index(); 
        }
    }

    /**
     * Gets and splits the URL
     */
    private function splitUrl()
    {
        if (isset($_GET['page'])) {

            // split URL
            $url = rtrim($_GET['page'], '/');
            $url = filter_var($url, FILTER_SANITIZE_URL);
            $url = explode('/', $url);

            // Put URL parts into according properties
            $this->url_controller = (isset($url[0]) ? $url[0] : null);
            $this->url_action = (isset($url[1]) ? $url[1] : null);
            $nb_params = count($url); 
            for ($i=2; $i < $nb_params; $i++) { 
                $this->url_parameters[$i-1] = isset($url[$i]) ? $url[$i] : null;
            }  
        }
    }
}