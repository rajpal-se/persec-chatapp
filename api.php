<?php
include 'classes/db.php';
include 'classes/User.php';


$user = new User();
if(isset($_POST["apiAction"])){
    switch($_POST["apiAction"]){
        case "addUser":
            $user->addUser();
            break;
        
        case "loginUser":
            $user->loginUser();
            break;
        
        case "syncState":
            $user->syncState();
            break;
        
        case "showChat":
            $user->showChat();
            break;

        case "messagesSeen":
            $user->messagesSeen();
            break;

        case "syncChat":
            $user->syncChat();
            break;

        case "sendMessage":
            $user->sendMessage();
            break;

        case "fixUnseenError":
            $user->fixUnseenError();
            break;

        case "syncUnseenMessage":
            $user->syncUnseenMessage();
            break;

        case "logout":
            $user->logout();
            break;
    }
}