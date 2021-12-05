class App{
	sender = {
		userId: 0,
		lastLoadedChatId: 0
	}
	receiver = {
		userId: 0,
		lastLoadedChatId: 0
	}
    
	months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	constructor(){
		this.setRefs();
		this.userid = parseInt(this.re.userlist.dataset.userid);
		this.re.userlist.innerHTML = null;
		this.re.printchat.innerHTML = null;
		
		this.setEvents();
		// this.fun.syncState();
		this.fun.chat.syncChat()
		

		this.fun.app.isMobileUI( () => {
            this.re.menuCheckBox.checked = true;
			document.body.classList.add('menu-opened')
        })
	};
	setRefs = () => {
		// reference elements
		this.re = {};
		this.re.userlist = document.querySelector("#userlist");
		this.re.printchat = document.querySelector("#print-chat");
		this.re.chatCon = document.querySelector("#chat-con");
		this.re.messageInput = document.querySelector("#chat-con .message-input");
		this.re.sendBtn = document.querySelector("#chat-con span.send");
		this.re.menu = document.querySelector("#menuToggle");
		this.re.menuCheckBox = document.querySelector("#menuToggle input");
		this.re.statusCon = document.querySelector("#status-con");
		this.re.settings = document.querySelector("#status-con .setting-con");
		this.re.logoutBtn = document.querySelector("#logoutBtn");
	};
	fun = {
		utils: (() => {
			const obj = {}
			obj.fetchAPI = (apiAction = null, data = {}, successCallback, failureCallback, catchCallback = null, options = {}) => {
				let apiURL = "api.php"
				let formData = new FormData()
				formData.append('action', apiAction)
				if(typeof data === typeof {}){
					Object.keys(data).forEach(key => {
						formData.append(key, data[key])
					})
				}
				fetch(apiURL, {
					method: 'POST',
					body: data,
					...options
				})
				.then(response => response.json())
				.then(data => {
					successCallback(data)
				})
				.catch(e => {
					if(typeof catchCallback === typeof (() => {})) catchCallback(e)
				})
			}

			return obj
		}),
		
		chat: (() => {
			const obj = {}
			obj.loadChat = () => {
				
			}
			obj.syncChat = () => {
				
			}

			return obj
		}),
		dom: (() => {
			const obj = {}
			obj.createChatNode = () => {
				
			}

			return obj
		}),
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
                    if(typeof trueCallback === typeof (()=>{})) falseCallback(width)
                    return false
                }
            }
            
			obj.windowResize = () => {
                let ele = this.re.printchat.parentElement.parentElement;
                let usercon = this.re.userlist.parentElement.parentElement;
                
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
            obj.menuCheckedHandler = (e) => {
                if( e.target.checked )
                    document.body.classList.add('menu-opened')
                else
                    document.body.classList.remove('menu-opened')
            }
            obj.settingsClickedHandler = () => {
                const { settings } = this.re
                if( settings.classList.contains('opened') ){
                    settings.classList.remove('opened');
                } else{
                    settings.classList.add('opened');
                }
            }

			return obj
        }),
    }
		
	setEvents = () => {
        const {re, fun} = this.re
		// re.sendBtn.addEventListener("click", fun.chat.sendMessageHandler);
		// re.messageInput.addEventListener("keyup", fun.controlTextAreaHeight);
		re.menuCheckBox.addEventListener("change", fun.app.menuCheckedHandler);
		re.settings.addEventListener("click", fun.app.settingsClickedHandler);
		re.logoutBtn.addEventListener("click", fun.app.logoutClickHandler);
		window.addEventListener("resize", fun.app.windowResize);
	}

}

const app = new App();

