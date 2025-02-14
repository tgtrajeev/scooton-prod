const getRole = () => {
    const token = localStorage.getItem('jwtToken')
    if(!token) return;

    try{
     const decodeUserDetails = JSON.parse(window.atob(token.split('.')[1]));

     return decodeUserDetails.authorities[0];
    }catch(error) {
     console.log(error)
    }
}
export default getRole;
