import {useState} from "react"; 

function LoginForm({onLogin}){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    //Quando premo "Accedi": impedisco il refresh della pagina e provo il login
    const handleSubmit = (event) => {
        event.preventDefault(); //blocchiamo il refresh
        setErrorMsg("");
        onLogin({username, password })
        .catch(() => setErrorMsg("Email o password errate"));
    };

    return (
        <form onSubmit={handleSubmit}>
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        <div className="mb-2">
            <label className="form-label">Email</label>
            <input
            type="email"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            />
        </div>
        <div className="mb-2">
            <label className="form-label">Password</label>
            <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>
        <button type="submit" className="btn btn-primary">Accedi</button>
        </form>
    );
}

export default LoginForm;
