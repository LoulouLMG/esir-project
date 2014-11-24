<div class="content">
    <h1>Super Snake Multi</h1>
    <article>
        <!-- echo out the system feedback (error and success messages) -->
        <?php $this->renderFeedbackMessages(); ?>

        <!-- librairie -->
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
        <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
        <!-- timer du jeux -->
        <h2  id="timer"/></h2>
        <!-- grille du jeux -->
        <canvas id="canvas" width="600" height="600"></canvas>
        <!-- grille du des scores -->
        <div id="score_board"></div>
        
        
        <?php
            $data = array(
            "pseudo" => Session::get('user_name'),
            "host" => URL_NODE_SOCKET,
            "port" => PORT_NODE_SOCKET
            );
        ?>

        <button onclick="sendReady();">Ready</button>

        <script type="text/javascript">
            var data = <?php echo json_encode($data, JSON_PRETTY_PRINT) ?>;
        </script>
        <!-- client script -->
        <script type="text/javascript" src="<?php echo URL;?>public/js/client.js"></script> 
    </article>
</div>
