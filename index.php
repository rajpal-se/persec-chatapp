<?php 
  session_start();
  if(!isset($_SESSION['user_id'])){
    header("location: login.php");
    exit;
  }
?>

<?php include_once "header.php"; ?>
<body class="chatapp mobile texture">
  <div class="chatapp-con">
    <div id="status-con"> <!-- class="active" -->
      <div id="menuToggle">
        <input type="checkbox" />
        <div class="sticks">
          <div></div><div></div><div></div>
        </div>
      </div>
      <div class="image-con hide"><img class="image" src="./images/male.jpg"></div>
      <div class="name-con hide"><p>Name</p></div>
      <div class="setting-con">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
        </svg>
      </div>
      <div class="setting-popup">
        <ul class="list">
          <li id="logoutBtn">Logout</li>
        </ul>
      </div>
    </div>
    <div id="user-con">
      <div class="search-box">
        <p>All users</p>
        <div class="user-search-con mb-3"  style="display:none;">
          <input type="text" class="form-control" placeholder="Search users...">
          <span id="cancel_search">&times;</span><!-- Add "show" class-->
        </div>
      </div>
      <div id="userlist-con">
        <ul id="userlist" data-userid="<?php echo $_SESSION['user_id']; ?>">
          <!--         
            <li data-userid="0" data-userlastactive="1619928647">
              <div class="con1"><img class="image" src="./images/male.jpg"/></div>
              <div class="con2">
                <p class="name">Name</p>
                <p class="message">Message</p>
              </div>
            </li>
            <li class="active" data-userid="0" data-userlastactive="0">
              <div class="con1"><img class="image" src="./images/male.jpg"/></div>
              <div class="con2">
                <p class="name">Name</p>
                <p class="message">Message</p>
              </div>
            </li>
            <li data-userid="0" data-userlastactive="0">
              <div class="con1"><img class="image" src="./images/male.jpg"/></div>
              <div class="con2">
                <p class="name">Name</p>
                <p class="message">Message</p>
              </div>
            </li>
            <li data-userid="0" data-userlastactive="1619923657">
              <div class="con1"><img class="image" src="./images/male.jpg"/></div>
              <div class="con2">
                <p class="name">Name</p>
                <p class="message">Message</p>
              </div>
            </li>
            <li data-userid="0" data-userlastactive="1619924833">
              <div class="con1"><img class="image" src="./images/male.jpg"/></div>
              <div class="con2">
                <p class="name">Name</p>
                <p class="message">Message</p>
              </div>
            </li>
          -->
        </ul>
      </div>
    </div>
    <div id="chat-con" class="selectUser">
      <div class="chat-message-con">
        <ul id="print-chat">
          <!--           
            <li class="chatnode after hide"><span class="message">Hello, How are you?<br>I want to talk to you right now.</span><span class="time">10:34 PM</span></li>
            <li class="chatnode after"><span class="message">Hello, How are you?<br>I want to talk to you right now.</span><span class="time">10:34 PM</span></li>
            <li class="chatnode me after"><span class="message">I am good. How are you</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
            <li class="chatnode me"><span class="message">me too good</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
            <li class="chatnode after"><span class="message">can we play today?</span><span class="time">10:34 PM</span></li>
            <li class="chatnode me after unseen"><span class="message">Yes, of course</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
          -->
        </ul>
      </div>
      <div class="chat-type-con">
        <div class="con1"><textarea class="message-input"></textarea></div>
        <div class="con2">
          <span class="send">
            <svg width="400" height="400" version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
              <path fill="currentColor" d="m284.06 94.412c13.257-3.6593 23.699 6.5055 19.584 19.484l-92.691 253.97c-6.8895 17.881-20.141 12.762-29.11 3.7282l-53.08-52.903c-6.5116-7.1776-8.291-11.417-0.0204-22.453l123.99-150.96-150.66 124.29c-11.581 9.7054-17.413 4.608-21.898-0.24468l-58.151-57.433c-1.7943-2.3306-8.849-16.161 4.8935-23.874z"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="blocker">
        <p>Select a user from list to chat with.</p>
      </div>
    </div>
    <!-- <div id="info-con">
      info
    </div> -->
  </div>

  <script src="./js/bootstrap/bootstrap.bundle.min.js"></script>
  <script src="./js/pageBlocker.js"></script>
  <script src="js/script.js"></script>

</body>
</html>
