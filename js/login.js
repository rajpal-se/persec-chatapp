class Login{
    email = '';
    pass = '';
    constructor(){
        this.setRefs();
        this.setEvents();
    };
    setRefs = () => {
        // reference elements
        this.re = {};
        this.re.message = document.querySelector(".login #message");
        this.re.email = document.querySelector(".login #email");
        this.re.pass = document.querySelector(".login #password");
        this.re.login = document.querySelector(".login #login");
        
        this.re.email.focus();
    };
    fun = {
        login: (e) =>{
            e.preventDefault();

            if(typeof this.email !== 'string' || (typeof this.email === 'string' && this.email.length === 0)){
                this.fun.message('Email is required.');
                let t = this;
                setTimeout(function(){
                    t.fun.message();
                }, 5000);
                return
            }
            if(typeof this.pass !== 'string' || (typeof this.pass === 'string' && this.pass.length === 0)){
                this.fun.message('Password is required.');
                let t = this;
                setTimeout(function(){
                    t.fun.message();
                }, 5000);
                return
            }
            let url = "api.php";
            let data = new FormData();
            data.append("apiAction", "loginUser");
            data.append("email", this.email);
            data.append("pass", this.pass);

            PB().show('Logging in.')
            
            fetch(url, {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            .then(data => {
                PB().remove()
                this.re.email.value = ''
                this.re.pass.value = ''
                
                // console.log(data);
                if(data.response){
                    this.fun.message(data.message, true);
                    setTimeout(function(){
                        window.location.href = "./";
                    }, 1200);
                }
                else{
                    this.fun.message(data.message);
                    let t = this;
                    setTimeout(function(){
                        t.fun.message();
                    }, 5000);
                }
            })
            .catch(e => {
                PB().remove()
            });
        },
        message: (message = null, success = false) => {
            if(message === null){
                if(this.re.message.classList.contains("error")) this.re.message.classList.remove("error");
                if(this.re.message.classList.contains("success")) this.re.message.classList.remove("success");
                this.re.message.innerHTML = this.re.message.dataset.text;
            }
            else{
                if(success){
                    if(!this.re.message.classList.contains("success")) this.re.message.classList.add("success");
                    if(this.re.message.classList.contains("error")) this.re.message.classList.remove("error");
                }
                else{
                    if(this.re.message.classList.contains("success")) this.re.message.classList.remove("success");
                    if(!this.re.message.classList.contains("error")) this.re.message.classList.add("error");
                }
                this.re.message.innerHTML = message;
            }
        },
        email: (e) => {
            this.email = e.target.value;
        },
        pass: (e) => {
            this.pass = e.target.value;
        }
    }
    setEvents = () => {
        this.re.email.addEventListener("change", this.fun.email);
        this.re.pass.addEventListener("change", this.fun.pass);
        this.re.login.addEventListener("click", this.fun.login);
    }
}

const app = new Login();

