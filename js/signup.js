class Signup{
    constructor(){
        this.fname = '';
        this.lname = '';
        this.email = '';
        this.pass = '';
        this.gender = '';
        this.image = '';

        this.setRefs();
        this.setEvents();
    };
    setRefs = () => {
        // reference elements
        this.re = {};
        this.re.form = document.querySelector(".signup form");
        this.re.message = document.querySelector("#message");
        this.re.fname = document.querySelector("#fname");
        this.re.lname = document.querySelector("#lname");
        this.re.email = document.querySelector("#email");
        this.re.pass = document.querySelector("#pass");
        this.re.showPass = document.querySelector("#showpassword");
        this.re.gender = document.querySelectorAll('input[name="gender"]');
        this.re.image = document.querySelector("#image");
        this.re.imageClone = this.re.image.cloneNode();
        this.re.imageCon = document.querySelector(".image-con");
        this.re.submit = document.querySelector("#submit");

        this.re.fname.focus();
        // for (const key in this.re) {
        //     console.log(this.re[key]);
        // }
    };
    fun = {
        fname: e => {
            // console.log(e);
            let error = null;
            let value = e.target.value;
            let match = value.match(/[A-Za-z0-9\.]+/g);
            if(value.length < 1) this.fname = '';
            else if(match !== null && match[0] === value) this.fname = value;
            else{
                this.fname = 0;
                error = "Invalid first name";
            }
            this.fun.message(error);
        },
        lname: e => {
            let error = null;
            let value = e.target.value;
            let match = value.match(/[A-Za-z0-9\.]+/g);
            if(value.length < 1) this.lname = '';
            else if(match !== null && match[0] === value) this.lname = value;
            else{
                this.lname = 0;
                error = "Invalid last name";
            }
            this.fun.message(error);
        },
        email: e => {
            let error = null;
            let value = e.target.value;
            let match = value.match(/([a-zA-Z0-9.]+)@(([a-zA-Z0-9]+)\.)+([a-zA-Z]+)/g);
           if(value.length < 1) this.email = '';

            else if(match !== null && match[0] === value) this.email = value;
            else{
                this.email = 0;
                error = "Invalid email address";
            }
            this.fun.message(error);
        },
        pass: e => {
            let error = null;
            let value = e.target.value;
            if(value.length < 1) this.pass = '';
            else{
                if(! /[\s \~\`\!\@\#\$\%\^\&\*\(\)\-\=\_\+\{\}\|\[\]\\\:\"\;\'\<\>\?\,\.\/]/.test(value)) error = "Weak password (use characters also)";
                if(! /[0-9]/.test(value)) error = "Weak password (use numbers also).";
                if(! /[A-Z]/.test(value)) error = "Weak password (use upper also).";
                if(! /[a-z]/.test(value)) error = "Weak password (use lower also).";
                if( value.length < 8 ) error = "Weak password (use atleast characters).";
                
                if(error === null) this.pass = value;
                else this.pass = 0;
            }
            this.fun.message(error);
        },
        image: e => {
            // console.log(e.target.files[0]);
            // URL.createObjectURL(e.target.files[0])
            // console.log(e.target.files.length);
            if(e.target.files.length === 0){
                this.re.replaceInputFile();
                this.re.imageCon.innerHTML = '';

                this.image = '';
            }
            else{
                let node = document.createElement("div");
                node.appendChild(document.createElement("img"));
                node.querySelector("img").src = URL.createObjectURL(e.target.files[0]);
                let btn = document.createElement("button");
                btn.innerText = "Delete";
                btn.className = "btn btn-danger ms-3";
                let t = this;
                btn.addEventListener("click", function(e){
                    e.preventDefault();
                    t.fun.replaceInputFile();
                    t.re.imageCon.innerHTML = '';
                    t.image = '';
                });
                node.appendChild(btn);
                // console.log(node);
                this.re.imageCon.innerHTML = "";
                this.re.imageCon.appendChild(node);

                this.image = e.target.files[0];
            }
        },
        submit: e => {
            e.preventDefault();
            let error = null;

            // Gender
            if(this.re.gender[0].checked === true && this.re.gender[1].checked === false){
                this.gender = 'male';
            }
            else if(this.re.gender[0].checked === false && this.re.gender[1].checked === true){
                this.gender = 'female';
            }
            else{
                error = 'Please select gender first.';
                this.re.gender[0].focus();
            }

            // password
            if(this.pass === 0){
                this.re.pass.focus();
                error = 'Weak password.';
            };
            if(this.pass === ''){
                this.re.pass.focus();
                error = 'Password Required.';
            };

            // Email
            if(this.email === 0){
                this.re.email.focus();
                error = 'Invalid email.';
            };
            if(this.email === ''){
                this.re.email.focus();
                error = 'Email Required.';
            };

            // Last name
            if(this.lname === 0){
                this.re.lname.focus();
                error = 'Invalid last name.';
            };
            if(this.lname === ''){
                this.re.lname.focus();
                error = 'Last name Required.';
            };

            // First name
            if(this.fname === 0){
                this.re.fname.focus();
                error = 'Invalid first name.';
            };
            if(this.fname === ''){
                this.re.fname.focus();
                error = 'First name Required.';
            };

            // Send
            this.fun.message(error);
            if(error !== null) return;

            PB().show('Creating new account.')

            let url = "api.php";
            let data = new FormData();
            data.append("apiAction", "addUser");
            data.append("fname", this.fname);
            data.append("lname", this.lname);
            data.append("email", this.email);
            data.append("pass", this.pass);
            data.append("gender", this.gender);
            data.append("image", this.image);

            fetch(url, {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            .then(data => {
                PB().remove()
                if(data.response){
                    this.fun.message(data.message, true);
                    this.re.form.reset();
                    this.re.imageCon.innerHTML = '';
                    setTimeout(function(){
                        window.location.href = "./login.php";
                    }, 2000);
                }
                else{
                    this.fun.message(data.message);
                }
            })
            .catch(e => {
                PB().remove()
            })
        },
        showPass: e => {
            if(this.re.pass.type === "password"){
                this.re.showPass.classList.add("show");
                this.re.pass.type = "text";
                this.innerText = "Hide";
            }
            else{
                this.re.pass.type = "password";
                this.re.showPass.classList.remove("show");
                this.innerText = "Show";
            }
            this.re.pass.focus();
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
        replaceInputFile: () => {
            let node = this.re.imageClone.cloneNode();
            this.re.image.parentNode.replaceChild(node, this.re.image);
            this.re.image = node;
            this.re.image.addEventListener("change", this.fun.image);
        }
    }
    setEvents = () => {
        this.re.fname.addEventListener("keyup", this.fun.fname);
        this.re.fname.addEventListener("focus", this.fun.fname);
        
        this.re.lname.addEventListener("keyup", this.fun.lname);
        // this.re.lname.addEventListener("focus", this.fun.lname);
        
        this.re.email.addEventListener("keyup", this.fun.email);
        // this.re.email.addEventListener("focus", this.fun.email);
        
        this.re.pass.addEventListener("keyup", this.fun.pass);
        // this.re.pass.addEventListener("focus", this.fun.pass);

        this.re.image.addEventListener("change", this.fun.image);
        
        this.re.showPass.addEventListener("click", this.fun.showPass);
        
        this.re.submit.addEventListener("click", this.fun.submit);
        
        this.re.fname.addEventListener("focusout", () => { this.fun.message(null); });
        this.re.lname.addEventListener("focusout", () => { this.fun.message(null); });
        this.re.email.addEventListener("focusout", () => { this.fun.message(null); });
        this.re.pass.addEventListener("focusout", () => { this.fun.message(null); });
    }

}

const app = new Signup();

