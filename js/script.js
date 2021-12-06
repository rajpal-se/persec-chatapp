class App{
	sender = {
		id: 0,
		lastMsgId: 0
	}
	receiver = {
		id: 0,
		lastMsgId: 0
	}
	isChatSyncing = false
    usersList = {}      // {userId: userObject}
    usersListOrder = []      // {userId: userObject}
    selectedUserId = 0
    
	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	constructor(){
		// this.init()
        this.setRefs()
		this.userid = parseInt(this.re.userlist.dataset.userid)
		this.re.userlist.innerHTML = null
		this.re.printchat.innerHTML = null
		
		this.setEvents()
		
        this.fun.app.windowResize()

		this.fun.chat.syncChat()
        
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
            obj.loadChat = () => {
				
			}
			obj.syncChat = () => {
                const formData = {
                    receiverId: this.receiver.id,
                    receiverLastMsgId: this.receiver.lastMsgId
                }

                this.isChatSyncing = true
                this.fun.utils.fetchAPI('syncChat', formData, data => {
                    console.log(data)
                    
                    try{
                        this.fun.dom.displayUserList(data.users)
                    }
                    catch(e){
                        console.log(e)
                    }

                    this.isChatSyncing = false
                }, message => {
                    console.log(message)
                    this.isChatSyncing = false
                }, e => {
                    this.isChatSyncing = false
                })
			}

			return obj
		})(),
		dom: (() => {
			const obj = {}
			obj.createChatNode = () => {
				
			}
			obj.displayUserList = (users) => {
                const u = {}
                const uOrder = []
                users.forEach( (user, index) => {
                    if(!(user.id in this.usersList)){
                        u[user.id] = {
                            data: user,
                            dom: this.fun.dom.createUserListNode( user )
                        }
                    }
                    else{
                        u[user.id] = {
                            data: user,
                            dom: this.fun.dom.updateUserDomNodeRefs( user, this.usersList[user.id].dom )
                        }
                    }
                    uOrder.push(user.id)
                })
                this.usersList = u
                this.usersListOrder = uOrder

                this.re.userlist.innerHTML = ''
                
                // console.log(u)
                // console.log(this.re.userlist)
                uOrder.map(key => {
                    this.re.userlist.append(u[key].dom.root)
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
                    con1: document.createElement('div'),
                    con2: document.createElement('div'),
                    image: document.createElement('img')
                }
                
                refs.root.dataset.senderId = user.id
                refs.root.dataset.userlastactive = user.last_active
                
                refs.image.classList.add('image')
                refs.image.src = user.image

                refs.name.className = 'name'
                refs.name.innerHTML = `${user.fname} ${user.fname}`

                refs.message.className = 'message'
                refs.con1.className = 'con1'
                refs.con2.className = 'con2'
                
                refs.con1.append(refs.image)

                refs.con2.append(refs.name)
                refs.con2.append(refs.message)

                refs.root.append(refs.con1)
                refs.root.append(refs.con2)
                
                return refs
			}
			obj.updateUserDomNodeRefs = (user, domNodeRefs) => {
                domNodeRefs.root.dataset.senderId = user.id
                domNodeRefs.root.dataset.userlastactive = user.last_active
                domNodeRefs.image.src = user.image                
                return domNodeRefs
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
                    data.append("user_id", this.userid )
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

			return obj
        })(),
    }
		
	setEvents = () => {
        const {re, fun} = this
		// re.sendBtn.addEventListener("click", fun.chat.sendMessageHandler)
		// re.messageInput.addEventListener("keyup", fun.controlTextAreaHeight)
		re.menuCheckBox.addEventListener("change", fun.app.menuCheckedHandler)
		re.settings.addEventListener("click", fun.app.settingsClickedHandler)
		re.logoutBtn.addEventListener("click", fun.app.logoutClickHandler)
		window.addEventListener("resize", fun.app.windowResize)
	}

}

const app = new App()