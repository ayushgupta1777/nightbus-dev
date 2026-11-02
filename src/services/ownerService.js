// ==================== src/services/ownerService.js ====================
import api from './api';

export const getOwnerDashboard = async () => {
  return await api.get('/bus-owner/dashboard');
};

export const getOwnerBuses = async () => {
  return await api.get('/bus-owner/buses');
};

export const addBus = async (busData) => {
  return await api.post('/bus-owner/buses', busData);
};

export const updateBusSeatLayout = async (busId, layoutData) => {
  return await api.put(`/buses/${busId}/seats`, layoutData);
};

export const getOwnerRoutes = async () => {
  return await api.get('/routes');
};

export const createRoute = async (routeData) => {
  return await api.post('/routes', routeData);
};

export const updateRouteStatus = async (routeId, statusData) => {
  return await api.put(`/routes/${routeId}`, statusData);
};

export const deleteRoute = async (routeId) => {
  return await api.delete(`/routes/${routeId}`);
};

export const getOwnerTrips = async (params) => {
  return await api.get('/trips', params);
};

export const scheduleTrip = async (tripData) => {
  return await api.post('/trips', tripData);
};

export const getOwnerRevenue = async () => {
  return await api.get('/bus-owner/revenue');
};

export const getOwnerStaff = async () => {
  return await api.get('/staff');
};

export const addStaffMember = async (staffData) => {
  return await api.post('/staff', staffData);
};
