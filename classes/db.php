<?php
class DB{
    private $dev = true;
    private $host = "localhost";
    private $user = "root";
    private $pass = "";
    private $db = "chatapp";
    private $charset = "utf8mb4";
    private $server = "mysql";
    private $port = "3306";
    private $dns = null;
    private $pdo = null;
    
    function __construct(){
        if($this->dev){
            /* Edit Username & Password
            // Update [$dev = true] to [$dev = false]
            $this->user = "************";
			$this->pass = "************";
			*/
        }

        $this->dns = $this->server. ":host=" . $this->host . ";dbname=" . $this->db . ";port=" . $this->port . ";charset=" . $this->charset;
        // $this->dns = "mysql:host=localhost;dbname=chatapp;port=3306;charset=utf8mb4";
        try{
            $this->pdo = new PDO($this->dns, $this->user, $this->pass); 
        }
        catch(\PDOException $e){
            throw new \PDOException($e->getMessage(), (int) $e->getCode());
        }
        // print_r($this->pdo);
    }

    public function get_pdo(){
        return $this->pdo;
    }
}