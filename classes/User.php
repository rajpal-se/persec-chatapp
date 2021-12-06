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
    private function _validateInput($inputName){
        if(!isset($_POST[ $inputName ])) $this->_exit("[{$inputName}] is Required.");   
        if($_POST[ $inputName ] === '') $this->_exit("[{$inputName}] is NULL");
        return $_POST[ $inputName ];
    }
    private function _validateInputWithId($inputName, $zeroAllowed = false){
        $id = $this->_validateInput( $inputName );
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
        
        $last_active = time();
        $active = true;

        $stmt = $this->pdo->prepare("INSERT INTO users (fname, lname, email, pass, gender, image, active, last_active) VALUES (:fname, :lname, :email, :pass, :gender, :image, :active, :last_active)");
        $stmt->bindParam('fname', $fname, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('lname', $lname, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('email', $email, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('pass', $passEncrypted, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('gender', $gender, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('image', $image, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('active', $active, PDO::PARAM_BOOL);
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
        $senderId = $this->_isAuthorize();
        $receiverId = $this->_validateInputWithId('receiverId', true);
        $receiverLastMsgId = $this->_validateInputWithId('receiverLastMsgId', true);

        // exit(var_dump($receiverId));

        $newChat = ( $receiverId !== 0) ? $this->_syncChat_getNewReceivedChat($senderId, $receiverId, $receiverLastMsgId) : false;
        $this->_syncChat_updateActiveOthers();
        $this->_syncChat_updateActiveSelf($senderId);
        $users = $this->_syncChat_getUsersList($senderId);

        $this->_exitS(['chat' => $newChat, 'users' => $users]);
    }
    private function _syncChat_getNewReceivedChat($senderId, $receiverId, $receiverLastMsgId){
        $stmt = $this->pdo->prepare('
            SELECT id i, message m, seen se, time t,
            CASE
                WHEN sender = :senderId THEN 1
                ELSE 0
            END AS s
            FROM messages
            WHERE (
                (sender=:receiverId AND receiver=:senderId) ) AND
                id>:receiverLastMsgId
            ORDER BY time
        ');
        
        $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
        $stmt->bindParam('receiverId', $receiverId, PDO::PARAM_INT);
        $stmt->bindParam('receiverLastMsgId', $receiverLastMsgId, PDO::PARAM_INT);
        
        if( $stmt->execute() ){
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        else $this->_exit('Select Query error. [_syncChat A]');
    }
    private function _syncChat_updateActiveOthers(){
        $last_active = (microtime(true) * 1000) - $this->lastActiveGap;
        $stmt = $this->pdo->prepare('UPDATE users SET active=? WHERE last_active<?');
        $result = $stmt->execute([false, $last_active]);
    }
    private function _syncChat_updateActiveSelf($senderId){
        $stmt = $this->pdo->prepare('UPDATE users SET active=?, last_active=? WHERE id=?');
        $t = intval(microtime(true) * 1000);
        $stmt->execute([true, $t, $senderId]);
    }
    private function _syncChat_getUsersList($senderId){
        $stmt = $this->pdo->prepare('
            SELECT users.* FROM (
                SELECT CASE
                    WHEN A.sender = :senderId THEN A.receiver
                    WHEN A.receiver = :senderId THEN A.sender
                END AS id, MAX(time) as time
                FROM (
                    SELECT sender, receiver, MAX(time) as time
                    FROM messages
                    WHERE receiver=:senderId OR sender=:senderId
                    GROUP BY sender, receiver
                ) A
                WHERE A.sender=:senderId OR A.receiver=:senderId
                GROUP BY id
                ORDER BY time DESC
            ) AS connectedUsers
            RIGHT JOIN (SELECT id, fname, lname, gender, image, active, last_active FROM users WHERE id != :senderId) users
            ON users.id = connectedUsers.id
            ORDER BY connectedUsers.id DESC, users.last_active DESC
        ');

        $stmt->bindParam('senderId', $senderId, PDO::PARAM_INT);
        if( $stmt->execute() ){
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        else $this->_exit('Select Query error. [_syncChat B]');
    }





















    

    

    public function syncState(){
        if(!isset($_POST['userId'])) $this->_exit("User ID is NOT sent");
        else if(empty($_POST['userId'])) $this->_exit("User ID is NULL");
        else if($_POST['userId'] == 0) $this->_exit("User ID is 0. Not Allowed");
        else if($_SESSION['userId'] != intval($_POST['userId']) ) $this->_exit("You are unauthorised user.");

        $userid = $_POST['userId'];

        $stmt = $this->pdo->prepare('UPDATE users SET active=?, last_active=? WHERE id=?');
        $t = time();
        $result = $stmt->execute([true, $t, $_POST['userId']]);

        $t = $t - 2;

        $stmt = $this->pdo->prepare('SELECT id, fname, lname, image, active, last_active FROM users WHERE id != ?');
        if( $stmt->execute( [$userid] ) ){
            $this->_exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
        }
        else $this->_exit('Select Query error.');

        // print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        // if($result) $this->_exit('Account sccuessfully created.', 1);
        // else $this->_exit('Insertion error.');
    }

    public function showChat(){
        if(!isset($_POST['senderId'])) $this->_exit("Sender ID is NOT sent");
        else if(empty($_POST['userId'])) $this->_exit("Sender ID is NULL");
        else if($_POST['userId'] == 0) $this->_exit("User ID is 0. Not Allowed");
        else if($_SESSION['userId'] != intval($_POST['userId']) ) $this->_exit("You are unauthorised user.");

        if(!isset($_POST['chat_userId'])) $this->_exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_userId'])) $this->_exit("Chat User ID is NULL");
        else if($_POST['chat_userId'] == 0) $this->_exit("Chat User ID is 0. Not Allowed");

        $user = $_POST['userId'];
        $chatWith = $_POST['chat_userId'];

        $stmt = $this->pdo->prepare('
        SELECT id i, message m, seen se, time t,
        CASE
            WHEN sender = ? THEN 1
            ELSE 0
        END AS s
        FROM messages
        WHERE (sender=? AND receiver=?) OR (receiver=? AND sender=?)
        ORDER BY time DESC LIMIT 100');
        // $result = $stmt->execute();
        
        // $stmt = $this->pdo->prepare('SELECT id, fname, lname, image, active FROM users WHERE active=1');

        if( $stmt->execute( [$user, $user, $chatWith, $user, $chatWith] ) ){
            $this->_exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
        }
        else $this->_exit('Select Query error.');
    }

    public function messagesSeen(){
        if(!isset($_POST['userId'])) $this->_exit("User ID is NOT sent");
        else if(empty($_POST['userId'])) $this->_exit("User ID is NULL");
        else if($_POST['userId'] == 0) $this->_exit("User ID is 0. Not Allowed");
        else if($_SESSION['userId'] != intval($_POST['userId']) ) $this->_exit("You are unauthorised user.");


        if(!isset($_POST["msg_ids"])) $this->_exit("Message IDs are NOT sent");
        else if(empty($_POST["msg_ids"])) $this->_exit("msg_ids is NULL");
        // else if($_POST["msg_ids"] == 0) $this->_exit("User ID is 0. Not Allowed");
        $ids = json_decode($_POST["msg_ids"]);
        
        $stmt = $this->pdo->prepare('
        UPDATE messages
        SET seen=?
        WHERE id=?
        ');

        $updated = 0;
        foreach($ids as $v){
            $updated += $stmt->execute([1, intval($v)]);
        }
        
        if($updated){
            $this->_exit('Message seen status updated.', 1);
        }
        else{
            $this->_exit('Update Query error.');
        }
    }

    

    public function sendMessage(){
        if(!isset($_POST['userId'])) $this->_exit("User ID is NOT sent");
        else if(empty($_POST['userId'])) $this->_exit("User ID is NULL");
        else if($_POST['userId'] == 0) $this->_exit("User ID is 0. Not Allowed");
        else if($_SESSION['userId'] != intval($_POST['userId']) ) $this->_exit("You are unauthorised user.");

        if(!isset($_POST['chat_userId'])) $this->_exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_userId'])) $this->_exit("Chat User ID is NULL");
        else if($_POST['chat_userId'] == 0) $this->_exit("Chat User ID is 0. Not Allowed");
        
        if(!isset($_POST["message"])) $this->_exit("Message is NOT sent");
        else if(empty($_POST["message"])) $this->_exit("Message is NULL");

        $sender = $_POST['userId'];
        $receiver = $_POST['chat_userId'];
        $message = $_POST["message"];
        $time = time();
        
        $stmt = $this->pdo->prepare('
        INSERT INTO messages
        (sender, receiver, message, seen, time)
        VALUES (?, ?, ?, ?, ?)');
        
        if( $stmt->execute( [$sender, $receiver, $message, 0, $time] ) ){

            $stmt = $this->pdo->prepare('
            SELECT id i, message m, seen se, time t,
            CASE
                WHEN sender = ? THEN 1
                ELSE 0
            END AS s
            FROM messages
            WHERE sender=? AND receiver=? AND time=? AND message=?
            ORDER BY time DESC LIMIT 1');

            if( $stmt->execute( [$sender, $sender, $receiver, $time, $message] ) ){
                $this->_exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
            }
            else{
                $this->_exit('Select Query error.');
            }
        }
        else $this->_exit('Insert Query error.');
    }

    public function fixUnseenError(){
        if(!isset($_POST['userId'])) $this->_exit("User ID is NOT sent");
        else if(empty($_POST['userId'])) $this->_exit("User ID is NULL");
        else if($_POST['userId'] == 0) $this->_exit("User ID is 0. Not Allowed");
        else if($_SESSION['userId'] != intval($_POST['userId']) ) $this->_exit("You are unauthorised user.");

        if(!isset($_POST['chat_userId'])) $this->_exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_userId'])) $this->_exit("Chat User ID is NULL");
        else if($_POST['chat_userId'] == 0) $this->_exit("Chat User ID is 0. Not Allowed");

        $sender = intval($_POST['userId']);
        $receiver = intval($_POST['chat_userId']);

        $ret_ids = array();

        $stmt = $this->pdo->prepare('
            SELECT id
            FROM messages
            WHERE sender=? AND receiver=? AND seen=?
            ORDER BY time
        ');
        
        $stmt->execute( [$sender, $receiver, 0] );
        if( $stmt->rowCount() ){
            $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

                
            // print_r($ids);
            // _exit();
            $stmt = $this->pdo->prepare('
                SELECT id
                FROM messages
                WHERE sender=? AND receiver=? AND seen=?
                ORDER BY time DESC LIMIT 1;
            ');
            $stmt->execute( [$sender, $receiver, 1] );
            if( $stmt->rowCount() ){
                $latest_id = $stmt->fetchAll(PDO::FETCH_COLUMN);
                $latest_id = $latest_id[0];
                // print_r($ids);
                // print_r($latest_id);

                $stmt = $this->pdo->prepare('
                    UPDATE messages
                    SET seen=?
                    WHERE id=?
                ');
                foreach($ids as $id){
                    if($id < $latest_id){
                        if( $stmt->execute( [1, $id] ) ){
                            $ret_ids[] = $id;
                        }
                    }
                }
                $this->_exit( $ret_ids , 2);
            }
            $this->_exit( $ret_ids , 2);
        }
        $this->_exit( $ret_ids , 2);
    }

    public function syncUnseenMessage(){
        if(!isset($_POST['userId'])) $this->_exit("User ID is NOT sent");
        else if(empty($_POST['userId'])) $this->_exit("User ID is NULL");
        else if($_POST['userId'] == 0) $this->_exit("User ID is 0. Not Allowed");
        else if($_SESSION['userId'] != intval($_POST['userId']) ) $this->_exit("You are unauthorised user.");

        if(!isset($_POST['chat_userId'])) $this->_exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_userId'])) $this->_exit("Chat User ID is NULL");
        else if($_POST['chat_userId'] == 0) $this->_exit("Chat User ID is 0. Not Allowed");

        if(!isset($_POST["msg_ids"])) $this->_exit("Message IDs is NOT sent");
        else if(empty($_POST["msg_ids"])) $this->_exit("Message IDs is NULL");
        $msg_ids = json_decode( $_POST['msg_ids'] );
        if( !is_array($msg_ids) ) $this->_exit("Message ids must be an Array.");

        $sender = intval($_POST['userId']);
        $receiver = intval($_POST['chat_userId']);

        $ret_ids = array();

        $stmt = $this->pdo->prepare('
            SELECT id
            FROM messages
            WHERE sender=? AND receiver=? AND seen=? AND id=?
        ');
        // print_r($msg_ids);
        foreach($msg_ids as $msg_id){
            $stmt->execute( [$sender, $receiver, 1, $msg_id] );
            
            if($stmt->rowCount()){
                $ret_ids[] = $msg_id;
            }
        }

        $this->_exit( $ret_ids , 2);
    }

    
}


// To generate password.
// echo md5( md5('Admin@123', "[WelCome.to@home!]Just*Have&Fun12[.]") );