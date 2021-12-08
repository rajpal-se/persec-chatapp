<?php
session_start();

class User{
    private $ret = array('response' => 0, 'data' => '', 'message' => '');
    private $pdo = null;
    private $db = null;
    private $salt = "[WelCome.to@home!]Just*Have&Fun12[.]";
    private $lastActiveGap = 1500; // milliseconds
    
    function __construct(){
        $this->db = new DB();
        $this->pdo = $this->db->get_pdo();
    }

    private function _exitS($data = '', $message = ''){
        $this->ret['response'] = 1;
        $this->ret['data'] = $data;
        $this->ret['message'] = $message;
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($this->ret);
        exit();
    }
    private function _exit($message = '', $data = ''){
        $this->ret['response'] = 0;
        $this->ret['data'] = $data;
        $this->ret['message'] = $message;
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($this->ret);
        exit();
    }
    private function _validateInput($inputName, $optional = false, $defaultValue = '', $emptyStrAllowed = false){
        if( !isset($_POST[ $inputName ]) ){
            if(!$optional) $this->_exit("[{$inputName}] is Required.");
            return $defaultValue;
        }
        else{
            if(!$emptyStrAllowed && $_POST[ $inputName ] === '') $this->_exit("[{$inputName}] is NULL");
            return $_POST[ $inputName ];
        }
    }
    private function _validateInputWithId($inputName, $zeroAllowed = false, $optional = false, $defaultValue = 0){
        $id = $this->_validateInput( $inputName, $optional, $defaultValue );
        $id = intval($id);
        if(!$zeroAllowed && $id === 0) $this->_exit("[{$inputName}] is 0. Not Allowed");
        return $id;
    }
    private function _validateInputPattern($inputName){
        $value = $this->_validateInput($inputName);
        
        switch( $inputName ){
            case 'fname':
                preg_match_all('/[A-Za-z0-9\.]+/', $value, $matches);
                if($matches[0][0] != $value) $this->_exit('Invalid first name.');
                break;
            case 'lname':
                preg_match_all('/[A-Za-z0-9\.]+/', $value, $matches);
                if($matches[0][0] != $value) $this->_exit('Invalid last name.');
                break;
            case 'email':
                preg_match_all('/([a-zA-Z0-9.]+)@(([a-zA-Z0-9]+)\.)+([a-zA-Z]+)/', $value, $matches);
                if($matches[0][0] != $value) $this->_exit('Invalid email.');
                break;
            case 'pass':
                if(strlen($value) < 8) $this->_exit('Invalid passowrd! Short passowrd.');
                else{
                    preg_match_all('/[\s \~\`\!\@\#\$\%\^\&\*\(\)\-\=\_\+\{\}\|\[\]\\\:\"\;\'\<\>\?\,\.\/]+/', $value, $matches);
                    if(!isset($matches[0][0])) $this->_exit('Invalid passowrd! Use characters also.');
                    else{
                        preg_match_all('/[0-9]+/', $value, $matches);
                        if(!isset($matches[0][0])) $this->_exit('Invalid passowrd! Use numbers also');
                        else{
                            preg_match_all('/[A-Z]+/', $value, $matches);
                            if(!isset($matches[0][0])) $this->_exit('Invalid passowrd! Use upper case also.');
                            else{
                                preg_match_all('/[a-z]+/', $value, $matches);
                                if(!isset($matches[0][0])) $this->_exit('Invalid passowrd! Use lower case also.');
                            }
                        }
                    }
                }
                break;
            case 'fname':
                if($value != "male" && $value != "female") $this->_exit('Invalid gender.');
                break;
        }
        return $value;
    }
    private function _isAuthorize(){
        if(isset($_SESSION['senderId']) && $_SESSION['senderId']){
            return intval( $_SESSION['senderId'] );
        }
        $this->_exit("You are unauthorised user.");
    }
    private function _encPass($pass){
        return md5( md5($pass, $this->salt) );
    }
    public function _isEmailExists($email = ''){
        if($email == '') return false;
        $stmt = $this->pdo->prepare('SELECT id FROM users WHERE email=?');
        $stmt->execute([$email]);
        
        return $stmt->rowCount() > 0;
    }
    private function _login($email, $pass){
        $pass = $this->_encPass($pass);
        
        $stmt = $this->pdo->prepare('SELECT id FROM users WHERE email=? AND pass=?');
        $stmt->execute([$email, $pass]);
        
        if($stmt->rowCount() == 1){
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $_SESSION['senderId'] = $data[0]["id"];
            $this->_exitS('', 'Successfully Login');
        }
        else{
            $this->_exit('Invalid email/passord.');
        }
    }
    
    public function addUser(){
        $fname = $this->_validateInputPattern('fname');
        $lname = $this->_validateInputPattern('lname');
        $email = $this->_validateInputPattern('email');
        $pass = $this->_validateInputPattern('pass');
        $gender = $this->_validateInputPattern('gender');
        $image = "/images/{$gender}.jpg";
        
        // Email exists OR not
        if( $this->_isEmailExists($email) ) $this->_exit('Email already exists.');
        
        // Image
        if(isset($_FILES["image"]) && isset($_FILES["image"]["error"])){
            if($_FILES["image"]["error"] == 0 && $_FILES["image"]["size"] <= 10*1024*1024){
                if( strtolower(substr($_FILES["image"]["type"], 0, 6)) == "image/" ){
                    
                    $t = microtime();
                    $a = explode(" ", $t);
                    
                    $new = $a[1] . "_" . substr($a[0], 2) . "_" . $_FILES["image"]["name"];
                    $new2 = md5($new);
                    $new = "./images/uploads/" . $new;
                    $new2 = "./images/uploads/" . $new2 . "." . substr($_FILES["image"]["type"], 6);
                    if(move_uploaded_file($_FILES["image"]["tmp_name"], $new)){
                        copy($new, $new2);
                        $image = substr($new2, 1);
                    }
                }
            }
        }
        
        $passEncrypted = $this->_encPass($pass);
        
        $last_active = intval(microtime(true) * 1000);
        $active = 1;

        $stmt = $this->pdo->prepare("INSERT INTO users (fname, lname, email, pass, gender, image, active, last_active) VALUES (:fname, :lname, :email, :pass, :gender, :image, :active, :last_active)");
        $stmt->bindParam('fname', $fname, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('lname', $lname, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('email', $email, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('pass', $passEncrypted, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('gender', $gender, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('image', $image, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('active', $active, PDO::PARAM_INT);
        $stmt->bindParam('last_active', $last_active, PDO::PARAM_INT);
        $result = $stmt->execute();
        
        if($result){
            if(isset($_POST['login']) && !empty($_POST['login']) && ($_POST['login'] === true || $_POST['login'] === 'true') )
                $this->_login($email, $pass);
            else
                $this->_exitS('', 'Account sccuessfully created.');
        }
        else $this->_exit('Insertion error.');
    }
    public function loginUser(){
        $email = $this->_validateInput('email');
        $pass = $this->_validateInput('pass');
        
        $this->_login($email, $pass);
    }
    public function logout(){
        if(isset($_SESSION['senderId']))
            unset( $_SESSION['senderId'] );
        $this->_exitS( "Logged out Successfully.");
    }
    public function syncChat(){
        // $this->_exit($_POST);
        $senderId = $this->_isAuthorize();
        $receiverId = $this->_validateInputWithId('receiverId', true);
        $lastLoadedMsgId = $this->_validateInputWithId('lastLoadedMsgId', true, true);
        $markMsgAsSeen = $this->_validateInput('markMsgAsSeen', true);


        $lastSeenMsgId = ($receiverId !== 0) ? $this->_syncChat_lastSeenMsgId($senderId, $receiverId) : 0;        
        
        // exit(var_dump($receiverId));
        if($receiverId !== 0 && !empty($markMsgAsSeen)){
            $this->_syncChat_markMsgAsSeen($receiverId, $senderId, explode(',', $markMsgAsSeen) );
        }
        $newChat = ( $receiverId !== 0 && $lastLoadedMsgId > 0) ? $this->_syncChat_getNewReceivedChat($senderId, $receiverId, $lastLoadedMsgId) : false;
        $this->_syncChat_updateActiveOthers();
        $this->_syncChat_updateActiveSelf($senderId);
        $users = $this->_syncChat_getUsersList($senderId);


        $this->_exitS(['chat' => $newChat, 'users' => $users, 'lastSeenMsgId' => $lastSeenMsgId]);
    }
    private function _syncChat_markMsgAsSeen($senderId, $receiverId, $markMsgAsSeen){
        $stmt = $this->pdo->prepare('
            UPDATE messages
            SET seen=1
            WHERE id=? AND sender=? AND receiver=?
        ');
        foreach($markMsgAsSeen as $id){
            $stmt->execute( [intval($id), $senderId, $receiverId] );
        }
    }
    private function _syncChat_getNewReceivedChat($senderId, $receiverId, $lastLoadedMsgId){
        $stmt = $this->pdo->prepare('
            SELECT id i, message m, seen se, time t,
            CASE
                WHEN sender = :senderId THEN 1
                ELSE 0
            END AS s
            FROM messages
            WHERE id>:lastLoadedMsgId AND (
                (sender=:receiverId AND receiver=:senderId) OR
                (receiver=:receiverId AND sender=:senderId)
            )
            ORDER BY id DESC
        ');
        
        $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
        $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
        $stmt->bindParam('lastLoadedMsgId', $lastLoadedMsgId, PDO::PARAM_INT);
        
        if( $stmt->execute() ){
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        else $this->_exit('Select Query error. [_syncChat A]');
    }
    private function _syncChat_updateActiveOthers(){
        $last_active = intval(microtime(true) * 1000) - $this->lastActiveGap;
        $stmt = $this->pdo->prepare('UPDATE users SET active=? WHERE last_active<?');
        $result = $stmt->execute([0, $last_active]);
        // var_dump($result);
    }
    private function _syncChat_updateActiveSelf($senderId){
        $stmt = $this->pdo->prepare('UPDATE users SET active=?, last_active=? WHERE id=?');
        $t = intval(microtime(true) * 1000);
        $stmt->execute([1, $t, $senderId]);
    }
    private function _syncChat_getUsersList($senderId){
        $stmt = $this->pdo->prepare('
            SELECT users.id AS user_id, users.fname, users.lname, users.email, users.gender, users.image, users.active, users.last_active, connectedUsers.message_id, message, isReceived, seen, time FROM (
                SELECT D.user_id, D.message_id, messages.message,
                CASE
                    WHEN messages.sender = :senderId THEN 1
                    WHEN messages.receiver = :senderId THEN 0
                END AS isReceived,
                messages.seen, messages.time FROM (
                    SELECT user_id, MAX(message_id) AS message_id FROM (
                        SELECT CASE
                            WHEN B.sender = :senderId THEN B.receiver
                            WHEN B.receiver = :senderId THEN B.sender
                        END AS user_id, id AS message_id
                        FROM (
                            SELECT messages.id, A.sender, A.receiver, A.time FROM messages
                            RIGHT JOIN(
                                SELECT sender, receiver, MAX(time) AS time
                                FROM messages
                                WHERE receiver=:senderId OR sender=:senderId
                                GROUP BY sender, receiver
                            ) AS A
                            ON messages.sender = A.sender AND messages.receiver = A.receiver AND messages.time = A.time
                        ) B
                    ) C
                    GROUP BY user_id
                ) D
                INNER JOIN
                messages
                ON
                messages.id = D.message_id AND (messages.sender = D.user_id || messages.receiver = D.user_id)
                ORDER BY D.message_id DESC
            ) AS connectedUsers
            RIGHT JOIN 
            (SELECT * FROM users WHERE users.id != :senderId) users
            ON users.id = connectedUsers.user_id
            ORDER BY connectedUsers.user_id DESC
        ');

        $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
        if( $stmt->execute() ){
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        else $this->_exit('Select Query error. [_syncChat B]');
    }
    private function _syncChat_lastSeenMsgId($senderId, $receiverId){
        $stmt = $this->pdo->prepare('
            SELECT MAX(id) AS id
            FROM messages
            WHERE sender=:senderId AND receiver=:receiverId AND seen=1
        ');
        $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
        $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
        
        if( $stmt->execute() ){
            $data =  $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $data[0]['id'] !== NULL ? $data[0]['id'] : 0;
        }
        else $this->_exit('Select Query error. [_syncChat C]');
    }
    public function loadChat(){
        $senderId = $this->_isAuthorize();
        $receiverId = $this->_validateInputWithId('receiverId');
        $chatSet = $this->_validateInput('chatSet', true, 'recent');
        $count = $this->_validateInputWithId('count', true, true, 50);
        
        $lastLoadedMsgId = -1;

        if($count > 150) $this->_exit('[count] Maximum allowed value is 150.');
        if(!in_array($chatSet, ['recent', 'before', 'after'])){
            $this->_exit('Invalid [chatSet] value is passed');
        }
        else if($chatSet === 'before' || $chatSet === 'after'){
            $lastLoadedMsgId = $this->_validateInputWithId('lastLoadedMsgId');
        }

        /*
        $this->_exitS([
            'senderId' => $senderId,
            'receiverId' => $receiverId,
            'chatSet' => $chatSet,
            'count' => $count,
            'padding' => $padding]);
        */

        /* Abbreviation
            i => message_id;
            m => message;
            se => seen;
            t => time;
            s => sender;    // sender is self OR not
        */
        
        $select = '
            SELECT id i, message m, seen se, time t,
            CASE
                WHEN sender = :senderId THEN 1
                ELSE 0
            END AS s
            FROM messages
        ';

        if($chatSet === 'recent'){
            $stmt = $this->pdo->prepare("
                {$select}
                WHERE (sender=:senderId AND receiver=:receiverId) OR (receiver=:senderId AND sender=:receiverId)
                ORDER BY id DESC LIMIT :limit
            ");

            $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
            $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
            $stmt->bindParam('limit', $count, PDO::PARAM_INT);
            if( $stmt->execute() ) $this->_exitS( $stmt->fetchAll(PDO::FETCH_ASSOC) );
        }
        else if($chatSet === 'before'){
            $stmt = $this->pdo->prepare("
                {$select}
                WHERE id < :lastLoadedMsgId AND ( (sender=:senderId AND receiver=:receiverId) OR (receiver=:senderId AND sender=:receiverId) )
                ORDER BY id DESC
                LIMIT :limit
            ");

            $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
            $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
            $stmt->bindParam('lastLoadedMsgId', $lastLoadedMsgId, PDO::PARAM_INT);
            $stmt->bindParam('limit', $count, PDO::PARAM_INT);
            if( $stmt->execute() ) $this->_exitS( $stmt->fetchAll(PDO::FETCH_ASSOC) );
        }
        else if($chatSet === 'after'){
            $stmt = $this->pdo->prepare("
                SELECT * FROM (
                    {$select}
                    WHERE id > :lastLoadedMsgId AND ( (sender=:senderId AND receiver=:receiverId) OR (receiver=:senderId AND sender=:receiverId) )
                    ORDER BY id
                    LIMIT :limit
                ) A
                ORDER BY i DESC
            ");

            $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
            $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
            $stmt->bindParam('lastLoadedMsgId', $lastLoadedMsgId, PDO::PARAM_INT);
            $stmt->bindParam('limit', $count, PDO::PARAM_INT);
            if( $stmt->execute() ) $this->_exitS( $stmt->fetchAll(PDO::FETCH_ASSOC) );
        }

        $this->_exit('Select Query error. [loadChat]');
    }
    public function sendMessage(){
        $senderId = $this->_isAuthorize();
        $receiverId = $this->_validateInputWithId('receiverId');
        $message = $this->_validateInput('message');

        $time = intval(microtime(true) * 1000);
        
        $stmt = $this->pdo->prepare('
        INSERT INTO messages
        (sender, receiver, message, seen, time)
        VALUES (:senderId, :receiverId, :message, 0, :time)');

        $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
        $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
        $stmt->bindParam('message', $message, PDO::PARAM_STR);
        $stmt->bindParam('time', $time, PDO::PARAM_INT);
        
        if( $stmt->execute() ){
            $this->_exitS('Message sent.');
            // $stmt = $this->pdo->prepare('
            // SELECT id i, message m, seen se, time t,
            // CASE
            //     WHEN sender = ? THEN 1
            //     ELSE 0
            // END AS s
            // FROM messages
            // WHERE sender=? AND receiver=? AND time=? AND message=?
            // ORDER BY time DESC LIMIT 1');

            // if( $stmt->execute( [$sender, $sender, $receiver, $time, $message] ) ){
            //     $this->_exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
            // }
            // else{
            //     $this->_exit('Select Query error.');
            // }
        }
        else $this->_exit('Insert Query error.');
    }    
}


// To generate password.
// echo md5( md5('Admin@123', "[WelCome.to@home!]Just*Have&Fun12[.]") );