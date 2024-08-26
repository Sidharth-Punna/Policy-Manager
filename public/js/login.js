
const loginForm = document.getElementById('login')
const signupForm = document.getElementById('signUp')


signupForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const formData = new FormData(signupForm);
    const userData = Object.fromEntries(formData.entries());
    if(userData.role==='on'){
        userData.role='admin';
    }
    else{
        userData.role='user';
    }
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    // if(!passwordRegex.test(password)){
    if(userData.password != userData.confirm_password){
        alert(`Password didn't match`);
        return;
    }
    fetch('/user/register',{
        method:'POST',
        headers: { "Content-Type": "application/json" },
        body :JSON.stringify(userData)
    })
    .then(response =>{
        console.log(response);
        return response.json()})
    .then(data =>{
        if(data.success){
            console.log(data.userData);
            console.log(data.results);
            alert('Account created redirecting to login page')
            signupForm.reset();
            
            window.location.href = `http://localhost:8080/`;

            
        }
        else{
            alert(data.message);
        }
    })

})

loginForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    const formData = new FormData(loginForm);
    let userData = Object.fromEntries(formData.entries());    
    fetch('/user/login',{
        method:'POST',
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify(userData),
    })
    .then(response =>response.json())
    .then(data => {
        if(data.success)
        {
            if(data.role==='user') window.location.href= '/user';
            else if(data.role==='admin') window.location.href='/admin';

        }
        else{
           alert(data.message)
        }

    })

})

document.getElementById('show-signup').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});