// src/utils/globalFix.js

// Add this to your main App.js or index.js to prevent errors
if (typeof window !== 'undefined') {
    window.canOfferServices = () => {
      const user = JSON.parse(localStorage.getItem('madEasy_user'));
      return user && user.userType === 'cleaner';
    };
    
    window.canBook = () => {
      const user = JSON.parse(localStorage.getItem('madEasy_user'));
      return user && user.userType === 'client';
    };
    
    window.handleFindClients = (navigate) => {
      const user = JSON.parse(localStorage.getItem('madEasy_user'));
      if (user?.userType === 'cleaner') {
        navigate('/find-client');
      } else {
        navigate('/signup', { state: { userType: 'cleaner' } });
      }
    };
    
    window.handleBookNow = (navigate) => {
      const user = JSON.parse(localStorage.getItem('madEasy_user'));
      if (user?.userType === 'client') {
        navigate('/booking');
      } else {
        navigate('/signup', { state: { userType: 'client' } });
      }
    };
  }
  
  console.log('✅ Global fixes applied - canOfferServices, canBook, handleFindClients, handleBookNow are now available globally');