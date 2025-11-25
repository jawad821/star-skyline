document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModals();
  initForms();
  loadInitialPage();
});

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const page = item.dataset.page;
      UI.setActiveNav(page);
      UI.showPage(page);
      UI.loadPageData(page);
    });
  });

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', UI.toggleTheme);
  }
}

function initModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        UI.closeModal(modal.id);
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      UI.closeAllModals();
    });
  });
}

function initForms() {
  // Booking form
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const data = {
          customer_name: document.getElementById('booking-name').value,
          customer_phone: document.getElementById('booking-phone').value,
          pickup_location: document.getElementById('booking-pickup').value,
          dropoff_location: document.getElementById('booking-dropoff').value,
          distance_km: parseFloat(document.getElementById('booking-distance').value) || 10,
          vehicle_type: document.getElementById('booking-vehicle').value
        };

        const result = await api.createBooking(data);
        if (result.success) {
          UI.showToast('Booking created successfully');
          UI.closeAllModals();
          bookingForm.reset();
          UI.loadBookings();
        }
      } catch (error) {
        UI.showToast('Error creating booking', 'error');
      }
    });
  }

  // Driver form
  const driverForm = document.getElementById('driver-form');
  if (driverForm) {
    driverForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.showToast('Driver added successfully');
      UI.closeAllModals();
      driverForm.reset();
      UI.loadDrivers();
    });
  }

  // Car form
  const carForm = document.getElementById('car-form');
  if (carForm) {
    carForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.showToast('Car added successfully');
      UI.closeAllModals();
      carForm.reset();
      UI.loadCars();
    });
  }
}

function loadInitialPage() {
  UI.setActiveNav('dashboard');
  UI.showPage('dashboard');
  UI.loadPageData('dashboard');
}
