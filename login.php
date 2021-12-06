<?php 
session_start();

if(isset($_SESSION['senderId'])){
    header("location: ./");
    exit;
}

include_once "header.php";
?>

<body class="login texture">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-sm-10 col-md-8 col-lg-6 col-xl-5 form-container">
                <form class="row">
                    <div class="mb-2 col-12 text-center">
                        <h1>Login</h1>
                        <hr/>
                        <p id="message" data-text="Welcome">Welcome</p>
                    </div>
                    <div class="mb-2">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email">
                    </div>
                    <div class="mb-4">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="password">
                    </div>
                    <div class="mb-3 d-flex flex-row justify-content-center">
                        <button id="login" class="btn btn-primary">Login</button>
                    </div>
                    <hr/>
                    <div class="mb-3 d-flex flex-row justify-content-center">
                        <a href="signup.php" class="text-decoration-none">New User? Login</a>
                    </div>
                </form>
            </div>
        </div>
    </div>



    <script src="./js/bootstrap/bootstrap.bundle.min.js"></script>
    <script src="./js/pageBlocker.js"></script>
    <script src="./js/login.js"></script>
</body>
</html>