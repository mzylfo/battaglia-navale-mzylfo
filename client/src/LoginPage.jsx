import LoginForm from "./LoginForm.jsx";

//Pagina di login: mostra il form dentro una card centrata
function LoginPage({onLogin}) {
  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card p-4 shadow-sm">
          <h4 className="text-center mb-3">Accedi</h4>
          <LoginForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
