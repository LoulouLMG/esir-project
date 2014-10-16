<div class="content">
    <h1>Accueil</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- Texte aléatoire useless pour test -->
        <p align="justify">Projet réalisé avec PHP, CSS, javascript et le concept AJAX</p>

        <?php 
            if(Session::get('user_logged_in'))
            {
                echo "<a href=\"" . URL . "game/index\">Jouer</a>";
            }else{
                include("login.php");
            }
        ?>
    </article>
</div>
