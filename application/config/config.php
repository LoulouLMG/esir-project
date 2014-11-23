<?php
/**
 * Configuration for: Base URL
 * This is the base url of the app.
 */
define('URL_NODE_SOCKET', 'http://esir-project');
define('URL', 'http://esir-project/');
define('PORT_NODE_SOCKET', '8090');

/**
 * Configuration for: Folders
 */
define('LIBS_PATH', 'application/libs/');
define('CONTROLLER_PATH', 'application/controllers/');
define('MODELS_PATH', 'application/models/');
define('VIEWS_PATH', 'application/views/');
define('IMG_PATH', 'public/img');

/**
 * Configuration for: Database Connection
 */
define('DB_TYPE', 'mysql');
define("DB_HOST", "localhost");
define("DB_NAME", "esir-project");
define("DB_USER", "root");
define("DB_PASS", "");

define("FEEDBACK_USERNAME_FIELD_EMPTY", "Le champ pseudo est vide.");
define("FEEDBACK_USERNAME_TOO_SHORT_OR_TOO_LONG", "Le pseudo ne peut pas être inférieur à 2 caractères ni excéder 45 caractères.");
define("FEEDBACK_USERNAME_DOES_NOT_FIT_PATTERN", "Ce pseudo n'est pas correct:  uniquement des lettres et des chiffres sont acceptés, de 2 à 45 caractères.");
define("FEEDBACK_USERNAME_ALREADY_TAKEN", "Désolé, quelqu'un utilise ce pseudo en ce moment. Veuillez en choisir un nouveau.");
define("FEEDBACK_UNKNOWN_ERROR", "Une erreur inconnue est survenue :v");