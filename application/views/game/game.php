<div class="content">
    <h1>Jeu</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- grille du jeux -->
        <canvas id="canvas" width="400" height="400"></canvas>
        
        <!-- librairie -->
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
		<script type="text/javascript" src="<?php echo URL;?>public/js/snake.js"></script>
		 
    </article>
</div>
