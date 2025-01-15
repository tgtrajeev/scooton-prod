import { useNavigate } from 'react-router-dom';
import { handleLogin } from '../pages/auth/common/store';
import store from '../store';


export const logoutAndRedirect = () => {
    store.dispatch(handleLogin(false)); 
    window.localStorage.clear(); 
    window.location.href = "/"; 
};
