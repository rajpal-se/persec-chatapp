class App{
	senderId = 0
	receiverId = 0
    lastLoadedMsgId = 0

    usersList = {}          // {userId: userObject}
    usersListOrder = []     // [userId, userId, ...]
    
    chatList = {}           // {chatId: chatObject}
    chatListOrder = []      // [chatId, chatId, ...]

    selectedUserIntervalId = 0

    syncChat = {
        receiverId: 0,
        isSyncing: false,
        intervalId: 0,
        intervalDuration: 800
    }

    markMsgAsSeen = []

	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	constructor(){
		// this.init()
        this.setRefs()
		// this.userid = parseInt(this.re.userlist.dataset.userid)
		this.re.userlist.innerHTML = null
		this.re.printchat.innerHTML = null
		
		this.setEvents()
		
        this.fun.app.windowResize()

        this.fun.sound.beep()

		this.fun.chat.syncChat()
        this.syncChat.intervalId = setInterval(() => {
            this.fun.chat.syncChat()
        }, this.syncChat.intervalDuration)
        
		this.fun.app.isMobileUI( () => {
            this.re.menuCheckBox.checked = true
			document.body.classList.add('menu-opened')
        })
	}
    init = () => {
        
    }
	setRefs = () => {
		// reference elements
		this.re = {}
		this.re.userlist = document.querySelector("#userlist")
		this.re.printchat = document.querySelector("#print-chat")
		this.re.chatCon = document.querySelector("#chat-con")
		this.re.messageInput = document.querySelector("#chat-con .message-input")
		this.re.sendBtn = document.querySelector("#chat-con span.send")
		this.re.menu = document.querySelector("#menuToggle")
		this.re.menuCheckBox = document.querySelector("#menuToggle input")
		this.re.statusCon = document.querySelector("#status-con")
		this.re.settings = document.querySelector("#status-con .setting-con")
		this.re.logoutBtn = document.querySelector("#logoutBtn")
	}
	fun = {
		utils: (() => {
			const obj = {}
			obj.fetchAPI = (apiAction = null, data = {}, successCallback, failureCallback, catchCallback = null, options = {}) => {
				let apiURL = "api.php"
				let formData = new FormData()
				formData.append('apiAction', apiAction)
				if(typeof data === typeof {}){
					Object.keys(data).forEach(key => {
						formData.append(key, data[key])
					})
				}
				fetch(apiURL, {
					method: 'POST',
					body: formData,
					...options
				})
				.then(response => response.json())
				.then(data => {
                    if(data.response === 1){
                        successCallback(data.data, data)
                    }
                    else{
                        failureCallback(data.message, data)
                    }
				})
				.catch(e => {
					if(typeof catchCallback === typeof (() => {})) catchCallback(e)
				})
			}

			return obj
		})(),
		chat: (() => {
			const obj = {}
            obj.loadChat = (chatSet = 'recent', count = 50, padding = 20) => {
				if(this.receiverId !== 0){
                    // console.log('load chat with', this.receiverId)
                    const formData = {
                        receiverId: this.receiverId,
                        chatSet,    // other possible values: 'before', 'after'
                        count,
                        padding
                    }
                    this.fun.utils.fetchAPI('loadChat', formData, data => {
                        // console.log(data)
                        this.lastLoadedMsgId = (data.length > 0) ? parseInt( data[0].i ) : 0
                        try{
                            this.fun.dom.displayChat( data )
                        }
                        catch(e){
                            console.log(e)
                        }
                    }, message => {
                        // ...
                    }, e => {
                        // ...
                    })
                }
                else{
                    // Nothing ...
                }
			}
			obj.syncChat = () => {
                const formData = {
                    receiverId: this.receiverId,
                    lastLoadedMsgId: this.lastLoadedMsgId
                }
                if(this.markMsgAsSeen.length > 0){
                    formData.markMsgAsSeen = this.markMsgAsSeen.join(',')
                    this.markMsgAsSeen = []
                }
                // console.log(formData)
                this.syncChat.receiverId = this.receiverId
                this.syncChat.isSyncing = true
                this.fun.utils.fetchAPI('syncChat', formData, (data, res) => {
                    // console.log(data)
                    // console.log(res)
                    
                    if(this.syncChat.receiverId === this.receiverId && this.syncChat.receiverId !== 0){
                        // Update Chat
                        const chats = data.chat
                        if(typeof chats === typeof [] && chats.length > 0){
                            this.lastLoadedMsgId = parseInt(chats[0].i)
                            // console.log(chats)
                            const dummyNodes = this.re.printchat.querySelectorAll('.dummy')
                            
                            Array.apply(null, Array(dummyNodes.length)).forEach( (v, i) => {
                                this.re.printchat.removeChild( dummyNodes[i] )
                            })

                            chats.reverse().map(chat => {
                                const node = this.fun.dom.createChatNode(chat)
                                this.re.printchat.append(node.root)
                                this.markMsgAsSeen.push( parseInt(chat.i) )
                                // console.log(chat.i)
                                // console.log(this.markMsgAsSeen)
                            })

                            const con = this.re.printchat.parentElement
                            con.scroll(0, con.scrollHeight)
                        }

                        if(data.lastSeenMsgId !== 0){
                            obj.updateSeenStatus(data.lastSeenMsgId)
                        }
                    }

                    try{
                        this.fun.dom.displayUserList(data.users)
                    }
                    catch(e){
                        console.log(e)
                    }

                    this.syncChat.isSyncing = false
                }, message => {
                    console.log(message)
                    this.syncChat.isSyncing = false
                }, e => {
                    this.syncChat.isSyncing = false
                })
			}
            obj.sendMessageHandler = () => {
                const textarea = this.re.messageInput
                const message = textarea.value
                textarea.rows = 1
                if(message.length > 0 && this.receiverId !== 0){
                    textarea.value = ''
                    const formData = {
                        message,
                        receiverId: this.receiverId
                    }
                    this.fun.utils.fetchAPI('sendMessage', formData, data => {
                        // console.log(data)
                        const chat = {
                            i: -1,
                            m: message,
                            se: 0,
                            s: 1,
                            t: (new Date).getTime()
                        }
                        const node = this.fun.dom.createChatNode(chat)
                        node.root.classList.add('dummy')
                        this.re.printchat.append(node.root)
                        
                        const con = this.re.printchat.parentElement
                        con.scroll(0, con.scrollHeight)
                        textarea.focus()
                    }, message => {
                        // console.log(message)
                    }, e => {
                        // console.log(e)
                    })
                }
            }
            obj.updateSeenStatus = (lastSeenMsgId = 0) => {
                const unseenNodes = this.re.printchat.querySelectorAll('li.unseen')
                Array.from(unseenNodes).forEach(node => {
                    const id = parseInt( node.dataset.chatid )
                    if(id <= lastSeenMsgId) node.classList.remove('unseen')
                })
                // console.log('-----------------------')
                // console.log(unseenNodes)
                // console.log(lastSeenMsgId)
            }
			return obj
		})(),
		dom: (() => {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			const obj = {}
			obj.displayChat = (chats) => {
                // console.log(chats)
				const c = {}
                const cOrder = []
                chats.forEach(chat => {
                    c[chat.i] = {
                        data: chat,
                        dom: obj.createChatNode( chat )
                    }
                    cOrder.push( chat.i )
                })

                this.chatList = c
                this.chatListOrder = cOrder

                this.re.chatCon.classList.remove('selectUser')

                this.re.printchat.innerHTML = null
                cOrder.reverse().map(id => {
                    this.re.printchat.append( c[id].dom.root )
                    this.markMsgAsSeen.push( id )
                })
                const a = this.re.chatCon.querySelector('.chat-message-con')
                a.scroll(0, a.scrollHeight)
			}
			obj.createChatNode = (chat, bindInfo = true) => {
				// console.log(chat)
                /*
                    <li class="chatnode after hide"><span class="message">Hello, How are you?<br>I want to talk to you right now.</span><span class="time">10:34 PM</span></li>
                    <li class="chatnode after"><span class="message">Hello, How are you?<br>I want to talk to you right now.</span><span class="time">10:34 PM</span></li>
                    <li class="chatnode me after"><span class="message">I am good. How are you</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
                    <li class="chatnode me"><span class="message">me too good</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
                    <li class="chatnode after"><span class="message">can we play today?</span><span class="time">10:34 PM</span></li>
                    <li class="chatnode me after unseen"><span class="message">Yes, of course</span><span class="time">10:34 PM</span><span class="seen">&check;&check;</span></li>
                
                    <li class="chatnode [me] ">
                        <span class="message">Hello, How are you?<br>I want to talk to you right now.</span>
                        <span class="time">10:34 PM</span>
                        <span class="seen">&check;&check;</span>
                    </li>
                */
                const refs = {}
                refs.root = document.createElement('li')
                refs.message = document.createElement('span')
                refs.time = document.createElement('span')
                refs.seen = document.createElement('span')

                refs.root.className = 'chatnode'
                refs.message.className = 'message'
                refs.time.className = 'time'
                refs.seen.className = 'seen'
                refs.seen.innerHTML = '&check;&check;'

                refs.root.append( refs.message )
                refs.root.append( refs.time )
                refs.root.append( refs.seen )

                if(bindInfo){
                    return obj.createChatNode_setData(chat, refs)
                }
                else{
                    return refs
                }
			}
			obj.createChatNode_setData = (chat, domNodeRefs) => {
				domNodeRefs.root.dataset.chatid = chat.i
				domNodeRefs.root.dataset.time = chat.t
				domNodeRefs.time.innerHTML = obj.createChatNode_setData_timeFormat( chat.t )
				domNodeRefs.message.innerHTML = chat.m
                if( parseInt(chat.s) ){
                    domNodeRefs.root.classList.add('me')
                    domNodeRefs.seen.classList.remove('hide')
                    if( parseInt(chat.se) ){
                        domNodeRefs.root.classList.remove('unseen')
                    }
                    else{
                        domNodeRefs.root.classList.add('unseen')
                    }
                }
                else{
                    domNodeRefs.root.classList.remove('me')
                    domNodeRefs.seen.classList.add('hide')
                }

                return domNodeRefs
			}
            obj.createChatNode_setData_timeFormat = (time) => {
                const t = parseInt( `${time}`.slice(0, 10) )
                const d = new Date(0)
                d.setSeconds( t )
                let x = d.toLocaleString()
                x = x.split(' ')
                let y = x[1].split(':')
                y.pop()
                return `${y.join(':')} ${x[2]}`
                // new_text += months[ d.getMonth() ];
                // new_text += ' ';
                // new_text += date.getDate();
                // new_text += ', ';
                // new_text += date.getFullYear();
            }
            obj.displaySelectedUser = (selectedUserId) => {
                if(selectedUserId !== 0){
                    if(this.selectedUserIntervalId !== 0){
                        clearInterval( this.selectedUserIntervalId )
                    }
                    
                    const user = this.usersList[selectedUserId].data
                    const s = this.re.statusCon
                    
                    s.querySelector('.image-con').classList.remove('hide')
                    s.querySelector('.image-con .image').src = user.image
                    
                    s.querySelector('.name-con').classList.remove('hide')
                    s.querySelector('.name-con p.name').innerHTML = user.fname + ' ' + user.lname
                    
                    
                    if( parseInt(user.active) ){
                        s.classList.add('active')
                    }
                    else{
                        s.classList.remove('active')
                    }

                    const lastSeenEle = s.querySelector('.name-con p.last-seen')
                    this.selectedUserIntervalId = setInterval(() => {
                        if( parseInt(this.usersList[selectedUserId].data.active) ){
                            s.classList.add('active')
                            lastSeenEle.classList.add('online')
                            lastSeenEle.innerHTML = 'Online'
                        }
                        else{
                            s.classList.remove('active')
                            lastSeenEle.classList.remove('online')
                            lastSeenEle.innerHTML = 'Last seen: ' + obj.displaySelectedUser_getAgoTime( parseInt(this.usersList[selectedUserId].data.last_active) )
                        }
                    }, 350)
                }
            }
            obj.displaySelectedUser_getAgoTime = (time) => {
                const t = Math.floor( ((new Date()).getTime() - time ) / 1000)
                if(t < 60){
                    return `${t} seconds ago`
                }
                else if(t < 60 * 60){
                    return `${Math.floor(t/ (60) )} minutes ago`
                }
                else if(t < 60 * 60 * 24){
                    return `${Math.floor(t/ (60 * 60) )} hours ago`
                }
                else if(t < 60 * 60 * 24 * 30){
                    return `${Math.floor(t/ (60 * 60 * 24) )} days ago`
                }
                else if(t < 60 * 60 * 24 * 30 * 12){
                    return `${Math.floor(t/ (60 * 60 * 24 * 30) )} months ago`
                }
                else{
                    return `${Math.floor(t/ (60 * 60 * 24 * 365.25) )} years ago`
                }
            }
			obj.displayUserList = (users) => {
                const u = {}
                const uOrder = []
                users.forEach( user => {
                    if(!(user.user_id in this.usersList)){
                        u[user.user_id] = {
                            data: user,
                            dom: this.fun.dom.createUserListNode( user )
                        }
                    }
                    else{
                        u[user.user_id] = {
                            data: user,
                            dom: this.fun.dom.createUserListNode_setData( user, this.usersList[user.user_id].dom )
                        }
                    }
                    uOrder.push(user.user_id)
                })
                this.usersList = u
                this.usersListOrder = uOrder

                this.re.userlist.innerHTML = ''
                
                // console.log(u)
                // console.log(this.re.userlist)
                uOrder.map(key => {
                    this.re.userlist.append(u[key].dom.root)
                    if(parseInt(u[key].data.isReceived) === 0 && parseInt(u[key].data.seen) === 0){
                        // console.log(u[key].data)
                        this.fun.sound.beep( parseInt(u[key].data.message_id) )
                    }
                })
            }
			obj.createUserListNode = (user) => {
                /*
                <li data-userid="0" data-userlastactive="1619928647">
                    <div class="con1"><img class="image" src="./images/male.jpg"/></div>
                    <div class="con2">
                        <p class="name">Name</p>
                        <p class="message">Message</p>
                    </div>
                </li>
                */
                const refs = {
                    root: document.createElement('li'),
                    name: document.createElement('p'),
                    message: document.createElement('p'),
                    lastSeen: document.createElement('p'),
                    con1: document.createElement('div'),
                    con2: document.createElement('div'),
                    image: document.createElement('img'),
                }
                
                refs.image.classList.add('image')
                refs.name.className = 'name'
                refs.message.className = 'message'
                refs.lastSeen.className = 'last-seen'

                refs.con1.className = 'con1'
                refs.con2.className = 'con2'
                
                refs.con1.append(refs.image)

                refs.con2.append(refs.name)
                refs.con2.append(refs.message)
                refs.con2.append(refs.lastSeen)

                refs.root.append(refs.con1)
                refs.root.append(refs.con2)
                
                if(typeof user === typeof {}){
                    return obj.createUserListNode_setData(user, refs)
                }
                return refs
			}
			obj.createUserListNode_setData = (user, domNodeRefs) => {
                domNodeRefs.root.dataset.receiverid = user.user_id
                domNodeRefs.root.dataset.userlastactive = user.last_active
                
                if( parseInt(user.active) ){
                    domNodeRefs.root.classList.add('active')
                    domNodeRefs.lastSeen.classList.add('online')
                    domNodeRefs.lastSeen.innerHTML = 'Online'
                }
                else{
                    domNodeRefs.root.classList.remove('active')
                    domNodeRefs.lastSeen.classList.remove('online')
                    domNodeRefs.lastSeen.innerHTML = 'Last seen: ' + this.fun.dom.displaySelectedUser_getAgoTime(user.last_active)
                }
                
                if(this.receiverId === parseInt(user.user_id)) domNodeRefs.root.classList.add('selected')
                else domNodeRefs.root.classList.remove('selected')

                domNodeRefs.image.src = user.image
                
                domNodeRefs.name.innerHTML = `${user.fname} ${user.lname}`
                domNodeRefs.message.innerHTML = user.message
                
                parseInt(user.isReceived) ? domNodeRefs.message.classList.add('isReceived') : domNodeRefs.message.classList.remove('isReceived')
                parseInt(user.seen) ? domNodeRefs.message.classList.add('seen') : domNodeRefs.message.classList.remove('seen')


                const clickEventListner = obj.displayUserList_selectUserHandler.bind(null, parseInt(user.user_id) )
                if(typeof domNodeRefs.clickEventListner !== typeof (()=>{})){
                    domNodeRefs.clickEventListner = clickEventListner
                    domNodeRefs.root.addEventListener('click', clickEventListner)
                }
                else{
                    domNodeRefs.root.removeEventListener('click', domNodeRefs.clickEventListner)
                    domNodeRefs.clickEventListner = clickEventListner
                    domNodeRefs.root.addEventListener('click', clickEventListner)
                }
                return domNodeRefs
			}
            obj.displayUserList_selectUserHandler = (receiverId) => {
                // console.log( receiverId )
                document.body.classList.remove('menu-opened')
                this.re.menuCheckBox.checked = false
                
                if(this.receiverId !== receiverId){
                    this.receiverId = receiverId
                    const li = this.re.userlist.querySelectorAll('li.selected')
                    Array.from(li).forEach(l => {
                        l.classList.remove('selected')
                    })
                    this.usersList[receiverId].dom.root.classList.add('selected')
                    obj.displaySelectedUser(receiverId)
                    this.fun.chat.loadChat()
                }
            }

			return obj
		})(),
        app: (() => {
            const obj = {}
			// obj.menuOpen = () => {
            //     document.body.classList.add('menu-opened')
            // }
            
			// obj.menuClose = () => {
            //     document.body.classList.remove('menu-opened')
            // }
            
			obj.isMobileUI = (trueCallback, falseCallback) => {
                const width = window.innerWidth
                if(window.innerWidth <= 800){
                    if(typeof trueCallback === typeof (()=>{})) trueCallback(width)
                    return true
                }
                else{
                    if(typeof falseCallback === typeof (()=>{})) falseCallback(width)
                    return false
                }
            }
			obj.windowResize = () => {
                let ele = this.re.printchat.parentElement.parentElement
                let usercon = this.re.userlist.parentElement.parentElement
                
                this.fun.app.isMobileUI( () => {
                    document.body.classList.add('mobile')
                    this.re.menu.classList.remove('hide')

                    usercon.style.top = ele.offsetTop + 'px'
                    usercon.style.left = ele.offsetLeft + 'px'
                    usercon.style.height = ele.offsetHeight + 'px'
                    usercon.style.width = ele.offsetWidth + 'px'
                }, () => {
                    document.body.classList.remove('mobile')
                    this.re.menu.classList.add('hide')
                    document.body.classList.remove('menu-opened')

                    if(this.re.menuCheckBox.checked){
                        this.re.menuCheckBox.checked = false
                    }

                    usercon.removeAttribute('style')
                })
            }
            obj.logoutClickHandler = () => {
                this.re.settings.classList.remove('opened')
                let reply = confirm("Logout! Are you sure?")
                if(reply){
                    PB().show('Logging Out.')
                    let url = "api.php"
                    let data = new FormData()
                    data.append("apiAction", "logout")
                    fetch(url, {
                        method: 'POST',
                        body: data
                    })
                    .then(response => response.json())
                    .then(data => {
                        PB().remove()
                        if(data.response){
                            window.location.reload()
                        }
                    })
                    .catch(e => {
                        PB().remove()
                    })
                }
            }
            obj.menuCheckedHandler = (e) => {
                if( e.target.checked )
                    document.body.classList.add('menu-opened')
                else
                    document.body.classList.remove('menu-opened')
            }
            obj.settingsClickedHandler = () => {
                const { settings } = this.re
                if( settings.classList.contains('opened') ){
                    settings.classList.remove('opened')
                } else{
                    settings.classList.add('opened')
                }
            }
            obj.messageInputChangeHandler = () => {
                const textarea = this.re.messageInput
                const rows = textarea.value.split('\n')
                if(rows.length <= 4){
                    textarea.setAttribute('rows', rows.length)
                }
                else{
                    textarea.setAttribute('rows', 4)
                }
            }
            obj.messageInputKeyUpHandler = (e) => {
                if(!e.shiftKey && e.which === 13) return

                const textarea = this.re.messageInput
                
                const lines = textarea.value.split('\n')
                if(lines.length <= 4){
                    textarea.rows = lines.length
                    
                    // Calculate again
                    const scrollHeight = textarea.scrollHeight
                    let rows = 1
                    if(scrollHeight === 30) rows = 1
                    else if(scrollHeight === 50) rows = 2
                    else if(scrollHeight === 70) rows = 3
                    else rows = 4
                    if(rows > lines.length){
                        textarea.rows = rows
                    }
                }
                else{
                    textarea.rows = 4
                }
            }
            obj.messageInputKeyDownHandler = (e) => {
                if(!e.shiftKey && e.which === 13){
                    // Send Message
                    e.preventDefault()
                    this.fun.chat.sendMessageHandler()
                    return true
                }
            }
			return obj
        })(),
        sound: (() => {
            const audio = new Audio('/assets/sound.mp3')
            // audio.muted = true
            const obj = {audio}
            obj.beepedForMsgIds = []


            obj.beep = (messageID) => {
                if(typeof messageID === typeof 0 && messageID !== NaN && obj.beepedForMsgIds.indexOf(messageID) < 0){
                    obj.beepedForMsgIds.push(messageID)
                    // console.log('messageID: ' + messageID)
                    audio.play()
                    .then(_ => {})
                    .catch(e => {
                        // console.log(e)
                    })
                }
                // else{
                //     console.log('here')
                // }
            }
            return obj
        })()
    }
		
	setEvents = () => {
        const {re, fun} = this
		re.sendBtn.addEventListener("click", fun.chat.sendMessageHandler)
		re.messageInput.addEventListener("keyup", fun.app.messageInputKeyUpHandler)
		re.messageInput.addEventListener("keydown", fun.app.messageInputKeyDownHandler)
		re.messageInput.addEventListener("change", fun.app.messageInputChangeHandler)
		
        re.menuCheckBox.addEventListener("change", fun.app.menuCheckedHandler)
		re.settings.addEventListener("click", fun.app.settingsClickedHandler)
		re.logoutBtn.addEventListener("click", fun.app.logoutClickHandler)
		window.addEventListener("resize", fun.app.windowResize)
	}

}

const app = new App()