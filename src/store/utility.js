const getRole = () => {
    const token = localStorage.getItem('jwtToken')
    if(!token) return;

    try{
     const decodeUserDetails = JSON.parse(window.atob(token.split('.')[1]));

     console.log("decodeUserDetails",decodeUserDetails.authorities[0])
     return decodeUserDetails;
    }catch(error) {
     console.log(error)
    }
}
export default getRole;
