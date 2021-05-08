<?php 
session_start();
if(isset($_SESSION['user_id'])){
    header("location: ./");
    exit;
}

include_once "header.php";
?>

<body class="signup texture">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-sm-10 col-md-8 col-lg-6 col-xl-5 form-container">
                <form class="row">
                    <div class="mb-2 col-12 text-center">
                        <h1>New Registration</h1>
                        <hr/>
                        <p id="message" data-text="Welcome">Welcome</p>
                    </div>
                    <div class="mb-2 col-12 col-sm-6">
                        <label for="fname" class="form-label">First name</label>
                        <input type="text" class="form-control" id="fname">
                    </div>
                    <div class="mb-2 col-12 col-sm-6">
                        <label for="lname" class="form-label">Last name</label>
                        <input type="text" class="form-control" id="lname">
                    </div>
                    <div class="mb-2">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email">
                    </div>
                    <div class="mb-2">
                        <label for="password" class="form-label">Password</label>
                        <div class="password-con d-flex flex-row">
                            <input type="password" class="form-control" id="pass">
                            <span id="showpassword">Show</span>
                        </div>
                    </div>
                    <div class="mb-3 mt-2 gender-con">
                        <div class="label"><label>Gender:</label></div>
                        <div class="radio male">
                            <input type="radio" name="gender" class="" value="male">
                            <span>Male</span>
                        </div>
                        <div class="radio female">
                            <input type="radio" name="gender" class="" value="female">
                            <span>Female</span>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="image" class="form-label">Select Image</label>
                        <input class="form-control" type="file" id="image" accept="image/gif, image/jpeg, image/png">
                    </div>
                    <div class="mb-3 image-con">
                        <!-- <div>
                            <img src="images/male.jpg"/>
                            <button class="btn btn-danger ms-3">Delete</button>
                        </div> -->
                    </div>
                    
                    <div class="mb-3 d-flex flex-row justify-content-center">
                        <button id="submit" class="btn btn-primary">Create Account</button>
                    </div>
                    <hr/>
                    <div class="mb-3 d-flex flex-row justify-content-center">
                        <a href="login.php" class="text-decoration-none">Old user? Login</a>
                    </div>
                </form>
            </div>
        </div>
    </div>



    <script src="./js/bootstrap/bootstrap.bundle.min.js"></script>
    <script src="js/signup.js"></script>
</body>
</html>