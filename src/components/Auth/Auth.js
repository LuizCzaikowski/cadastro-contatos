import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      // Lógica de login
      fakeLogin(email, password);
    } else {
      // Lógica de cadastro
      fakeSignup(email, password);
    }
  };

  const fakeLogin = (email, password) => {
    // Lógica de login
    const users = getUsersFromLocalStorage();
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      localStorage.setItem("authToken", "myAuthToken");
      localStorage.setItem("currentUserEmail", email);
      navigate("/home", { replace: true });
    } else {
      setFeedback("Email ou senha incorretos. Por favor, tente novamente.");
    }
  };

  const getUsersFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  }; 

  const fakeSignup = (email, password) => {
    // Lógica de cadastro
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some((user) => user.email === email)) {
      setFeedback("Este email já está em uso. Por favor, escolha outro.");
    } else {
      const newUser = { email, password };
      localStorage.setItem("users", JSON.stringify([...users, newUser]));
      setFeedback("Conta criada com sucesso!");
  
      // Salvar o email do usuário no localStorage
      localStorage.setItem("currentUserEmail", email);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Cadastro"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Entrar" : "Cadastrar"}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Criar uma conta" : "Já tem uma conta? Faça login"}
      </p>
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default Auth;
