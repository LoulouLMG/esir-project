<?php

/**
 * Provides the methods all views will have
 */
class View
{
    /**
     * "show" the view
     * @param string $filename Path of the to-be-rendered view, usually folder/file(.php)
     */
    public function render($filename)
    {
            require VIEWS_PATH . '_templates/header.php';
            require VIEWS_PATH . $filename . '.php';
            require VIEWS_PATH . '_templates/footer.php';
    }

    /**
     * renders the feedback messages into the view
     */
    public function renderFeedbackMessages()
    {
        // echo out the feedback messages (errors and success messages etc.),
        // they are in $_SESSION["feedback_positive"] and $_SESSION["feedback_negative"]
        require VIEWS_PATH . '_templates/feedback.php';

        // delete these messages (as they are not needed anymore and we want to avoid to show them twice
        Session::set('feedback_positive', null);
        Session::set('feedback_negative', null);
    }
}
