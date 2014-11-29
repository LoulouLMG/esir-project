esir-project
============

Launch node server with : "node server_DEV.js"

TODOs : 

- debug all possible bugs--> OBLIGATION
- clean all API's and the code in general when the debug will be done.
- after that think about the pretty log feedback.

Game Mechanics ( Easy )
- prevents the head of a reset snake to spawn on either a token or another snake.

Look ( Medium )
- add a small animation on the client canva which will flash when his score will be upgraded ( Like a small "+10" with his     color       under or above his head depending on the position)
- improve client html interface to display the score of the winner of a game session
- prevent the random color given to the client to be too transparent or to looks alike another client's color

Server mechanic ( Hard )
- record each current game session in the mysql database ( which require the DB to be adapted and developped a lot more;) )
    --> prepares the field for fault tolerant part since we will need to stores game's session information in DB in order to            make able the seconde nodeJS server to recover theses data from the first.
- prevent a player to connect on an already launched game and give him a proper feedback to make him wait. ( in the future there   will be a selection of game with all informations about their current state and client will be able to play without waiting     for a game to be available).
