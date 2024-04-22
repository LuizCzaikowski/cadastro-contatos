import React, { useState, useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import Map from "../Map/Map";
import "./ContactList.css";

const ContactList = ({ contacts, updateContacts, onClick }) => {
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContactIndex, setSelectedContactIndex] = useState(null); // Estado para armazenar o índice do contato selecionado
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    const filteredContacts = contacts.filter(
      (contact) => contact.userEmail === currentUserEmail
    );
    const sortedContacts = sortContacts(filteredContacts, sortOrder); // Ordenação padrão
    setFilteredContacts(sortedContacts);
  }, [contacts, sortOrder]);

  // Função para ordenar os contatos com base no nome
  const sortContacts = (contacts, order) => {
    const sortedContacts = [...contacts];
    sortedContacts.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (order === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    return sortedContacts;
  };

  // Função para alternar a ordem de ordenação
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  };

  // Função para deletar um contato
  const handleDeleteContact = (contact) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este contato?");
    if (confirmed) {
      const updatedContacts = contacts.filter((c) => c !== contact);
      updateContacts(updatedContacts); // Atualiza a lista na interface
      updateLocalStorage(updatedContacts); // Atualiza o armazenamento local
    }
  };

  // Função para atualizar o estado do índice do contato selecionado
  const handleSelectContact = (index) => {
    setSelectedContactIndex(index); // Atualiza o índice do contato selecionado ao clicar
  };

  const updateLocalStorage = (updatedContacts) => {
    localStorage.setItem("contacts", JSON.stringify(updatedContacts));
  };

  return (
    <div>
      <div className="title-container">
        <h2 className="title-left">Contatos</h2>
        <button className="order-button" onClick={toggleSortOrder}>
          {sortOrder === "asc" ? "Ordenar A-Z" : "Ordenar Z-A"}{" "}
          {sortOrder === "asc" ? <span>&#9660;</span> : <span>&#9650;</span>}
        </button>
      </div>
      <ul>
        {filteredContacts.map((contact, index) => (
          <li
            key={index}
            className={`contact-item ${selectedContactIndex === index ? 'selected' : ''}`}
            onClick={() => {
              onClick(contact);
              handleSelectContact(index); // Atualiza o índice do contato selecionado ao clicar
            }}
          >
            <RiDeleteBin6Line onClick={(e) => {e.stopPropagation(); handleDeleteContact(contact);}} className="delete-icon" />
            <strong>Nome:</strong> {contact?.name || "Nome não disponível"}{" "}
            <strong>CPF:</strong> {contact?.cpf || "CPF não disponível"}{" "}
            <strong>Telefone:</strong> {contact?.phone || "Telefone não disponível"}{" "}
            <strong>Endereço:</strong> {contact?.address || "Endereço não disponível"}{" "}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
