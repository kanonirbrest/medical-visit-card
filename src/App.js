import React, { useState } from 'react';
import './App.css';

function App() {
  const phoneNumber = '+375292242006';
  const [activeSection, setActiveSection] = useState('contacts');
  const [currentDiploma, setCurrentDiploma] = useState(0);
  
  const diplomas = [
    require('./assets/diploms/1.jpg'),
    require('./assets/diploms/2.jpg'),
    require('./assets/diploms/3.jpg'),
    require('./assets/diploms/4.jpg')
  ];
  
  const handleTelegramClick = () => {
    // Попытка открыть Telegram приложение, если не получается - открыть веб-версию
    const telegramUrl = `https://t.me/${phoneNumber}`;
    window.open(telegramUrl, '_blank');
  };

  const handleViberClick = () => {
    // Пытаемся открыть Viber приложение, если не получается - веб-версию
    const viberAppUrl = `viber://chat?number=${phoneNumber}`;
    const viberWebUrl = `https://chats.viber.com/${phoneNumber}`;
    
    // Создаем скрытую ссылку для приложения
    const appLink = document.createElement('a');
    appLink.href = viberAppUrl;
    appLink.style.display = 'none';
    document.body.appendChild(appLink);
    appLink.click();
    document.body.removeChild(appLink);
    
    // Если через 2 секунды ничего не произошло, открываем веб-версию
    setTimeout(() => {
      window.open(viberWebUrl, '_blank');
    }, 2000);
  };

  const handlePhoneClick = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const nextDiploma = () => {
    setCurrentDiploma((prev) => (prev + 1) % diplomas.length);
  };

  const prevDiploma = () => {
    setCurrentDiploma((prev) => (prev - 1 + diplomas.length) % diplomas.length);
  };

  const openDiplomaInNewTab = () => {
    window.open(diplomas[currentDiploma], '_blank');
  };

  return (
    <div className="app">
      <div className="visit-card">
        <div className="content">
          <h1 className="title">Специалист по оздоровлению</h1>
          
          <div className="section-tabs">
            <button 
              className={`tab-button ${activeSection === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveSection('contacts')}
            >
              Контакты
            </button>
            <button 
              className={`tab-button ${activeSection === 'diplomas' ? 'active' : ''}`}
              onClick={() => setActiveSection('diplomas')}
            >
              Дипломы
            </button>
          </div>
          
          {activeSection === 'contacts' && (
            <div className="contact-block">
            <h2>Контакты <span className="name-inline">(Елена Васильевна)</span></h2>
            
            <div className="phone-section">
              <span className="phone-label">Телефон:</span>
              <a 
                href={`tel:${phoneNumber}`}
                className="phone-number"
                onClick={handlePhoneClick}
              >
                {phoneNumber}
              </a>
            </div>
            
            <div className="messaging-buttons">
              <button 
                className="contact-btn telegram-btn"
                onClick={handleTelegramClick}
              >
                <span className="btn-icon">📱</span>
                Написать в Telegram
              </button>
              
              <button 
                className="contact-btn viber-btn"
                onClick={handleViberClick}
              >
                <span className="btn-icon">💬</span>
                Написать в Viber
              </button>
            </div>
          </div>
          )}
          
          {activeSection === 'diplomas' && (
            <div className="diplomas-block">
              <h2>Дипломы и сертификаты</h2>
              
              <div className="diploma-slider">
                <button className="slider-btn prev-btn" onClick={prevDiploma}>
                  ‹
                </button>
                
                <div className="diploma-container" onClick={openDiplomaInNewTab}>
                  <img 
                    src={diplomas[currentDiploma]} 
                    alt={`Диплом ${currentDiploma + 1}`}
                    className="diploma-image"
                  />
                  <div className="diploma-overlay">
                    <span className="overlay-text">Нажмите для увеличения</span>
                  </div>
                </div>
                
                <button className="slider-btn next-btn" onClick={nextDiploma}>
                  ›
                </button>
              </div>
              
              <div className="diploma-dots">
                {diplomas.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentDiploma ? 'active' : ''}`}
                    onClick={() => setCurrentDiploma(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
