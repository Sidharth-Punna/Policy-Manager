export function signOut() {
    fetch('/user/logOut', {
        method: 'POST',
        credentials: 'include', // Include credentials to ensure cookies are sent
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = `http://localhost:8080/`;
        } else {
            console.error('Logout failed:', data.message);
        }
    })
    .catch(error => {
        console.error('An error occurred during logout:', error);
    });
}