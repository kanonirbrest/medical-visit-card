import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const phoneNumber = '+375292242006';
  const [activeSection, setActiveSection] = useState('contacts');
  const [currentDiploma, setCurrentDiploma] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // JSONBin.io конфигурация
  const JSONBIN_ID = process.env.REACT_APP_JSONBIN_ID || '6963e58a43b1c97be9293b4e';
  const JSONBIN_API_KEY = process.env.REACT_APP_JSONBIN_API_KEY || '$2a$10$O5gSh4of1jGQ5ZzefIM.2OIQLPTGPZ0/.LAOR.bGIM2/USlHIGYMi';
  
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

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextDiploma();
    }
    if (isRightSwipe) {
      prevDiploma();
    }
  };

  // Загрузка отзывов из JSONBin.io или localStorage
  const loadReviews = async () => {
    // Проверяем, настроен ли JSONBin.io
    if (JSONBIN_ID !== 'YOUR_BIN_ID' && JSONBIN_API_KEY !== 'YOUR_API_KEY') {
      try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
          headers: {
            'X-Master-Key': JSONBIN_API_KEY
          }
        });
        const data = await response.json();
        // Поддерживаем оба формата: объект с reviews или массив напрямую
        let reviewsData = [];
        if (data.record) {
          if (Array.isArray(data.record)) {
            reviewsData = data.record;
          } else if (data.record.reviews && Array.isArray(data.record.reviews)) {
            reviewsData = data.record.reviews;
          }
        }
        if (reviewsData.length >= 0) {
          setReviews(reviewsData);
          // Сохраняем в localStorage как резервную копию
          localStorage.setItem('reviews_backup', JSON.stringify(reviewsData));
        }
      } catch (error) {
        console.error('Ошибка загрузки отзывов из JSONBin.io:', error);
        // Пытаемся загрузить из localStorage
        const localReviews = localStorage.getItem('reviews');
        if (localReviews) {
          setReviews(JSON.parse(localReviews));
        }
      }
    } else {
      // Используем localStorage как временное решение
      const localReviews = localStorage.getItem('reviews');
      if (localReviews) {
        setReviews(JSON.parse(localReviews));
      }
    }
  };

  // Отправка нового отзыва
  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    
    const now = new Date();
    const newReview = {
      id: Date.now(),
      name: reviewForm.name.trim(),
      text: reviewForm.text.trim(),
      rating: reviewForm.rating,
      date: now.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: now.toISOString()
    };

    const updatedReviews = [...reviews, newReview];

    // Проверяем, настроен ли JSONBin.io
    if (JSONBIN_ID !== 'YOUR_BIN_ID' && JSONBIN_API_KEY !== 'YOUR_API_KEY') {
      try {
        // Отправляем объект с reviews, чтобы избежать ошибки "Bin cannot be blank"
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_API_KEY
          },
          body: JSON.stringify({ reviews: updatedReviews })
        });

        if (response.ok) {
          setReviews(updatedReviews);
          localStorage.setItem('reviews', JSON.stringify(updatedReviews));
          setReviewForm({ name: '', text: '', rating: 5 });
          alert('Спасибо за ваш отзыв!');
        } else {
          throw new Error('Ошибка отправки отзыва');
        }
      } catch (error) {
        console.error('Ошибка отправки отзыва в JSONBin.io:', error);
        // Сохраняем в localStorage как запасной вариант
        setReviews(updatedReviews);
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));
        setReviewForm({ name: '', text: '', rating: 5 });
        alert('Отзыв сохранен локально. Для синхронизации настройте JSONBin.io.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Используем localStorage как временное решение
      setReviews(updatedReviews);
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
      setReviewForm({ name: '', text: '', rating: 5 });
      alert('Спасибо за ваш отзыв! (Сохранено локально. Для синхронизации настройте JSONBin.io)');
      setIsSubmitting(false);
    }
  };

  // Загружаем отзывы при монтировании компонента
  useEffect(() => {
    if (JSONBIN_ID !== 'YOUR_BIN_ID') {
      loadReviews();
    }
  }, []);

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
            <button 
              className={`tab-button ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveSection('reviews')}
            >
              Отзывы
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

            <div className="qr-section">
              <h3>QR-код визитки</h3>
              <div className="qr-container">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://elena-visit-card.vercel.app')}`}
                  alt="QR-код визитки"
                  className="qr-code"
                />
              </div>
              <p className="qr-description">Отсканируйте для быстрого доступа к визитке</p>
            </div>

            {reviews.length > 0 && (
              <div className="reviews-preview">
                <h3>Последние отзывы</h3>
                <div className="reviews-preview-list">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="review-preview-item">
                      <div className="review-preview-header">
                        <span className="review-preview-name">{review.name}</span>
                        <span className="review-preview-rating">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      <p className="review-preview-text">{review.text.length > 100 ? review.text.substring(0, 100) + '...' : review.text}</p>
                    </div>
                  ))}
                </div>
                <button 
                  className="view-all-reviews-btn"
                  onClick={() => setActiveSection('reviews')}
                >
                  Посмотреть все отзывы
                </button>
              </div>
            )}
          </div>
          )}
          
          {activeSection === 'diplomas' && (
            <div className="diplomas-block">
              <h2>Дипломы и сертификаты</h2>
              
              <div className="diploma-slider">
                <button className="slider-btn prev-btn" onClick={prevDiploma}>
                  ‹
                </button>
                
                        <div 
                          className="diploma-container" 
                          onClick={openDiplomaInNewTab}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          <img
                            src={diplomas[currentDiploma]}
                            alt={`Диплом ${currentDiploma + 1}`}
                            className="diploma-image"
                          />
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

          {activeSection === 'reviews' && (
            <div className="reviews-block">
              <h2>Отзывы</h2>
              
              {(JSONBIN_ID === 'YOUR_BIN_ID' || JSONBIN_API_KEY === 'YOUR_API_KEY') && (
                <div className="setup-notice">
                  <p>ℹ️ Отзывы сохраняются локально в браузере</p>
                  <p>Для синхронизации между устройствами настройте JSONBin.io (см. <code>JSONBIN_SETUP.md</code>)</p>
                </div>
              )}
              
              <form className="review-form" onSubmit={submitReview}>
                <h3>Оставить отзыв</h3>
                
                <div className="form-group">
                  <label htmlFor="review-name">Ваше имя:</label>
                  <input
                    type="text"
                    id="review-name"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                    placeholder="Введите ваше имя"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="review-rating">Оценка:</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-text">Ваш отзыв:</label>
                  <textarea
                    id="review-text"
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                    placeholder="Поделитесь своими впечатлениями..."
                    rows="4"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-review-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                </button>
              </form>

              <div className="reviews-list">
                <h3>Отзывы клиентов</h3>
                {reviews.length === 0 ? (
                  <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
                ) : (
                  <div className="reviews-container">
                    {reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <span className="review-name">{review.name}</span>
                          <span className="review-date">
                            {review.date}
                            {review.time && <span className="review-time">, {review.time}</span>}
                          </span>
                        </div>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
                        <p className="review-text">{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
