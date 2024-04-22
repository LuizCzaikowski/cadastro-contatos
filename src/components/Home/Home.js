import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactForm from "../ContactForm/ContactForm";
import Modal from "react-modal";
import ContactList from "../ContactList/ContactList";
import Map from "../Map/Map";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState("");
  const [setFilteredContacts] = useState([]);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/login", { replace: true });
    } else {
      const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
      setContacts(savedContacts);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUserEmail");
    navigate("/login", { replace: true });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleSuccessfulSubmit = (newContact) => {
    setContacts([...contacts, newContact]);
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 5000);
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
  };

  const handleDeleteAccount = () => {
    const password = prompt(
      "Digite sua senha para confirmar a exclusão da conta:"
    );
    const email = localStorage.getItem("currentUserEmail");

    const isPasswordCorrect = verifyPassword(password);
    if (isPasswordCorrect) {
      const user = getUserByEmail(email);
      if (user) {
        deleteAccount(user);
        navigate("/login", { replace: true });
      } else {
        alert("Erro: usuário não encontrado.");
      }
    } else {
      alert("Erro: senha incorreta.");
    }
  };

  const deleteAccount = (user) => {
    const users = getUsersFromLocalStorage();
    const updatedUsers = users.filter((u) => u.email !== user.email);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    deleteRelatedContacts(user.email);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUserEmail");
  };

  const deleteRelatedContacts = (userEmail) => {
    const updatedContacts = contacts.filter(
      (contact) => contact.userEmail !== userEmail
    );
    setContacts(updatedContacts); // Atualize os contatos localmente
    localStorage.setItem("contacts", JSON.stringify(updatedContacts)); // Atualize o armazenamento local
  };

  const verifyPassword = (inputPassword) => {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users.find((user) => user.email === currentUserEmail);
    if (currentUser && currentUser.password === inputPassword) {
      return true;
    } else {
      return false;
    }
  };

  const getUserByEmail = (email) => {
    const users = getUsersFromLocalStorage();
    return users.find((user) => user.email === email);
  };

  const getUsersFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.cpf.includes(searchTerm)
  );

  return (
    <div className="home-container">
      <div className="header">
        <button className="logout-button" onClick={openModal}>
          Cadastrar Contato
        </button>

        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar contato"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <hr />
      <div className="content">
        <div className="contact-list">
          <ContactList
            contacts={filteredContacts}
            onClick={handleContactClick} // Passando a função handleContactClick
            updateContacts={setContacts} // Passa a função de atualização dos contatos
          />
        </div>
        <div className="map">
          <h2 className="title-right">Mapa</h2>
          <Map selectedContact={selectedContact} />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Cadastrar Contato"
        className="custom-modal"
        contentClassName="custom-content"
      >
        <ContactForm onSuccess={handleSuccessfulSubmit} onClose={closeModal} />
      </Modal>
      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={closeSuccessModal}
        contentLabel="Cadastro realizado com sucesso!"
      >
        <div className="success-message">
          <p>
            Cadastro realizado com sucesso! Aguarde alguns segundos e você será
            redirecionado
          </p>
        </div>
      </Modal>
      <button className="delete-account-button" onClick={handleDeleteAccount}>
        Excluir Conta
      </button>
    </div>
  );
};

export default Home;
