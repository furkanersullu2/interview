import {jwtDecode} from 'jwt-decode'

const useToken = () => {
    const token = localStorage.getItem('token');
    
    if (token) {
        const decoded = jwtDecode(token)
        //console.log(decoded);

        const { first_name, last_name, employee_role, id } = decoded;
        /* console.log(first_name);
        console.log(last_name);
        console.log(employee_role);
        console.log(id); */


        return {first_name, last_name, employee_role, id}
    }

    return { first_name:"", last_name:"", employee_role:"", id:""}
}
export default useToken;