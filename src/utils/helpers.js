// src/utils/helpers.js

// Global helper to replace canOfferServices
export const canOfferServices = () => {
    const user = JSON.parse(localStorage.getItem('madEasy_user'));
    return user && user.userType === 'cleaner';
  };
  
  // Global helper to replace canBook
  export const canBook = () => {
    const user = JSON.parse(localStorage.getItem('madEasy_user'));
    return user && user.userType === 'client';
  };
  
  // Global handleFindClients replacement
  export const handleFindClients = (navigate) => {
    const user = JSON.parse(localStorage.getItem('madEasy_user'));
    if (user?.userType === 'cleaner') {
      navigate('/find-client');
    } else {
      navigate('/signup', { state: { userType: 'cleaner' } });
    }
  };
  
  // Global handleBookNow replacement
  export const handleBookNow = (navigate) => {
    const user = JSON.parse(localStorage.getItem('madEasy_user'));
    if (user?.userType === 'client') {
      navigate('/booking');
    } else {
      navigate('/signup', { state: { userType: 'client' } });
    }
  };