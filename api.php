<?php
include 'classes/db.php';
include 'classes/User.php';

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    exit( json_encode(array('response' => 0, 'data' => '', 'message' => 'Only Post methods are Allowed.')) );
}

// exit(json_encode($_SESSION));

$user = new User();
if(isset($_POST["apiAction"]) && !empty($_POST["apiAction"])){
    switch( $_POST["apiAction"] ){
        case "addUser": {
            $user->addUser();
            break;
        }
        case "loginUser": {
            $user->loginUser();
            break;
        }
        case "logout": {
            $user->logout();
            break;
        }
        case "syncChat": {
            $user->syncChat();
            break;
        }
        case "loadChat": {
            $user->loadChat();
            break;
        }
        case "sendMessage": {
            $user->sendMessage();
            break;
        }









        
        
        
        case "syncState":
            $user->syncState();
            break;
        
        case "showChat":
            $user->showChat();
            break;

        case "messagesSeen":
            $user->messagesSeen();
            break;

        

        

        case "fixUnseenError":
            $user->fixUnseenError();
            break;

        case "syncUnseenMessage":
            $user->syncUnseenMessage();
            break;

       
        
        default:
            exit( json_encode(array('response' => 0, 'data' => '', 'message' => 'Invalid \'apiAction\' is passed.')) );
    }
}
else{
    if(!isset($_POST["apiAction"])){
        exit( json_encode(array('response' => 0, 'data' => '', 'message' => '\'apiAction\' param is required.')) );
    }
    else{
        exit( json_encode(array('response' => 0, 'data' => '', 'message' => '\'apiAction\' param is NULL.')) );
    }
}