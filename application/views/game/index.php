<div class="content">
    <h1>Jeux</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- Texte aléatoire useless pour test -->
        <p align="justify">Il faut etre loggé pour avoir acces a cette page</p>
        <p align="justify">Ici mettre 2 boutons + l'affichage du nombre de joueurs en recherche de partie</p>
        <form action="<?php echo URL; ?>game/game">
            <input type="submit" value="Partie solo">
        </form>
        <form action="<?php echo URL; ?>game/multiplayer">
            <input type="submit" value="Partie multijoueur">
        </form>
        <form action="<?php echo URL; ?>game/dev">
            <input type="submit" value="TEST">
        </form>
        <p align="justify">Le premier bouton va charger une partie en solo et l'afficher dans un canvas, le second va charger une partie en multijoueur</p>
    </article>
</div>
