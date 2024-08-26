
const policyContiner = document.getElementById("policies");
const policyTemplate = document.querySelector(".policy");
const policyForm = document.getElementById("policyForm");
const getPolicyForm = document.getElementById('searchPolicy');
const policyModalBody = document.getElementById('policyModalBody');
const modalElement = document.getElementById('policyModal');
import { signOut } from "./helperFunction.js";
window.signOut = signOut;
window.initiateUpdate = initiateUpdate;
window.deletePolicy = deletePolicy;


let editPolicyId;
let modal;
let userId;
document.addEventListener("DOMContentLoaded", () => {
  
   modal = new bootstrap.Modal(modalElement);
   fetch("/user/policies", {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
    }
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        userId=data.userId;
        document.querySelector('.navbar-brand').textContent=data.userName;
       
        data.policyData.forEach((data) => {
          policyContiner.appendChild(createPolicyElement(data));
        });
      }
      else {
        if (data.message === 'Token is required' || data.message === 'Invalid token') {
            window.location.href = 'http://localhost:8080/'; // Redirect to login page
        } else if (data.message === 'No Policies Found') {
            userId = data.userId;
            console.log(data.message);
            const heading = document.createElement('h5');
                    heading.className = 'text-secondary text-center'; 
                    heading.textContent = 'No Policies Added'; 
                    document.getElementById('policies').appendChild(heading);

        }
    }

    });
  policyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(policyForm);
    const policyData = Object.fromEntries(formData.entries());
    policyData.userId =`${userId}`;

    
    const action = event.submitter.value;
    if (!validateForm(action)) return;
    console.log(action);
    if (action === "create") {
      console.log(policyData);
      requestNewPolicy(policyData);
    } else if (action === "update") {
      updatePolicy(policyData, editPolicyId);
      toggleFormDisplay("create");
    } else {
      console.error("Unknown action:", action);
    }
  });

  getPolicyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(getPolicyForm);
    const policyId = formData.get("id").toLowerCase();
    fetch(`/user/policies/${policyId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const policyElement = document 
            .getElementById(`${policyId}`)
            .cloneNode(true);
          if (policyModalBody.hasChildNodes()) {
            policyModalBody.removeChild(policyModalBody.firstChild)
          }
          policyModalBody.appendChild(policyElement);
          modal.show();
        } else {
          console.error("Policy not found");
        }
      })
      .catch((error) => console.error("Error fetching Policy details:", error));
  });
});

// user.js

document.getElementById('signOut').addEventListener('click',signOut);


// export function signOut() {
//       fetch('/user/logOut', {
//           method: 'POST',
//           credentials: 'include', // Include credentials to ensure cookies are sent
//           headers: {
//               'Content-Type': 'application/json'
//           }
//       })
//       .then(response => response.json())
//       .then(data => {
//           if (data.success) {
//               window.location.href = `http://localhost:8080/`;
//           } else {
//               console.error('Logout failed:', data.message);
//           }
//       })
//       .catch(error => {
//           console.error('An error occurred during logout:', error);
//       });
// }

function createPolicyElement(policy) {
  const newPolicyElement = document.createElement("div");
  newPolicyElement.classList.add(...["col", "p-0", "cardColumn"]);
  newPolicyElement.id = `policy-${policy.policy_number}`;

  const newPolicy = policyTemplate.cloneNode(true);
  newPolicy.id = `${policy.policy_number}`;

  newPolicy.querySelector(".party").textContent = `${policy.insured_party}`;
  newPolicy.querySelector(
    ".policyId"
  ).textContent = `Policy Number : ${policy.policy_number}`;
  newPolicy.querySelector(
    ".coverage_type"
  ).textContent = `Coverage Type : ${policy.coverage_type}`;
  newPolicy.querySelector(
    ".startDate"
  ).textContent = `Start Date : ${policy.start_date.slice(0, 10)}`;
  newPolicy.querySelector(
    ".endDate"
  ).textContent = `End Date : ${policy.end_date.slice(0, 10)}`;
  newPolicy.querySelector(
    ".amount"
  ).textContent = `Amount : ${policy.premium_amount}`;
  newPolicy.querySelector(".status").textContent = ` Status : ${policy.status}`;

  newPolicyElement.appendChild(newPolicy);

  return newPolicyElement;
}

function requestNewPolicy(policyData) {
  fetch("/user/policies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(policyData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // policyContiner.appendChild(createPolicyElement(data.policyData));
        policyForm.reset();
        alert(data.message);
      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error requesting Policy:", error));
}

export function initiateUpdate(button) {
  const policyElement = button.closest(".policy");
  editPolicyId = policyElement.id;

  console.log(editPolicyId);
  toggleFormDisplay("update");
  // if (shopDisplayContainer.querySelector(".Policy")) {
  //   shopDisplayContainer.removeChild(
  //     shopDisplayContainer.querySelector(".Policy")
  //   );
  // }
  fetch(`/user/policies/${editPolicyId}`, {
    method: 'GET',
    headers: {"Content-Type": "application/json",},
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        populateForm(data.policyData);
        policyForm.scrollIntoView({behavior:"smooth"});
        if (policyModalBody.hasChildNodes()) {
          policyModalBody.removeChild(policyModalBody.firstChild)
        }
        modal.hide();
      } else {
        console.error("Policy not found");
      }
    })
    .catch((error) => console.error("Error fetching Policy details:", error));
}

function updatePolicy(policyData, id) {
  fetch(`/user/policies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(policyData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        updatePolicyElement(id, policyData);
        policyForm.reset();

      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error updating Policy:", error));
}

function updatePolicyElement(id, policyData) {
  const policyElement = document.getElementById(id);
  policyElement.querySelector(".party").textContent = `${policyData.insured_party}`;
  policyElement.querySelector(
    ".policyId"
  ).textContent = `Policy Number : ${id}`;
  policyElement.querySelector(
    ".coverage_type"
  ).textContent = `Coverage Type : ${policyData.coverage_type}`;
  policyElement.querySelector(
    ".startDate"
  ).textContent = `Start Date : ${policyData.start_date.slice(0, 10)}`;
  policyElement.querySelector(
    ".endDate"
  ).textContent = `End Date : ${policyData.end_date.slice(0, 10)}`;
  policyElement.querySelector(
    ".amount"
  ).textContent = `Amount : ${policyData.premium_amount}`;
  policyElement.querySelector(".status").textContent = ` Status : ${policyData.status}`;
}

export function deletePolicy(button) {
  const policyElement = button.closest(".policy");
  const policyId = policyElement.id;
  if (policyModalBody.hasChildNodes()) {
    policyModalBody.removeChild(policyModalBody.firstChild)
  }
  modal.hide();
  
  fetch(`/user/policies/${policyId}`, { method: "DELETE" })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        if(policyElement.parentElement!== null)
        {
          policyElement.parentElement.remove();
        }
        if (document.getElementById(`${policyId}`)) {
          document.getElementById(`policy-${policyId}`).remove();
        }
      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error deleting Policy:", error));
}

function populateForm(policyData) {
  document.getElementById("policy_number").value = policyData.policy_number;
  document.getElementById("insured_party").value = policyData.insured_party;
  document.getElementById("start_date").value = policyData.start_date.slice(
    0,
    10
  );
  document.getElementById("end_date").value = policyData.end_date.slice(0, 10);
  document.getElementById("coverage_type").value = policyData.coverage_type;
  document.getElementById("premium_amount").value = policyData.premium_amount;
  document.getElementById("status").value = policyData.status;
}

function toggleFormDisplay(mode) {
  const inputField = document.getElementById('policy_number');
  if(mode=='update')
  {
    inputField.disabled = true;   // Disables the input field
    inputField.readOnly = true;
  }
  else{
    inputField.disabled = false;   // Disables the input field
    inputField.readOnly = false;
  }
  document.getElementById("createPolicy").style.display =
    mode === "create" ? "block" : "none";

  document.getElementById("updatePolicy").style.display =
    mode === "update" ? "block" : "none";
  document.getElementById("heading").textContent =
    mode === "create" ? "Add New Policy" : "Update Policy";
}
function validateForm(action){

    const policyNumber = document.getElementById('policy_number').value.trim().toLowerCase();
    const startDate = new Date(document.getElementById('start_date').value);
    const endDate = new Date(document.getElementById('end_date').value);
    const premiumAmount = document.getElementById('premium_amount').value.trim();

  
    // Validation checks
    let isValid = true;
    let errorMessage = '';
    // Check if policy number starts with 'P'
    if (!policyNumber.startsWith('p')) {
      errorMessage += 'Policy number must start with "P".\n';
      isValid = false;
    }
  
    // Check if the policy number already exists in localStorage
    if (isNaN(premiumAmount) || parseFloat(premiumAmount) <= 0) {
      errorMessage += 'Premium Amount must be a valid number greater than 0.\n';
      isValid = false;
    }
  
    // Check if end date is greater than start date
    if (endDate <= startDate) {
      errorMessage += 'End date must be greater than start date.\n';
      isValid = false;
    }
  
    if (!isValid) {
      alert(errorMessage);
      return;
    }
  
    // If valid, save the policy number to localStorage

    return true;
}
  
