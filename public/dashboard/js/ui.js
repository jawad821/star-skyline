const UI = {
  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  openModal(modalId) {
    document.getElementById(modalId)?.classList.add('active');
  },

  closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  },

  setActiveNav(itemName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-page="${itemName}"]`)?.classList.add('active');
  },

  showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(`page-${pageName}`)?.classList.add('active');
  },

  toggleTheme() {
    document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light');
  },

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    }
  },

  async loadPageData(pageName) {
    try {
      switch (pageName) {
        case 'dashboard':
          await this.loadDashboard();
          break;
        case 'bookings':
          await this.loadBookings();
          break;
        case 'drivers':
          await this.loadDrivers();
          break;
        case 'cars':
          await this.loadCars();
          break;
      }
    } catch (error) {
      console.error(`Error loading ${pageName}:`, error);
      this.showToast(`Error loading ${pageName}`, 'error');
    }
  },

  async loadDashboard() {
    try {
      const data = await api.getDashboardStats();
      if (data.success) {
        document.getElementById('stat-bookings').textContent = data.summary?.total_bookings || '0';
        document.getElementById('stat-completed').textContent = data.summary?.completed_bookings || '0';
        document.getElementById('stat-pending').textContent = data.summary?.pending_bookings || '0';
        document.getElementById('stat-revenue').textContent = `$${parseFloat(data.summary?.total_revenue || 0).toFixed(2)}`;
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  },

  async loadBookings() {
    try {
      const data = await api.getBookings();
      if (data.success) {
        const tbody = document.getElementById('bookings-table-body');
        if (tbody) {
          tbody.innerHTML = (data.vehicles || []).map(v => `
            <tr onclick="UI.showBookingDetails('${v.id}', '${v.plate_number}', '${v.model}', '${v.status}')">
              <td>${v.plate_number}</td>
              <td>${v.model}</td>
              <td>${v.type}</td>
              <td><span class="badge badge-${v.status}">${v.status}</span></td>
              <td>${v.driver_name || 'Unassigned'}</td>
            </tr>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  },

  showBookingDetails(id, plate, model, status) {
    document.getElementById('detail-plate').textContent = plate;
    document.getElementById('detail-model').textContent = model;
    document.getElementById('detail-status').textContent = status;
    this.openModal('booking-modal');
  },

  async loadDrivers() {
    try {
      const data = await api.getDrivers();
      if (data.success) {
        const tbody = document.getElementById('drivers-table-body');
        if (tbody) {
          tbody.innerHTML = (data.vendors || []).map(v => `
            <tr>
              <td>${v.name}</td>
              <td>${v.phone || '-'}</td>
              <td><span class="badge badge-online">Active</span></td>
            </tr>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  },

  async loadCars() {
    try {
      const data = await api.getVehicles();
      if (data.success) {
        const container = document.getElementById('cars-grid');
        if (container) {
          container.innerHTML = (data.vehicles || []).map(v => `
            <div class="card">
              <h3>${v.model}</h3>
              <p>Plate: ${v.plate_number}</p>
              <p>Type: ${v.type}</p>
              <p>Status: <span class="badge badge-${v.status}">${v.status}</span></p>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  }
};

// Init theme on load
document.addEventListener('DOMContentLoaded', () => {
  UI.initTheme();
});
