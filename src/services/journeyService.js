// ==================== src/services/journeyService.js ====================
import api from './api';

export const searchJourneys = async (searchParams) => {
  return await api.post('/journeys/search', searchParams);
};

export const getJourneyDetails = async (journeyId) => {
  return await api.get(`/journeys/${journeyId}`);
};

export const getAvailableSeats = async (routeParams) => {
  return await api.post('/journeys/available-seats', routeParams);
};

export const getBookedSeats = async (params) => {
  return await api.post('/journeys/booked-seats', params);
};

export const getBusDetails = async (busId) => {
  return await api.get(`/buses/${busId}`);
};

export const getHomeContent = async () => {
  return await api.get('/home-content');
};
