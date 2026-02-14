import Login from "../../components/LoginComponent/Login"
import Register from "../../components/RegisterComponent/Register"

const AuthPage = () => {
  return (
    <div>
      <div>page d'auth</div >

      <Login/>
      <Register/>
    </div>
  );
};

export default AuthPage;