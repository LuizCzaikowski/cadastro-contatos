import React, { useEffect, useRef, useState } from 'react';

const Map = ({ selectedContact, onError }) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(false); // Estado para controlar se houve um erro ao carregar o mapa

  useEffect(() => {
    const loadMap = (contact) => {
      if (!contact || !contact.latitude || !contact.longitude) {
        return;
      }

      const loadGoogleMaps = () => {
        return new Promise((resolve, reject) => {
          const googleMapScript = document.createElement('script');
          googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent("AIzaSyD_9kumB1ZD8T4kfg3jFC7zq---5O82B60")}&libraries=places`;
          googleMapScript.async = true;

          googleMapScript.onload = () => {
            resolve();
          };

          googleMapScript.onerror = () => {
            reject(new Error('Erro ao carregar a API do Google Maps.'));
          };

          document.body.appendChild(googleMapScript);
        });
      };

      loadGoogleMaps()
        .then(() => {
          if (!window.google || !window.google.maps) {
            console.error('A API do Google Maps não foi carregada corretamente.');
            setMapError(true); // Define o estado para indicar que ocorreu um erro ao carregar o mapa
            onError(); // Chama a função de retorno de chamada onError para notificar a tela principal do erro
            return;
          }

          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: parseFloat(contact.latitude), lng: parseFloat(contact.longitude) },
            zoom: 15,
          });

          new window.google.maps.Marker({
            position: { lat: parseFloat(contact.latitude), lng: parseFloat(contact.longitude) },
            map,
            title: contact.name,
          });
        })
        .catch((error) => {
          console.error(error.message);
          setMapError(true); // Define o estado para indicar que ocorreu um erro ao carregar o mapa
          onError(); // Chama a função de retorno de chamada onError para notificar a tela principal do erro
        });
    };

    const currentUserEmail = localStorage.getItem("currentUserEmail");

    if (selectedContact) {
      loadMap(selectedContact);
    } else {
      const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
      // Filtrar os contatos com base no email do usuário atual
      const filteredContacts = savedContacts.filter(contact => contact.userEmail === currentUserEmail);
      if (filteredContacts.length > 0) {
        loadMap(filteredContacts[0]);
      }
    }
  }, [selectedContact, onError]);

  return (
    <div>
      {mapError ? (
        <p>O mapa não pôde ser carregado.</p>
      ) : (
        <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
      )}
    </div>
  );
};

export default Map;
