@ECHO off
start cmd /k node ../../application/core/server_DEV.js
echo "Lancement du server principal..."
FOR /F %%T IN ('Wmic process where^(Name^="node.exe"^)get ProcessId^|more +1') DO (SET /A ProcessId=%%T)
timeout /T 7
start cmd /k node ../../application/core/server_BACKUP.js
echo "Lancement du serveur backup..."
start cmd /k beforeStop.html
echo "Lancement du premier test !"                                                           
SET /A ProcMain=%ProcessId%
timeout /T 7
echo "Le serveur principal est coupe !"
Taskkill /F /pid %ProcMain%
echo "Recuperation en cours par le serveur backup..."
timeout /T 7
echo "Lancement du second test !"
start cmd /k afterStop.html
echo "Test termine ! Vous pouvez arreter le processus."
pause