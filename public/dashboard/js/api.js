const API_BASE = window.location.origin;

const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/reports/summary');
  },

  // Bookings
  async getBookings(type = '') {
    const url = type ? `/api/bookings/available-vehicles?type=${type}` : '/api/bookings/available-vehicles';
    return this.request(url);
  },

  async calculateFare(data) {
    return this.request('/api/bookings/calculate-fare', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createBooking(data) {
    return this.request('/api/bookings/create-booking', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async assignVehicle(bookingId, vehicleId) {
    return this.request('/api/bookings/assign-vehicle', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, vehicle_id: vehicleId })
    });
  },

  // Vendors (Drivers)
  async getVendors() {
    return this.request('/api/vendors');
  },

  async getDrivers() {
    return this.request('/api/vendors');
  },

  // Vehicles (Cars)
  async getVehicles() {
    return this.request('/api/vehicles');
  },

  // Settings
  async getSettings() {
    return this.request('/api/settings');
  },

  async updateSettings(data) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Export
  exportCSV(from, to) {
    let url = `${API_BASE}/api/reports/export/csv`;
    if (from && to) url += `?from=${from}&to=${to}`;
    window.open(url, '_blank');
  },

  exportExcel(from, to) {
    let url = `${API_BASE}/api/reports/export/excel`;
    if (from && to) url += `?from=${from}&to=${to}`;
    window.open(url, '_blank');
  }
};
