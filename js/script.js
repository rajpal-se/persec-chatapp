class App{
    userlistNodeHandler = [];
    chatNodeHandler = [];
    dateNodeHandler = [];
    unreadNodeHandler = {node: null, ref: {}};

    unseenMessages = [];
    unseenMessageInterval = null;

    syncStateInterval = null;
    syncChatInterval = null;

    lastLoadedMsgId = 0;
    chatUserID = 0;
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    // syncCurrentUserChatHandler = null;
    userid = 0;

    mobileUI = false;
    mobileUIstyle = {height: 0, width: 0, top: 0, left: 0};

    constructor(){
        this.setRefs();
        this.userid = parseInt(this.re.userlist.dataset.userid);
        this.re.userlist.innerHTML = '';
        this.re.printchat.innerHTML = '';
        
        this.setEvents();
        this.fun.syncState();
        

        this.fun.mobileUI();

        if(this.mobileUI){
            this.re.menuCheckBox.checked = true;
            document.body.classList.add('menu-opened');
        }
    };
    setRefs = () => {
        // reference elements
        this.re = {};
        this.re.userlist = document.querySelector("#userlist");
        this.re.printchat = document.querySelector("#print-chat");
        this.re.messageInput = document.querySelector("#chat-con .message-input");
        this.re.sendBtn = document.querySelector("#chat-con span.send");
        this.re.menu = document.querySelector("#menuToggle");
        this.re.menuCheckBox = document.querySelector("#menuToggle input");
        this.re.statusCon = document.querySelector("#status-con");
        this.re.settings = document.querySelector("#status-con .setting-con");
        this.re.logoutBtn = document.querySelector("#logoutBtn");
    };
    fun = {
        syncState: () => {
            let url = "api.php";
            let data = new FormData();
            data.append("apiAction", "syncState");
            data.append("user_id", this.userid );
            // console.log(this.userid);
            // data.append("current_chat_with", this.currentChatWith );
            this.syncStateInterval = setInterval(() => {
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                .then(data => {
                    // console.log(data.data);
                    if(data.response){
                        let total = data.data.length;
                        while(this.userlistNodeHandler.length < total){
                            // let node = ;
                            // console.log("Yes");
                            // console.log(this.re.userlist);
                            // console.log(data.data.length);
                            let index = this.userlistNodeHandler.push( this.fun.createUserListNode() );
                            // console.log(this.userlistNodeHandler);
                            this.re.userlist.appendChild( this.userlistNodeHandler[index-1].node );
                        }
                        // console.log(this.userlistNodeHandler[0].ref);
                        let users = data.data;
                        // console.log(users);
                        users.forEach( (user, i) => {
                            // console.log(user);
                            this.userlistNodeHandler[i].node.dataset.userid = user.id;
                            this.userlistNodeHandler[i].node.dataset.userlastactive = user.last_active;
                            this.userlistNodeHandler[i].ref.name.innerText = user.fname + " " + user.lname;
                            this.userlistNodeHandler[i].ref.image.src = '.' + user.image;
                            
                            

                            this.fun.isUserActive(user.last_active, () => {
                                    if(!this.userlistNodeHandler[i].node.classList.contains("active"))
                                        this.userlistNodeHandler[i].node.classList.add("active");
                                }, () => {
                                    if(this.userlistNodeHandler[i].node.classList.contains("active"))
                                        this.userlistNodeHandler[i].node.classList.remove("active");
                                }
                            );
                            
                            if(this.chatUserID !== 0 && user.id == this.chatUserID){
                                // console.log("Here: "+ user.id);
                                this.fun.isUserActive(user.last_active, () => {
                                        if(!this.re.statusCon.classList.contains("active")){
                                            this.re.statusCon.classList.add("active");
                                        }
                                    }, () => {
                                        if(this.re.statusCon.classList.contains("active")){
                                            this.re.statusCon.classList.remove("active");
                                        }
                                    }
                                );
                            }
                        });
                        // let selected = this.re.userlist.querySelector('li[data-userid="'+ this.chatUserID +'"]');
                        // if(selected !== null){
                        //     selected.classList.add("selected");
                        // }

                    }
                });
            }, 1000);

            
            // console.log(node);
        },
        syncChat: () => {
            if(this.lastLoadedMsgId !== 0){
                // this.lastLoadedMsgId--;
                
                // console.log(this.lastLoadedMsgId);

                let url = "api.php";
                let data = new FormData();
                data.append("apiAction", "syncChat");
                data.append("user_id", this.userid );
                data.append("chat_user_id", this.chatUserID );
                data.append("loaded_msg_id", this.lastLoadedMsgId );
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                // .then(response => response.text())
                .then(data => {
                    // console.log(data);
                    // return;
                    let messages = data.data;
                    
                    let msg_ids = [];
                    messages.forEach( (msg, index) => {
                        // console.log(msg);
                        if( parseInt(msg.s) === 0 ){
                            this.fun.appendChatMessage(msg);
                            if( parseInt(msg.se) === 0 ){
                                msg_ids.push(msg.i);
                            }
                        }
                    });

                    // console.log(messages);
                    
                    if(messages.length !== 0){
                        this.lastLoadedMsgId = parseInt( messages[messages.length - 1].i );
                        
                        /* 
                        Scroll Down
                        */
                        this.fun.scrollDown(this.re.printchat.parentElement);  
                    }

                    // console.log(msg_ids);
                    if(msg_ids.length){
                        let url = "api.php";
                        let data = new FormData();
                        data.append("apiAction", "messagesSeen");
                        data.append("user_id", this.userid );
                        data.append("msg_ids", JSON.stringify(msg_ids));
                        fetch(url, {
                            method: 'POST',
                            body: data
                        })
                        .then(response => response.json())
                        .then(data => {
                            // console.log(data);
                        });
                    }
                });
            }
        },
        showChat: (e) => {
            let i=0;
            // console.log(e.path);
            while(e.path[i].tagName != 'LI'){
                // console.log(e.path[i]);
                i++;
            }
            // console.log(i);
            if(i > 1000) return;
            let node = e.path[i];

            // console.log('old: '+this.chatUserID);
            this.chatUserID = node.dataset.userid;

            this.fun.selectChatUser();
        },
        // syncCurrentUserChatHandler: () => {
        //     console.log("Yes: "+this.chatUserID);
        // },
        syncUnseenMessage: () => {
            let eles = this.re.printchat.querySelectorAll('li.unseen.chatnode');
            let length = eles.length;
            this.unseenMessages = [];
            for(let i=0; i<length; i++){
                this.unseenMessages.push( parseInt( eles[i].dataset.msgid ) );
            }
            
            // console.log(this.unseenMessages);

            if(this.unseenMessages.length !== 0){
                let url = "api.php";
                let data = new FormData();
                data.append("apiAction", "syncUnseenMessage");
                data.append("user_id", this.userid );
                data.append("chat_user_id", this.chatUserID );
                data.append("msg_ids", JSON.stringify(this.unseenMessages) );
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                // .then(response => response.text())
                .then(data => {
                    // console.log(data);
                    if(data.response){
                        let ids = data.data;
                        // console.log(ids);
                        ids.forEach( id => {
                            let node = this.re.printchat.querySelector('li[data-msgid="'+ id +'"]');
                            node.classList.remove('unseen');
                            delete this.unseenMessages[ this.unseenMessages.indexOf(id) ];
                        });
                    }
                });

            }
            // console.log(this.unseenMessages);
        },
        createUserListNode: () => {
            /* 
                <li data-userid="0" data-userlastactive="0">
                    <div class="con1"><img class="image" src="./images/male.jpg"/></div>
                    <div class="con2">
                        <p class="name">Name</p>
                        <p class="message">Message</p>
                    </div>
                </li>
                <li class="active" data-userid="0" data-userlastactive="1619928647">
                    <div class="con1"><img class="image" src="./images/male.jpg"/></div>
                    <div class="con2">
                        <p class="name">Name</p>
                        <p class="message">Message</p>
                    </div>
                </li>
            */
            let ref = {};
            
            ref.node = document.createElement('li');
            
            let div = document.createElement('div');
            div.className = 'con1';

            ref.image = document.createElement('img');
            ref.image.className = 'image';
            div.appendChild(ref.image);
            ref.node.appendChild(div);

            div = document.createElement('div');
            div.className = 'con2';

            ref.name = document.createElement('p');
            ref.name.className = 'name';
            ref.message = document.createElement('p');
            ref.message.className = 'message';

            div.appendChild(ref.name);
            div.appendChild(ref.message);

            ref.node.appendChild(div);
            ref.node.addEventListener('click', this.fun.showChat);
                       
            // console.log(ref.node);

            return {
                node: ref.node,
                ref: ref
            };
        },
        createChatNode: () => {
            /* 
                <li class="chatnode after hide"><span class="message">Hello, How are you?<br>I want to talk to you right now.</span><span class="time">10:34 PM</span></li>
                <li class="chatnode me after"><span class="message">I am good. How are you</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
                <li class="chatnode me"><span class="message">me too good</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
                <li class="chatnode after"><span class="message">can we play today?</span><span class="time">10:34 PM</span></li>
                <li class="chatnode me after unseen"><span class="message">Yes, of course</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
            */
            let ref = {};
            
            ref.node = document.createElement('li');
            ref.node.className = 'chatnode after hide';
            ref.node.dataset.msgid = '';
            
            ref.message = document.createElement('span');
            ref.message.className = "message";
            ref.node.appendChild(ref.message);
            
            ref.time = document.createElement('span');
            ref.time.className = "time";
            ref.node.appendChild(ref.time);

            ref.seen = document.createElement('span');
            ref.seen.className = "seen";
            ref.seen.innerHTML = "&check;&check;";
            ref.node.appendChild(ref.seen);
         
            // console.log(ref.node);

            return {
                node: ref.node,
                ref: ref
            };
        },
        createDateNode: () => {
            /* 
                <li class="date"><span class="date-text">April 20, 2021</span></li>
                <li class="date hide"><span class="date-text">April 20, 2021</span></li>
            */
            let ref = {};
            
            ref.node = document.createElement('li');
            ref.node.className = 'date';
            
            ref.dateText = document.createElement('span');
            ref.dateText.className = "date-text";
            ref.node.appendChild(ref.dateText);

            return {
                node: ref.node,
                ref: ref
            };
        },
        getDateNode: (text = '') => {
            let node = this.fun.createDateNode();
            // console.log(text);
            if(typeof(text) === 'number'){
                let new_text = '';
                let date = new Date(0);
                date.setSeconds(text);
                // console.log(date.toString());
                new_text += this.months[ date.getMonth() ];
                new_text += ' ';
                new_text += date.getDate();
                new_text += ', ';
                new_text += date.getFullYear();

                node.ref.dateText.innerText = new_text;
            }
            else{
                node.ref.dateText.innerText = text;
            }
            
            node.node.classList.remove('hide');
            this.dateNodeHandler.push(node);
            return node;
        },
        getFirstDate: (time_seconds = null) => {
            if(time_seconds !== null){
                let date = new Date(0);
                date.setSeconds(time_seconds);
                // console.log("Get Time 1: "+date.toString());
                // date.setSeconds(60);
                // console.log("Get Time 2: "+date.toString());
                // date.setSeconds(120);
                // console.log("Get Time 3: "+date.toString());
                // console.log("Get Time 1: "+date.toString());
                // console.log(date.getTime());
                date.setSeconds(0);
                date.setMinutes(0);
                date.setHours(0);
                // console.log("Get Time 2: "+date.toString());
                // console.log(date.getTime());
                return date.getTime() / 1000;
            }
        },
        scrollDown(ele, time = 500){
            let x = ele.scrollTo(0, ele.scrollHeight);
            let t = 0;
            // console.log("called");
            let interval = setInterval( () => {
                // console.log(t);
                ele.scrollTo(0, ele.scrollHeight);
                t += 100;
                if(t > time){
                    clearInterval(interval);
                    // console.log("if");
                }
                else{
                    // console.log("else");
                }
            }, 100);
        },
        sendMessage: (e) => {
            e.preventDefault()
            let message = this.re.messageInput.value.trim();
            this.re.messageInput.value = '';
            this.re.messageInput.focus();
            if(message !== ''){
                let url = "api.php";
                let data = new FormData();
                data.append("apiAction", "sendMessage");
                data.append("user_id", this.userid );
                data.append("chat_user_id", this.chatUserID );
                data.append("message", message );
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                .then(data => {
                    // console.log(data);
                    if(data.response){
                        data = data.data;
                        this.fun.appendChatMessage( data[0] );
                    }
                });
            }
        },
        controlTextAreaHeight: (e) => {
            // console.log(e.target.value);
            if(!e.shiftKey && e.keyCode === 13){
                e.preventDefault();
                this.fun.sendMessage();
                // console.log("Y");
                app.re.messageInput.value = '';
            }
            else{
                let enter = app.re.messageInput.value.match(/\n/g);
                // console.log(enter);
                if(enter === null){
                    this.re.messageInput.style.height = '';
                }
                else if(enter < 5){
                    this.re.messageInput.style.height = ( 32 + (enter.length * 20) ) + 'px';
                }
                else{
                    this.re.messageInput.style.height = ( 32 + (4 * 20) ) + 'px';
                }
            }            
        },
        mobileUI: () => {
            let ele = this.re.printchat.parentElement.parentElement;
            let usercon = this.re.userlist.parentElement.parentElement;
            this.mobileUIstyle.height = ele.offsetHeight;
            this.mobileUIstyle.width = ele.offsetWidth;
            this.mobileUIstyle.top = ele.offsetTop;
            this.mobileUIstyle.left = ele.offsetLeft;
            
            if(window.innerWidth <= 800){
                this.mobileUI = true;
                document.body.classList.add('mobile');
                this.re.menu.classList.remove('hide');
            }
            else{
                this.mobileUI = false;
                document.body.classList.remove('mobile');
                document.body.classList.remove('menu-opened');
                if(this.re.menuCheckBox.checked){
                    this.re.menuCheckBox.checked = false;
                }
                this.re.menu.classList.add('hide');
            }
            // console.log(this.mobileUIstyle);
            if( document.body.classList.contains("mobile") ){
                usercon.style.top = this.mobileUIstyle.top + 'px';
                usercon.style.left = this.mobileUIstyle.left + 'px';
                usercon.style.height = this.mobileUIstyle.height + 'px';
                usercon.style.width = this.mobileUIstyle.width + 'px';
            }
            else{
                usercon.style = '';
            }
            // console.dir(ele);
            // console.log(window.innerWidth);
        },
        menuChecked: (e) => {
            if( e.target.checked ){
                document.body.classList.add('menu-opened');
            }
            else{
                document.body.classList.remove('menu-opened');
            }
        },
        selectChatUser: () => {
            if(this.chatUserID !== 0){

                this.fun.resetPrintChat();
                
                let old_user = this.re.userlist.querySelector('li.selected');
                if(old_user !== null ){
                    old_user.classList.remove("selected");
                }
                let new_user = this.re.userlist.querySelector('li[data-userid="'+this.chatUserID+'"]');
                new_user.classList.add('selected');

                let img_con = this.re.statusCon.querySelector('.image-con');
                img_con.classList.remove('hide');
                this.fun.isUserActive(new_user.dataset.userlastactive, () => {
                    this.re.statusCon.classList.add('active');
                }, () => {
                    this.re.statusCon.classList.remove('active');
                });
                let name_con = this.re.statusCon.querySelector('.name-con');
                name_con.classList.remove('hide');
                
                img_con.querySelector('img').src = new_user.querySelector('img').src;
                name_con.querySelector('p').innerText = new_user.querySelector('p.name').innerText;
                
                this.lastLoadedMsgId = 0;
                let unseen = [];

                let url = "api.php";
                let data = new FormData();
                data.append("apiAction", "showChat");
                data.append("user_id", this.userid );
                data.append("chat_user_id", this.chatUserID );
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                .then(data => {
                    this.re.menuCheckBox.checked = false;
                    document.body.classList.remove('menu-opened');
                    // console.log(data);
                    let messages = data.data;
                    // messages.reverse();
                    let before = null;
                    if(messages[0] !== undefined){
                        before = this.fun.appendChatMessage( messages[0] );
                    }
                    // console.log(messages[0]);
                    messages.forEach( (msg, index) => {
                        // console.log(msg);
                        if(index === 0) return;
                        before = this.fun.appendChatMessage(msg, before);
                        // console.log(msg);
                        if( parseInt(msg.se) === 0 && parseInt(msg.s) === 0 ) unseen.push( parseInt(msg.i) );
                    });

                    /* 
                    Scroll Down
                    */
                    this.fun.scrollDown(this.re.printchat.parentElement);

                    /* 
                    Sync Messages
                    */
                    if(messages[0] !== undefined) this.lastLoadedMsgId = messages[0].i;

                    // console.log(messages);
                    
                    if(this.syncChatInterval !== null){
                        clearInterval(this.syncChatInterval);
                        this.syncChatInterval = null;
                    }

                    this.syncChatInterval = setInterval(this.fun.syncChat, 1000);


                    /*
                    Sync Unseen Messages
                    */
                    if( this.unseenMessageInterval === null){
                        this.unseenMessageInterval = setInterval( () => {
                            this.fun.syncUnseenMessage();
                        }, 500);
                    }
                    // this.fun.setUnreadStrip( messages );
                    this.fun.setDateStrip( messages );
                    
                });

                /* 
                Scroll Down
                */
                this.fun.scrollDown(this.re.printchat.parentElement);
                // console.log(unseen);
                
                /* 
                Update unseen messages
                */
                if(unseen.length){
                    let url = "api.php";
                    let data = new FormData();
                    data.append("apiAction", "messagesSeen");
                    data.append("user_id", this.userid );
                    data.append("msg_ids", JSON.stringify(unseen));
                    fetch(url, {
                        method: 'POST',
                        body: data
                    })
                    .then(response => response.json())
                    .then(data => {
                        // console.log(data);
                    });
                }
                
                /* 
                Fixing Unseen error
                */
                {
                    let url = "api.php";
                    let data = new FormData();
                    data.append("apiAction", "fixUnseenError");
                    data.append("user_id", this.userid );
                    data.append("chat_user_id", this.chatUserID );
                    fetch(url, {
                        method: 'POST',
                        body: data
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.response){
                            let ids = data.data;
                            ids.forEach( id => {
                                let ele = this.re.printchat.querySelector('li[data-msgid="'+id+'"]');
                                if(ele !== null){
                                    ele.classList.remove('unseen');
                                }
                            } );
                        }
                    });
                }
            }
        },
        resetPrintChat: () => {
            // Remove Unread message strip
            if(this.re.printchat.querySelector("li.unread") !== null){
                this.re.printchat.removeChild(this.unreadNodeHandler.node);
            }

            // Remove Date strips
            this.dateNodeHandler = [];
            let date_li = this.re.printchat.querySelectorAll('li.date');
            for(let x=0; x<date_li.length; x++){
                this.re.printchat.removeChild(date_li[x]);
            }

            // reset sync unseen messages
            this.unseenMessages = [];
            if(this.unseenMessageInterval !== null){
                clearInterval(this.unseenMessageInterval);
                this.unseenMessageInterval = null;
            }
        },
        setDateStrip: messages => {
            /* 
            Set Date Strip
            */
            
            let date_today = new Date();
            date_today = this.fun.getFirstDate( date_today.getTime() / 1000 );
            let date_yesterday = date_today - (24 * 60 * 60);
            
            let ref_node = null;
            if(messages.length > 0){
                let msg_length = messages.length;
                let i = 0;
                let curr_date = this.fun.getFirstDate(messages[i].t);
                
                while(i < msg_length){
                    if(curr_date < parseInt(messages[i].t)){
                        ref_node = this.re.printchat.querySelector('li[data-msgid="'+messages[i].i+'"]');
                        // console.log("here");
                    }
                    else{
                        if(ref_node !== null){
                            let arg = parseInt(messages[i-1].t);
                            if(curr_date === date_today) arg = "Today";
                            else if(curr_date === date_yesterday) arg = "Yesterday";
                            
                            let node = this.fun.getDateNode( arg ).node;
                            // console.log(node);
                            this.re.printchat.insertBefore( node, ref_node);
                            ref_node = this.re.printchat.querySelector('li[data-msgid="'+messages[i].i+'"]');
                            // console.log("here2");
                        }
                        curr_date = this.fun.getFirstDate(messages[i].t);
                        // console.log(curr_date);
                        // console.log("-- -- -- ");
                    }
                    
                    // console.log("loop");
                    i++;
                }
                i--
                if(ref_node !== null){                        
                    let node = this.fun.getDateNode( parseInt(messages[i].t) ).node;
                    this.re.printchat.insertBefore( node, ref_node);
                    console.log(node);
                    ref_node = null;
                }
            }

            // console.log(theBigDay.toDateString());
            // console.log(date_today);
            // console.log(date_yesterday);
            // console.log('----------');

        },
        setUnreadStrip: messages => {
            // Set unread Strip
            
            /* 
                <li class="unread">
                    <p class="unread-text">Unread&nbsp;<span class="unread-num">10 messages</span></p>
                </li>
            */
            this.unreadNodeHandler.node = document.createElement('li');
            this.unreadNodeHandler.node.className = 'unread';
            this.unreadNodeHandler.ref.node = this.unreadNodeHandler.node;
            let p = document.createElement('p');
            p.className = 'unread-text';
            p.innerText = "Unread ";
            this.unreadNodeHandler.ref.num = document.createElement('span');
            this.unreadNodeHandler.ref.num.className = 'unread-num';
            p.appendChild(this.unreadNodeHandler.ref.num);
            this.unreadNodeHandler.node.appendChild(p);
            
            // i = 0;
            // msg_length = messages.length;
            // while(messages[i] !== undefined && parseInt(messages[i].s) == 0 && i < msg_length) i++;
            // console.log(i);
            // console.log(msg_length);
            // console.log( parseInt(messages[i].s) );


            let i = 0;
            let msg_length = messages.length;
            while(messages[i] !== undefined && (parseInt(messages[i].s) === 0) && (parseInt(messages[i].se) === 0) && i < msg_length){
                i++;
            }
            // console.log(i);
            // console.log(msg_length);

            // console.log(this.chatNodeHandler.length);
            
            if(i){
                // let ele = this.chatNodeHandler[ this.chatNodeHandler.length - i];
                // console.log(ele);
                
                let e = this.chatNodeHandler[ this.chatNodeHandler.length - i].node;
                this.re.printchat.insertBefore(this.unreadNodeHandler.node, e);
                
                let msg_ids = [];
                for(let a=0; a<i; a++){
                    if(messages[a].se == '0') msg_ids.push( messages[a].i );
                }
                console.log(msg_ids);
                let url = "api.php";
                let data = new FormData();
                data.append("apiAction", "messagesSeen");
                data.append("user_id", this.userid );
                data.append("msg_ids", JSON.stringify(msg_ids));
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                .then(data => {
                    // console.log(data);
                });
            }
            else{
                // console.log("Nothing to Unread");
            }

            // this.re.printchat.appendChild(this.unreadNodeHandler.node);
            
        },
        isUserActive: (last_active, activeCallback = () => { }, inActiveCallback = () => { }) => {
            last_active = parseInt(last_active);
            let current_time = new Date().getTime();
            current_time /= 1000;
            current_time -= 2;
            // console.log(last_active , current_time);
            // console.log( last_active > current_time );
            if(last_active > current_time){
                activeCallback.call(this);
            } else{
                inActiveCallback.call(this);
            }

        },
        appendChatMessage: (message, before = null) => {
            // console.log(this.re);
            // console.log(message);
            let node = this.re.printchat.querySelector('li.chatnode.hide');
            if(node === null){
                let length = this.chatNodeHandler.push( this.fun.createChatNode() );
                node = this.chatNodeHandler[length - 1].node;
            }
            
            node.dataset.msgid = message.i;
            node.querySelector('span.message').innerText = message.m;
            node.classList.remove("hide");
            
            if( parseInt(message.s) === 1){
                node.classList.add('me');
                node.querySelector('span.seen').classList.remove('hide');
                if( parseInt(message.se) === 1){
                    node.classList.remove('unseen');
                } else{
                    node.classList.add('unseen');
                }
            }
            else{
                node.classList.remove('me');
                node.querySelector('span.seen').classList.add('hide');
            }

            if(before !== null){
                this.re.printchat.insertBefore( node, before);
            }
            else{
                this.re.printchat.appendChild( node );
            }

            this.fun.scrollDown(this.re.printchat.parentElement);

            return node;
        },
        settingsClicked: () => {
            if( this.re.settings.classList.contains('opened') ){
                this.re.settings.classList.remove('opened');
            } else{
                this.re.settings.classList.add('opened');
            }
        },
        logoutClicked: () => {
            this.re.settings.classList.remove('opened');
            let reply = confirm("Logout! Are you sure?");
            if(reply){
                PB().show('Logging Out.')
                let url = "api.php";
                let data = new FormData();
                data.append("apiAction", "logout");
                data.append("user_id", this.userid );
                fetch(url, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.json())
                .then(data => {
                    PB().remove()
                    if(data.response){
                        window.location.reload();
                    }
                })
                .catch(e => {
                    PB().remove()
                })
            }
        }
    }

    setEvents = () => {
        this.re.sendBtn.addEventListener("click", this.fun.sendMessage);
        this.re.messageInput.addEventListener("keyup", this.fun.controlTextAreaHeight);
        window.addEventListener("resize", this.fun.mobileUI);
        this.re.menuCheckBox.addEventListener("change", this.fun.menuChecked);
        this.re.settings.addEventListener("click", this.fun.settingsClicked);
        this.re.logoutBtn.addEventListener("click", this.fun.logoutClicked);
    }

}

const app = new App();

