import React from 'react';
import './App.css';

function App() {
  const phoneNumber = '+375292242006';
  
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

  return (
    <div className="app">
      <div className="visit-card">
        <div className="content">
          <h1 className="title">Специалист по оздоровлению</h1>
          
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
        </div>
      </div>
    </div>
  );
}

export default App;
