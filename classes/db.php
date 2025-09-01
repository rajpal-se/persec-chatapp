<?php
class DB
{
	private $host = "";
	private $user = "";
	private $pass = "";
	private $db = "";
	private $charset = "utf8mb4";
	private $server = "mysql";
	private $port = "3306";
	private $dns = null;
	private $pdo = null;

	function __construct()
	{
        if( !empty(isset($_ENV["MYSQL_HOST_NAME"])) ){
            $this->host = $_ENV["MYSQL_HOST_NAME"];
        }
        else{
            throw new Exception("Pass mysql host ENV variables. (MYSQL_HOST_NAME is required.)");
        }
        if( !empty(isset($_ENV["MYSQL_HOST_PORT"])) ){
			$this->port = $_ENV["MYSQL_HOST_PORT"];
        }
		if (
			!empty(isset($_ENV["MYSQL_DATABASE"])) &&
			!empty(isset($_ENV["MYSQL_USER"])) &&
			!empty(isset($_ENV["MYSQL_PASSWORD"]))
		) {
			$this->db = $_ENV["MYSQL_DATABASE"];
			$this->user = $_ENV["MYSQL_USER"];
			$this->pass = trim($_ENV["MYSQL_PASSWORD"], '"');
			$this->pass = trim($this->pass, "'");
		}
		else{
			throw new Exception("Pass ENV variables. (MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD)");
		}

		$this->dns = $this->server . ":host=" . $this->host . ";dbname=" . $this->db . ";port=" . $this->port . ";charset=" . $this->charset;
		// $this->dns = "mysql:host=localhost;dbname=chatapp;port=3306;charset=utf8mb4";
		try {
			$this->pdo = new PDO($this->dns, $this->user, $this->pass);
		} catch (\PDOException $e) {
			print_r($e);
			throw new \PDOException($e->getMessage(), (int) $e->getCode());
		}
		// print_r($this->pdo);
	}

	public function get_pdo()
	{
		return $this->pdo;
	}
}
