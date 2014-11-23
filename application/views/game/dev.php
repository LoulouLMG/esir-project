<div class="content">
    <h1>TEST</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- librairie -->
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
        <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
        <!-- grille du jeux -->
        <canvas id="canvas" width="600" height="600"></canvas>
        
        <script type="text/javascript">
         var pseudo = <?php echo '"'.Session::get('user_name').'"'; ?>;
        </script>
        <!-- client script -->
        <script type="text/javascript" src="<?php echo URL;?>public/js/client.js"></script> 
    </article>
</div>
