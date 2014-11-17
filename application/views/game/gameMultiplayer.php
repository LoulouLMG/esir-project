<div class="content">
    <h1>Partie multijoueur</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- grille du jeux -->
        <canvas id="canvas" width="600" height="600"></canvas>
        <canvas id="playerCanvas" width="200" height="200"></canvas>
        <span id="timer"></span>
        
        <!-- librairie -->
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
		<script type="text/javascript" src="<?php echo URL;?>public/js/snakeMulti.js"></script>
        <!--<p>
            <?php echo Session::get('user_name'); ?>
            <?php echo Session::get('user_id'); ?>
        </p>-->
        <button id="button_ready">Prêt !</button>

        <script type="text/javascript" id="user">
            player_name_current = <?php echo '"'.Session::get('user_name').'"'; ?>;
        </script>

        <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
        <script id="socket">
            socket = io.connect("http://localhost:8090");
        </script>

		 
    </article>
</div>
