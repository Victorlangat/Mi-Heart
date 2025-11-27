// src/context/BookingContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context
const BookingContext = createContext();

// Enhanced initial state with cleaner selection
const initialState = {
  currentStep: 1,
  cleaningType: '',
  schedule: {
    date: '',
    time: '',
    frequency: 'once'
  },
  location: {
    address: '',
    city: 'Nairobi',
    propertyType: '',
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: '',
    specialInstructions: '',
    coordinates: { lat: null, lng: null }
  },
  extras: {
    deepCleaning: false,
    windowCleaning: false,
    laundry: false,
    fridgeCleaning: false,
    ovenCleaning: false,
    balconyCleaning: false,
    carpetCleaning: false
  },
  contactInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialInstructions: ''
  },
  payment: {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false
  },
  totalPrice: 0,
  estimatedDuration: '2-3 hours',
  isLoading: false,
  errors: {},
  bookingId: null,
  lastStepCompleted: 0,
  
  // NEW: Cleaner selection state
  selectedCleaner: null,
  cleanerAccepted: false,
  invitationId: null,
  invitationStatus: 'pending' // pending, sent, accepted, declined, timeout
};

// Enhanced booking reducer with cleaner selection
const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_STEP':
      const newStep = action.payload;
      const lastStepCompleted = Math.max(state.lastStepCompleted, newStep - 1);
      return { 
        ...state, 
        currentStep: newStep,
        lastStepCompleted,
        errors: {}
      };
    
    case 'SET_CLEANING_TYPE':
      const cleaningType = action.payload;
      const { price, duration } = calculateServiceDetails(cleaningType, state.location);
      return { 
        ...state, 
        cleaningType,
        totalPrice: price,
        estimatedDuration: duration
      };
    
    case 'SET_SCHEDULE':
      const newSchedule = { ...state.schedule, ...action.payload };
      return { ...state, schedule: newSchedule };
    
    case 'SET_LOCATION':
      const newLocation = { ...state.location, ...action.payload };
      const { price: newPrice, duration: newDuration } = calculateServiceDetails(state.cleaningType, newLocation);
      return { 
        ...state, 
        location: newLocation,
        totalPrice: newPrice,
        estimatedDuration: newDuration
      };
    
    case 'SET_EXTRAS':
      const newExtras = { ...state.extras, ...action.payload };
      const extrasPrice = calculateExtrasPrice(newExtras);
      const basePrice = calculateBasePrice(state.cleaningType, state.location);
      return { 
        ...state, 
        extras: newExtras,
        totalPrice: basePrice + extrasPrice
      };
    
    case 'SET_CONTACT_INFO':
      return { ...state, contactInfo: { ...state.contactInfo, ...action.payload } };
    
    case 'SET_PAYMENT':
      return { ...state, payment: { ...state.payment, ...action.payload } };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    
    case 'SET_BOOKING_ID':
      return { ...state, bookingId: action.payload };
    
    case 'CALCULATE_TOTAL':
      const base = calculateBasePrice(state.cleaningType, state.location);
      const extras = calculateExtrasPrice(state.extras);
      return { ...state, totalPrice: base + extras };
    
    case 'RESET_BOOKING':
      return { ...initialState };
    
    case 'VALIDATE_STEP':
      const stepErrors = validateStep(state.currentStep, state);
      return { ...state, errors: stepErrors };
    
    // NEW: Cleaner selection actions
    case 'SET_SELECTED_CLEANER':
      return { 
        ...state, 
        selectedCleaner: action.payload 
      };
    
    case 'SET_CLEANER_ACCEPTED':
      return { 
        ...state, 
        cleanerAccepted: action.payload 
      };
    
    case 'SET_INVITATION_ID':
      return { 
        ...state, 
        invitationId: action.payload 
      };
    
    case 'SET_INVITATION_STATUS':
      return { 
        ...state, 
        invitationStatus: action.payload 
      };
    
    case 'RESET_CLEANER_SELECTION':
      return {
        ...state,
        selectedCleaner: null,
        cleanerAccepted: false,
        invitationId: null,
        invitationStatus: 'pending'
      };
    
    default:
      return state;
  }
};

// Enhanced price calculations (keep existing)
const calculateServiceDetails = (cleaningType, location) => {
  const basePrices = {
    'standard': 2000,
    'deep': 4500,
    'move-in': 5000,
    'move-out': 2500,
    'custom': 3000
  };
  
  let price = basePrices[cleaningType] || 2000;
  let duration = '2-3 hours';
  
  if (location.bedrooms > 2) {
    price += (location.bedrooms - 2) * 500;
    duration = '3-4 hours';
  }
  if (location.bathrooms > 2) {
    price += (location.bathrooms - 2) * 400;
  }
  if (location.squareFootage > 1500) {
    price += Math.floor((location.squareFootage - 1500) / 500) * 300;
    duration = '4-5 hours';
  }
  
  return { price, duration };
};

const calculateBasePrice = (cleaningType, location) => {
  const { price } = calculateServiceDetails(cleaningType, location);
  return price;
};

const calculateExtrasPrice = (extras) => {
  const extraPrices = {
    'deepCleaning': 5000,
    'windowCleaning': 3000,
    'laundry': 1500,
    'fridgeCleaning': 2000,
    'ovenCleaning': 2000,
    'balconyCleaning': 1500,
    'carpetCleaning': 2500
  };
  
  return Object.entries(extras).reduce((total, [key, isSelected]) => {
    return total + (isSelected ? (extraPrices[key] || 0) : 0);
  }, 0);
};

// Enhanced validation with new steps
const validateStep = (step, state) => {
  const errors = {};
  
  switch (step) {
    case 1:
      if (!state.cleaningType) errors.cleaningType = 'Please select a service type';
      break;
    
    case 2:
      if (!state.schedule.date) errors.date = 'Please select a date';
      if (!state.schedule.time) errors.time = 'Please select a time';
      break;
    
    case 3:
      if (!state.location.address) errors.address = 'Address is required';
      if (!state.location.city) errors.city = 'City is required';
      if (!state.location.propertyType) errors.propertyType = 'Property type is required';
      break;
    
    case 5: // Cleaner selection step
      if (!state.selectedCleaner) errors.cleaner = 'Please select a cleaner';
      break;
    
    case 7: // Contact step (moved from 5)
      if (!state.contactInfo.firstName) errors.firstName = 'First name is required';
      if (!state.contactInfo.lastName) errors.lastName = 'Last name is required';
      if (!state.contactInfo.email) errors.email = 'Email is required';
      if (!state.contactInfo.phone) errors.phone = 'Phone number is required';
      if (state.contactInfo.email && !/\S+@\S+\.\S+/.test(state.contactInfo.email)) {
        errors.email = 'Email is invalid';
      }
      break;
    
    case 8: // Payment step (moved from 6)
      if (!state.payment.cardNumber || state.payment.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = 'Valid card number is required';
      }
      if (!state.payment.expiryDate || !/^\d{2}\/\d{2}$/.test(state.payment.expiryDate)) {
        errors.expiryDate = 'Valid expiry date is required';
      }
      if (!state.payment.cvv || state.payment.cvv.length < 3) {
        errors.cvv = 'Valid CVV is required';
      }
      if (!state.payment.nameOnCard) errors.nameOnCard = 'Name on card is required';
      break;
  }
  
  return errors;
};

// Context Provider with persistence
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBooking = localStorage.getItem('madEasy_booking');
    if (savedBooking) {
      const parsed = JSON.parse(savedBooking);
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        dispatch({ type: 'RESTORE_BOOKING', payload: parsed.data });
      }
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    const saveData = {
      data: state,
      timestamp: Date.now()
    };
    localStorage.setItem('madEasy_booking', JSON.stringify(saveData));
  }, [state]);

  // Enhanced dispatch with validation
  const enhancedDispatch = (action) => {
    dispatch(action);
    
    if (['SET_CLEANING_TYPE', 'SET_SCHEDULE', 'SET_LOCATION', 'SET_CONTACT_INFO', 'SET_PAYMENT', 'SET_SELECTED_CLEANER'].includes(action.type)) {
      setTimeout(() => dispatch({ type: 'VALIDATE_STEP' }), 100);
    }
  };

  const value = {
    state,
    dispatch: enhancedDispatch,
    canProceed: (step = state.currentStep) => {
      const errors = validateStep(step, state);
      return Object.keys(errors).length === 0;
    },
    getProgress: () => {
      return (state.lastStepCompleted / 9) * 100; // Updated to 9 steps
    },
    submitBooking: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const bookingId = 'BK-' + Date.now().toString(36).toUpperCase();
        dispatch({ type: 'SET_BOOKING_ID', payload: bookingId });
        
        localStorage.removeItem('madEasy_booking');
        
        return { success: true, bookingId };
      } catch (error) {
        dispatch({ type: 'SET_ERRORS', payload: { submit: 'Failed to create booking. Please try again.' } });
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Booking State:', context.state);
  }
  
  return context;
};