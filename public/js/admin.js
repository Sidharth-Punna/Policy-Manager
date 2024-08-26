
const snapShot_pagination  =document.getElementById('snapShot-pagination')
const snapshot_table_body =document.getElementById('snapShot-table-body')
const user_pagination  =document.getElementById('users-pagination')
const user_table_body =document.getElementById('users-table-body')
const pending_table_body =document.getElementById('pendindgRequests-table-body')
const userForm = document.getElementById('userForm');
const getUserForm = document.getElementById('searchUser');
const userModalBody = document.getElementById('userModalBody');
const modalElement = document.getElementById('userModal');
let modal;

let  editUserId;


import { signOut } from "./helperFunction.js";

window.deleteUser = deleteUser;
window.initiateUpdate = initiateUpdate;
window.toggleFormDisplay = toggleFormDisplay;
window.acceptReq = acceptReq;
window.rejectReq = rejectReq;


document.addEventListener('DOMContentLoaded',()=>{


    modal = new bootstrap.Modal(modalElement);

    try{
        fetch('/admin/requests')
        .then(response => response.json())
        .then(data =>{
            if(data.success){
                document.querySelector('.navbar-brand').textContent=data.userName;
                console.log(data.pendingRequests);
                data.pendingRequests.forEach((data) => {
                    pending_table_body.appendChild(createPendingRow(data));
                  });
                pendingCount();


            }
            else{
                if(data.message=='Token is required' || data.message==='Invalid token'){
                    signOut();
                }
            }
        });
        
    }
    catch(error){
        console.error('error fetching snapshot');

    }

    try{
        snapShot();
    }
    catch(error){
        console.error('error fetching snapshot');
    }
    try{
        getUsers();
    }
    catch(error){
        console.error('error fetching users');
    }
    


});

userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(userForm);
    const userData = Object.fromEntries(formData.entries());
    // userData.userId =`${userId}`;
    const action = event.submitter.value;
    // if (!validateForm(action)) return;
    console.log(action);
    if (action === "create") {
      console.log(userData);
      userData.confirm_password = userData.password
      addNewUser(userData);
    } else if (action === "update") {
      updateUser(userData, editUserId);
      toggleFormDisplay("create");
    } else {
      console.error("Unknown action:", action);
    }
});
// getUserForm.addEventListener("submit", (event) => {
//     event.preventDefault();
//     const formData = new FormData(getUserForm);
//     const userId = formData.get("id").trim();
//     fetch(`/admin/getOneUser/${userId}`)
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           const userElement = document 
//             .getElementById(`${userId}`)
//             .cloneNode(true);
//           if (userModalBody.hasChildNodes()) {
//             userModalBody.removeChild(userModalBody.firstChild)
//           }
//           userModalBody.appendChild(userElement);
//           modal.show();
//         } else {
//           console.error("User not found");
//         }
//       })
//       .catch((error) => console.error("Error fetching Policy details:", error));
//   });
document.getElementById('signOut').addEventListener('click', signOut);

function snapShot() {
    fetch('/admin/snapShot')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const rowsPerPage = 5;
            let currentPage = 1;
            displayTable(data.usersData, rowsPerPage, currentPage, snapshot_table_body);
            setupPagination(data.usersData, rowsPerPage, snapShot_pagination, snapshot_table_body);
            document.querySelector('.page-item').classList.add('active');
        }
    })
    .catch(error => {
        console.error('Error fetching snapshot:', error);
    });
}
function getUsers(){
    fetch('/admin/getUsers')
        .then(response => response.json())
        .then(data =>{
            if(data.success){
                const rowsPerPage = 5;
                let currentPage = 1;
                userTable(data.usersData, rowsPerPage, currentPage,user_table_body);
                userPagination(data.usersData, rowsPerPage,user_pagination,user_table_body);
                document.querySelector('.user-page-item').classList.add('active');
            }
        })
        .catch(error => console.error(error));

}
function createPendingRow (item){

    const row = document.createElement('tr');
    row.classList.add('pending-row')
    row.id=`${item.req_id}`;
    row.innerHTML = `
        <td >${item.req_id}</td>
        <td '>${item.user_id}</td>
        <td '>${item.policy_number}</td>
        <td '>${item.insured_party}</td>
        <td '>${item.status}</td>
        <td '>${item.coverage_type}</td>
        <td ' ><button
            type="button"
            class="btn p-0 me-2 text-danger fw-semibold acceptReq btn-sm"
            onclick="acceptReq(this)"
          >
            Accept
          </button>
          <button
            type="button"
            class="btn p-0 text-warning fw-semibold  rejectReq btn-sm"
            onclick="rejectReq(this)"
          >
            Reject
          </button>
        </td>
    `;
    return  row;


}
function acceptReq(button){
    const row = button.closest('.pending-row');
    const req_id = row.id;
    fetch('/admin/acceptReq',{
        method:'POST',
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({id:req_id})
    })
    .then(response => response.json())
    .then(data =>{
        if(data.success){
            console.log(data.message);
            row.remove();
            pendingCount();
            snapShot();

        }
        else{
            console.lof(data.message);
        }
    })
    .catch(error=> console.error(error));

}
function rejectReq(button){
    const row = button.closest('.pending-row');
    const req_id = row.id;
    fetch('/admin/rejectReq',{
        method:'POST',
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({id:req_id})
    })
    .then(response => response.json())
    .then(data =>{
        if(data.success){
            console.log(data.message);
            row.remove();
            pendingCount();
        }
        else{
            console.lof(data.message);
        }
    })
    .catch(error=> console.error(error));

}
function displayTable(data, rowsPerPage, page,tableBody) {
    tableBody.innerHTML = '';

    page--;

    const start = rowsPerPage * page;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.user_id}</td>
            <td>${item.userName}</td>
            <td>${item.policy_count}</td>
        `;
        tableBody.appendChild(row);
    });
    console.log(paginatedData.length)
    if(paginatedData.length<5)
    {
        let temp = 5-paginatedData.length
        console.log(temp);
        while(temp--)
        {
            const row = document.createElement('tr');
            tableBody.appendChild(row);

        }
    }
}
function setupPagination(data, rowsPerPage,pagination,tableBody) {
    pagination.innerHTML = '';

    const pageCount = Math.ceil(data.length / rowsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', function() {
            let currentPage = i;
            displayTable(data, rowsPerPage, currentPage,tableBody);

            // Update active class
            const currentActive = document.querySelector('.page-item.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            li.classList.add('active');
        });
        pagination.appendChild(li);
    }
}
function userTable(data, rowsPerPage, page,tableBody) {
    tableBody.innerHTML = '';

    page--;

    const start = rowsPerPage * page;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.classList.add('user-row')
        row.id=`${item.id}`;
        row.innerHTML = `
            <td class='userId'>${item.id}</td>
            <td class='userName'>${item.username}</td>
            <td class='email'>${item.email}</td>
            <td><button
                type="button"
                class="btn p-0 me-2 text-danger fw-semibold deleteUser btn-sm"
                onclick="deleteUser(this)"
              >
                Delete
              </button>
              <button
                type="button"
                class="btn p-0 text-warning fw-semibold  updateUser btn-sm"
                onclick="initiateUpdate(this)"
              >
                Update
              </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    console.log(paginatedData.length)
    if(paginatedData.length<5)
    {
        let temp = 5-paginatedData.length
        console.log(temp);
        while(temp--)
        {
            const row = document.createElement('tr');
            tableBody.appendChild(row);

        }
    }
}
function userPagination(data, rowsPerPage,pagination,tableBody) {
    pagination.innerHTML = '';

    const pageCount = Math.ceil(data.length / rowsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = 'user-page-item';
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', function() {
            let currentPage = i;
            userTable(data, rowsPerPage, currentPage,tableBody);

            // Update active class
            const currentActive = document.querySelector('.user-page-item.active');
            if (currentActive) {
                currentActive.classList.remove('active');
            }
            li.classList.add('active');
        });
        pagination.appendChild(li);
    }
}
function addNewUser(userData){

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    // if(!passwordRegex.test(password)){
        
    // }

    if(userData.password != userData.confirm_password){
        alert(`Password didn't match`);
        return;
    }
    fetch('user/register',{
        method:'POST',
        headers: { "Content-Type": "application/json" },
        body :JSON.stringify(userData)
    })
    .then(response =>{
        console.log(response);
        return response.json()})
    .then(data =>{
        if(data.success){
            userForm.reset();
            getUsers();
            snapShot();
        }
        
        else{
            alert(data.message);
        }
    })
}
function deleteUser(button){
    const userElement = button.closest('.user-row');
    const userId = userElement.id;

    fetch(`/admin/deleteuser/${userId}`, { method: "DELETE" })
    .then(response => response.json())
    .then (data =>{
        if(data.success)
        {
            userElement.remove();
            snapShot();
            alert(data.message);
        }
        else {
            alert(data.message);
        }
    })
}
function initiateUpdate(button){
    const userElement = button.closest('.user-row');
    editUserId = userElement.id;
    toggleFormDisplay('update');

    fetch(`/admin/getOneUser/${editUserId}`, {
        method: 'GET',
        headers: {"Content-Type": "application/json",},
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            populateForm(data.userData);
            userForm.scrollIntoView({behavior:"smooth"});
            // if (policyModalBody.hasChildNodes()) {
            //   policyModalBody.removeChild(policyModalBody.firstChild)
            // }
            // modal.hide();
        } else {
            console.error(data.message);
        }
    })
    .catch((error) => console.error("Error fetching User details:", error));
}
function updateUser(userData,userId){

    fetch(`/admin/updateUser/${userId}`,{
        method:'PUT',
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            updateUserElement(userData,userId)
            userForm.reset();
        }
        else{
            console.log(data.message);
        }
    })
    .catch((error) => console.error("Error Updating user:", error));



}
function updateUserElement(userData,userId){
    const userRow = document.getElementById(`${userId}`);
    userRow.querySelector(`.userId`).textContent=`${userId}`;
    userRow.querySelector(`.email`).textContent=`${userData.email}`;
    userRow.querySelector(`.userName`).textContent=`${userData.username}`;

}
function populateForm(userData) {
    document.getElementById("username").value = userData.username;
    document.getElementById("email").value = userData.email;
    document.getElementById("role").value = userData.role;
}
  
function toggleFormDisplay(mode) {
    const inputField = document.getElementById('password');

    if (mode === 'update') {
        inputField.required = false;
        inputField.placeholder = 'New Password (optional)'
    } else if (mode === 'create') {
        inputField.required = true;
        inputField.placeholder = 'Password'
        userForm.reset();

    }
    document.getElementById("createUser").style.display =
      mode === "create" ? "block" : "none";
  
    document.getElementById("updateUser").style.display =
      mode === "update" ? "block" : "none";
    document.getElementById("heading").textContent =
      mode === "create" ? "Add New User" : "Update User";
}

function pendingCount () {
     const len =document.getElementById('badge').textContent=pending_table_body.querySelectorAll('tr').length;

   if(len==0)
                {
                    const heading = document.createElement('h5');
                    heading.className = 'text-secondary text-center'; 
                    heading.textContent = 'No pending Requests'; 
                    document.getElementById('pendindgRequestsContainer').appendChild(heading);
                }
}

