import React, { useState, useEffect } from "react";
import { cpf as cpfValidator } from "cpf-cnpj-validator"; // Biblioteca para validar CPF
import InputMask from "react-input-mask";
import "./ContactForm.css";

const ContactForm = ({ onSuccess, onClose, userEmail, contactToEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    address: "",
    cep: "",
    latitude: "",
    longitude: "",
    userEmail: userEmail,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contactToEdit) {
      setFormData(contactToEdit);
    }

    const getCoordinates = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            formData.address
          )}&key=AIzaSyD_9kumB1ZD8T4kfg3jFC7zq---5O82B60`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            setFormData((prevFormData) => ({
              ...prevFormData,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
            }));
            console.log("Coordenadas obtidas com sucesso:", {
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
            });
          }
        } else {
          console.error("Erro ao obter coordenadas:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao obter coordenadas:", error);
      }
    };

    if (formData.address !== "") {
      getCoordinates();
    }
  }, [formData.address, contactToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpar a mensagem de erro quando o valor do CPF for alterado
    if (name === "cpf" && errorMessage) {
      setErrorMessage("");
    }
  };

  const handleCepChange = async (e) => {
    const cep = e.target.value.trim().replace("-", "");
    setFormData((prevFormData) => ({
      ...prevFormData,
      cep,
    }));

    if (cep.length === 8 && /^[0-9]{8}$/.test(cep)) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (!data.erro) {
            setFormData((prevFormData) => ({
              ...prevFormData,
              address: `${data.logradouro}, ${data.localidade} - ${data.uf}`,
            }));
            setErrorMessage("");
          } else {
            setErrorMessage("CEP não encontrado");
          }
        } else {
          setErrorMessage("Erro ao buscar endereço do CEP");
        }
      } catch (error) {
        setErrorMessage("Erro ao buscar endereço do CEP");
        console.error("Erro ao buscar endereço do CEP:", error);
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        address: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Impede múltiplas submissões enquanto o processo de envio estiver em andamento
    if (submitting) return;

    // Define que o formulário está sendo submetido
    setSubmitting(true);

    // Validação do CPF
    if (!cpfValidator.isValid(formData.cpf)) {
      setErrorMessage("CPF inválido");
      setSubmitting(false);
      return;
    }

    // Verificar se já existe um contato com o mesmo CPF para outro usuário
    const currentUserEmail = localStorage.getItem("currentUserEmail");
    if (!currentUserEmail) {
      console.error("Email do usuário não encontrado no localStorage");
      setSubmitting(false);
      return;
    }

    const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const existingContact = contacts.find(
      (contact) =>
        contact.cpf === formData.cpf && contact.userEmail !== currentUserEmail
    );
    if (existingContact) {
      setErrorMessage("CPF já cadastrado para outro usuário");
      setSubmitting(false);
      return;
    }

    // Atualizar o contato existente se o CPF já existir para o mesmo usuário
    const updatedContacts = contacts.map((contact) => {
      if (contact.cpf === formData.cpf) {
        return { ...formData, userEmail: currentUserEmail };
      }
      return contact;
    });

    // Se não houver contato existente com o mesmo CPF para o mesmo usuário, adiciona como novo contato
    if (!updatedContacts.some((contact) => contact.cpf === formData.cpf)) {
      updatedContacts.push({ ...formData, userEmail: currentUserEmail });
    }

    // Atualiza os contatos no armazenamento local
    localStorage.setItem("contacts", JSON.stringify(updatedContacts));

    // Limpa os campos do formulário após a edição ou cadastro
    setFormData({
      name: "",
      cpf: "",
      phone: "",
      address: "",
      cep: "",
      latitude: "",
      longitude: "",
    });

    // Chama a função de sucesso passada como prop
    onSuccess(formData);

    // Fecha a modal
    onClose();

    // Recarrega a página
    window.location.reload();

    // Define que o envio do formulário foi concluído
    setSubmitting(false);
  };

  return (
    <div className="contact-form-container">
      <span className="close" onClick={onClose}>
        &times;
      </span>
      <h2 className="contact-form-title">
        {contactToEdit ? "Editar Contato" : "Cadastrar Contato"}
      </h2>
      <form onSubmit={handleSubmit}>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <label className="contact-form-label">
          Nome:
          <input
            className="contact-form-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label className="contact-form-label">
          CPF:
          <InputMask
            className="contact-form-input"
            mask="999.999.999-99"
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
        </label>
        <label className="contact-form-label">
          CEP:
          <InputMask
            className="contact-form-input"
            mask="99999-999"
            maskChar=""
            type="text"
            name="cep"
            value={formData.cep}
            onChange={handleCepChange}
            required
          />
        </label>
        <label className="contact-form-label">
          Telefone:
          <InputMask
            className="contact-form-input"
            mask="(99) 99999-9999"
            maskChar=""
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label className="contact-form-label">
          Endereço:
          <input
            className="contact-form-input"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </label>
        <button
          className="contact-form-button"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Enviando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
