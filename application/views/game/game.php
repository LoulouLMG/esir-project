<div class="content">
    <h1>Partie solo</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- grille du jeux -->
        <canvas id="canvas" width="600" height="600"></canvas>
        <span id="timer"></span>
        
        <!-- librairie -->
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
		<script type="text/javascript" src="<?php echo URL;?>public/js/snake.js"></script>
		 
    </article>
</div>
