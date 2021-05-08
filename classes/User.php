<?php
session_start();

class User{
    private $ret = array('response' => 0, 'data' => '', 'message' => '');
    private $pdo = null;
    private $db = null;
    private $salt = "[WelCome.to@home!]Just*Have&Fun12[.]";
    
    function __construct(){
        $this->db = new DB();
        $this->pdo = $this->db->get_pdo();
    }

    private function exit($message = '', $response = 0, $message2 = ''){
        if($response == 2){
            $this->ret['response'] = 1;
            $this->ret['data'] = $message;
            $this->ret['message'] = $message2;
        }
        else{
            $this->ret['response'] = $response;
            $this->ret['message'] = $message;
        }
        echo json_encode($this->ret);
        exit();
    }

    private function encPass($pass){
        return md5( md5($pass, $this->salt) );
    }
    
    public function addUser(){
        
        if(!isset($_POST["fname"])) $this->exit("First name is NOT sent");
        if(empty($_POST["fname"])) $this->exit("First name is NULL");

        if(!isset($_POST["lname"])) $this->exit("Last name is NOT sent");
        if(empty($_POST["lname"])) $this->exit("Last name is NULL");

        if(!isset($_POST["email"])) $this->exit("Email is NOT sent");
        if(empty($_POST["email"])) $this->exit("Email is NULL");

        if(!isset($_POST["pass"])) $this->exit("Password is NOT sent");
        if(empty($_POST["pass"])) $this->exit("Password is NULL");

        if(!isset($_POST["gender"])) $this->exit("Gender is NOT sent");
        if(empty($_POST["gender"])) $this->exit("Gender is NULL");


        $fname = $_POST["fname"];
        $lname = $_POST["lname"];
        $email = $_POST["email"];
        $pass = $_POST["pass"];
        $gender = $_POST["gender"];
        $image = '/images/' .$gender. '.jpg';


        // First name
        preg_match_all('/[A-Za-z0-9\.]+/', $fname, $matches);
        if($matches[0][0] != $fname) $this->exit('Invalid first name.');
        
        // Last name
        preg_match_all('/[A-Za-z0-9\.]+/', $lname, $matches);
        if($matches[0][0] != $lname) $this->exit('Invalid last name.');
        
        // Email
        preg_match_all('/([a-zA-Z0-9.]+)@(([a-zA-Z0-9]+)\.)+([a-zA-Z]+)/', $email, $matches);
        if($matches[0][0] != $email) $this->exit('Invalid email.');
        
        // Password
        if(strlen($pass) < 8) $this->exit('Invalid passowrd! Short passowrd.');
        else{
            preg_match_all('/[\s \~\`\!\@\#\$\%\^\&\*\(\)\-\=\_\+\{\}\|\[\]\\\:\"\;\'\<\>\?\,\.\/]+/', $pass, $matches);
            if(!isset($matches[0][0])) $this->exit('Invalid passowrd! Use characters also.');
            else{
                preg_match_all('/[0-9]+/', $pass, $matches);
                if(!isset($matches[0][0])) $this->exit('Invalid passowrd! Use numbers also');
                else{
                    preg_match_all('/[A-Z]+/', $pass, $matches);
                    if(!isset($matches[0][0])) $this->exit('Invalid passowrd! Use upper case also.');
                    else{
                        preg_match_all('/[a-z]+/', $pass, $matches);
                        if(!isset($matches[0][0])) $this->exit('Invalid passowrd! Use lower case also.');
                    }
                }
            }
        }

        // Gender
        if($gender != "male" && $gender != "female") $this->exit('Invalid gender.'); 

        // Image
        if(isset($_FILES["image"]) && isset($_FILES["image"]["error"])){
            if($_FILES["image"]["error"] == 0 && $_FILES["image"]["size"] <= 10*1024*1024){
                if( strtolower(substr($_FILES["image"]["type"], 0, 6)) == "image/" ){
                    
                    $t = microtime();
                    $a = explode(" ", $t);
                    // echo $a[1] . "_" . substr($a[0], 2);
                    // $nn =  md5();
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

        
        $pass = $this->encPass($pass);
        
        $last_active = time();
        $active = true;

        $stmt = $this->pdo->prepare("INSERT INTO users (fname, lname, email, pass, gender, image, active, last_active) VALUES (:fname, :lname, :email, :pass, :gender, :image, :active, :last_active)");
        $stmt->bindParam('fname', $fname, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('lname', $lname, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('email', $email, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('pass', $pass, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('gender', $gender, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('image', $image, PDO::PARAM_STR_CHAR);
        $stmt->bindParam('active', $active, PDO::PARAM_BOOL);
        $stmt->bindParam('last_active', $last_active, PDO::PARAM_INT);

        $result = $stmt->execute();
        if($result) $this->exit('Account sccuessfully created.', 1);
        else $this->exit('Insertion error.');
    }

    public function loginUser(){

        if(!isset($_POST["email"])) $this->exit("Email is NOT sent");
        if(empty($_POST["email"])) $this->exit("Email is NULL");

        if(!isset($_POST["pass"])) $this->exit("Password is NOT sent");
        if(empty($_POST["pass"])) $this->exit("Password is NULL");
        
        $email = $_POST["email"];
        $pass = $this->encPass($_POST["pass"]);
        
        $stmt = $this->pdo->prepare('SELECT id FROM users WHERE email=? AND pass=?');
        $stmt->execute([$email, $pass]);
        
        if($stmt->rowCount() == 1){
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $_SESSION['user_id'] = $data[0]["id"];
            $this->exit('Successfully Login', 1);
        }
        else{
            $this->exit('Invalid email/passord.');
        }
    }

    public function syncState(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        $userid = $_POST['user_id'];

        $stmt = $this->pdo->prepare('UPDATE users SET active=?, last_active=? WHERE id=?');
        $t = time();
        $result = $stmt->execute([true, $t, $_POST['user_id']]);

        $t = $t - 2;

        $stmt = $this->pdo->prepare('SELECT id, fname, lname, image, active, last_active FROM users WHERE id != ?');
        if( $stmt->execute( [$userid] ) ){
            $this->exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
        }
        else $this->exit('Select Query error.');

        // print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
        // if($result) $this->exit('Account sccuessfully created.', 1);
        // else $this->exit('Insertion error.');
    }

    public function showChat(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        if(!isset($_POST['chat_user_id'])) $this->exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_user_id'])) $this->exit("Chat User ID is NULL");
        else if($_POST['chat_user_id'] == 0) $this->exit("Chat User ID is 0. Not Allowed");

        $user = $_POST['user_id'];
        $chatWith = $_POST['chat_user_id'];

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
            $this->exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
        }
        else $this->exit('Select Query error.');
    }

    public function messagesSeen(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");


        if(!isset($_POST["msg_ids"])) $this->exit("Message IDs are NOT sent");
        else if(empty($_POST["msg_ids"])) $this->exit("msg_ids is NULL");
        // else if($_POST["msg_ids"] == 0) $this->exit("User ID is 0. Not Allowed");
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
            $this->exit('Message seen status updated.', 1);
        }
        else{
            $this->exit('Update Query error.');
        }
    }

    public function syncChat(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        if(!isset($_POST['chat_user_id'])) $this->exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_user_id'])) $this->exit("Chat User ID is NULL");
        else if($_POST['chat_user_id'] == 0) $this->exit("Chat User ID is 0. Not Allowed");
        
        if(!isset($_POST["loaded_msg_id"])) $this->exit("Last loaded msg ID is NOT sent");
        else if(empty($_POST["loaded_msg_id"])) $this->exit("Last loaded msg ID is NULL");
        else if($_POST["loaded_msg_id"] == 0) $this->exit("Last loaded msg ID is 0. Not Allowed");

        $user = intval( $_POST['user_id'] );
        $chatWith = intval( $_POST['chat_user_id'] );
        $loadedMsgId = intval( $_POST["loaded_msg_id"] );

        $stmt = $this->pdo->prepare('
        SELECT id i, message m, seen se, time t,
        CASE
            WHEN sender = :user THEN 1
            ELSE 0
        END AS s
        FROM messages
        WHERE ( (sender=:user AND receiver=:chatWith) OR (sender=:chatWith AND receiver=:user) ) AND id>:loadedMsgId
        ORDER BY time');
        // WHERE (sender=? AND receiver=?) OR (receiver=? AND sender=?) AND id>?
        
        $stmt->bindParam('user', $user, PDO::PARAM_INT);
        $stmt->bindParam('chatWith', $chatWith, PDO::PARAM_INT);
        $stmt->bindParam('loadedMsgId', $loadedMsgId, PDO::PARAM_INT);
        
        // $stmt = $this->pdo->prepare('SELECT id, fname, lname, image, active FROM users WHERE active=1');

        if( $stmt->execute() ){
            $this->exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
        }
        else $this->exit('Select Query error.');
    }

    public function sendMessage(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        if(!isset($_POST['chat_user_id'])) $this->exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_user_id'])) $this->exit("Chat User ID is NULL");
        else if($_POST['chat_user_id'] == 0) $this->exit("Chat User ID is 0. Not Allowed");
        
        if(!isset($_POST["message"])) $this->exit("Message is NOT sent");
        else if(empty($_POST["message"])) $this->exit("Message is NULL");

        $sender = $_POST['user_id'];
        $receiver = $_POST['chat_user_id'];
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
                $this->exit( $stmt->fetchAll(PDO::FETCH_ASSOC) , 2);
            }
            else{
                $this->exit('Select Query error.');
            }
        }
        else $this->exit('Insert Query error.');
    }

    public function fixUnseenError(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        if(!isset($_POST['chat_user_id'])) $this->exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_user_id'])) $this->exit("Chat User ID is NULL");
        else if($_POST['chat_user_id'] == 0) $this->exit("Chat User ID is 0. Not Allowed");

        $sender = intval($_POST['user_id']);
        $receiver = intval($_POST['chat_user_id']);

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
            // exit();
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
                $this->exit( $ret_ids , 2);
            }
            $this->exit( $ret_ids , 2);
        }
        $this->exit( $ret_ids , 2);
    }

    public function syncUnseenMessage(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        if(!isset($_POST['chat_user_id'])) $this->exit("Chat User ID is NOT sent");
        else if(empty($_POST['chat_user_id'])) $this->exit("Chat User ID is NULL");
        else if($_POST['chat_user_id'] == 0) $this->exit("Chat User ID is 0. Not Allowed");

        if(!isset($_POST["msg_ids"])) $this->exit("Message IDs is NOT sent");
        else if(empty($_POST["msg_ids"])) $this->exit("Message IDs is NULL");
        $msg_ids = json_decode( $_POST['msg_ids'] );
        if( !is_array($msg_ids) ) $this->exit("Message ids must be an Array.");

        $sender = intval($_POST['user_id']);
        $receiver = intval($_POST['chat_user_id']);

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

        $this->exit( $ret_ids , 2);
    }

    public function logout(){
        if(!isset($_POST['user_id'])) $this->exit("User ID is NOT sent");
        else if(empty($_POST['user_id'])) $this->exit("User ID is NULL");
        else if($_POST['user_id'] == 0) $this->exit("User ID is 0. Not Allowed");
        else if($_SESSION['user_id'] != intval($_POST['user_id']) ) $this->exit("You are unauthorised user.");

        $sender = intval($_POST['user_id']);
        
        if( isset($_SESSION['user_id']) )
        unset( $_SESSION['user_id'] );
        
        $this->exit( "Logged out Successfully." , 1);
    }
}