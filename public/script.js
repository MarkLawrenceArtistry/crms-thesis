
// store all functions inside a module to a single object
import * as patientApi from './js/patient-api.js'
import * as medicineApi from './js/inventory-api.js'
import * as authApi from './js/auth-api.js'
import * as appointmentApi from './js/appointments-api.js'
import * as serviceApi from './js/service-api.js';
import * as visitApi from './js/visit-api.js';
import * as queueApi from './js/queue-api.js';
import * as paymentApi from './js/payment-api.js';
import * as visitServiceApi from './js/visit-service-api.js';

import { renderPatients } from './js/ui-patient.js'
import { renderMedicines } from './js/ui-inventory.js'
import { renderAppointments } from './js/ui-appointments.js'
import { renderServices } from './js/ui-service.js';
import { renderQueue } from './js/ui-queue.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentPatientId = null;
    let currentMedicineId = null;
    let currentVisitPatient = null;
    let currentWorklistVisitId = null;
    let allServices = [];
    let selectedServices = new Map();
    let currentVisitDetails = null;

    let socket;


    // MODALS
    const confirmationModal = document.querySelector('#confirmation-modal')
    const confirmationMessageEl = document.querySelector('#confirmation-question')
    const displayModal = document.querySelector('#display-modal')
    const displayTextEl = document.querySelector('#display-text')
    const displayImageEl = document.querySelector('#display-image-tag')


    // PATIENTS
    const addPatientForm = document.querySelector('#add-patient-form');
    const addPatientModal = document.querySelector('#add-patient-modal');
    const addPatientBtn = document.querySelector('#add-patient-btn');
    const closeModalBtn = document.querySelector('#close-add-patient-modal');
    const searchPatientEl = document.querySelector('#search-patient-input');
    const closePatientsUpdateModalBtn = document.querySelector('#close-upd-patient-modal');
    const updatePatientForm = document.querySelector('#update-patient-form')
    const updatePatientModal = document.querySelector('#update-patient-modal')


    // MEDICINES
    const addMedicineBtn = document.querySelector('#add-medicine-btn');
    const addMedicineForm = document.querySelector('#add-medicine-form');
    const addMedicineModal = document.querySelector('#add-medicine-modal');
    const closeMedicineModalBtn = document.querySelector('#close-add-medicine-modal');
    const updateMedicineForm = document.querySelector('#update-medicine-form');
    const updateMedicineModal = document.querySelector('#update-medicine-modal');
    const closeMedicineUpdateModalBtn = document.querySelector('#close-upd-medicine-modal');
    const searchMedicineEl = document.querySelector('#search-medicine-input');


    // SERVICES
    const addServiceBtn = document.querySelector('#add-service-btn');
    const serviceModal = document.querySelector('#service-modal');
    const closeServiceModalBtn = document.querySelector('#close-service-modal');
    const serviceForm = document.querySelector('#service-form');
    const serviceModalTitle = document.querySelector('#service-modal-title');
    const serviceIdInput = document.querySelector('#service-id');


    // RECEPTION
    const receptionPatientSearchEl = document.querySelector('#reception-patient-search');
    const patientSearchResultsContainer = document.querySelector('#patient-search-results-container');
    const selectedPatientContainer = document.querySelector('#selected-patient-container');
    const newVisitModal = document.querySelector('#new-visit-modal');
    const closeNewVisitModalBtn = document.querySelector('#close-new-visit-modal');
    const newVisitHeader = document.querySelector('#new-visit-header');
    const availableServicesList = document.querySelector('#available-services-list');
    const selectedServicesList = document.querySelector('#selected-services-list');
    const confirmVisitBtn = document.querySelector('#confirm-visit-btn');
    const serviceSearchInput = document.querySelector('#service-search-input');
    const visitConfirmationModal = document.querySelector('#visit-confirmation-modal');
    const visitConfirmationMessageEl = document.querySelector('#visit-confirmation-message');


    // QUEUE MANAGEMENT
    const callNextPaymentBtn = document.querySelector('#call-next-payment-btn');
    const paymentQueueList = document.querySelector('#payment-queue-list');

    // DISPLAY PAGE CONSTANTS
    const nowServingNumberEl = document.querySelector('#now-serving-number');
    const nowServingCounterEl = document.querySelector('#now-serving-counter');
    const recentlyCalledListEl = document.querySelector('#recently-called-list');
    let recentlyCalled = [];
    const MAX_RECENTLY_CALLED = 5;


    // CONTAINERS
    const patientListContainer = document.querySelector('#patient-list-container');
    const medicineListContainer = document.querySelector('#inventory-list-container');
    const appointmentListContainer = document.querySelector('#appointments-list-container');
    const serviceListContainer = document.querySelector('#service-list-container');



    // CASHIER
    const cashierNowServingContainer = document.querySelector('#cashier-now-serving-container');
    const cashierPaymentDetailsContainer = document.querySelector('#cashier-payment-details-container');



    // DEPARTMENT PAGES
    const labWorklistContainer = document.querySelector('#laboratory-worklist');
    const radioWorklistContainer = document.querySelector('#radiology-worklist');
    const visitDetailsContainer = document.querySelector('#visit-details-container');
    


    // LOGIN
    const loginForm = document.querySelector('#login-form');


    // LOGOUT
    const logoutBtn = document.querySelector('#logout-btn');


    const body = document.body;
    const hamburgerBtn = document.querySelector("#hamburger-btn");
    const sidebar = document.querySelector(".sidebar");


    // MODALS:
    if(addPatientBtn) {
        addPatientBtn.addEventListener('click', () => {
            addPatientModal.style.display = "flex";
        });
    }

    if(closePatientsUpdateModalBtn) {
        closePatientsUpdateModalBtn.addEventListener('click', () => {
            updatePatientModal.style.display = "none"
        })
    }

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            addPatientModal.style.display = "none";
        });
    }

    if(addMedicineBtn) {
        addMedicineBtn.addEventListener('click', () => {
            addMedicineModal.style.display = "flex";
        });
    }

    if(closeMedicineModalBtn) {
        closeMedicineModalBtn.addEventListener('click', () => {
            addMedicineModal.style.display = "none";
        });
    }

    if(closeMedicineUpdateModalBtn) {
        closeMedicineUpdateModalBtn.addEventListener('click', () => {
            updateMedicineModal.style.display = "none";
        })
    }

    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            serviceForm.reset();
            serviceIdInput.value = '';
            serviceModalTitle.textContent = 'Add New Service';
            serviceModal.style.display = 'flex';
        });
    }

    if (closeServiceModalBtn) {
        closeServiceModalBtn.addEventListener('click', () => {
            serviceModal.style.display = 'none';
        });
    }


    // SIDEBAR

    if(hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (event) => {
            event.stopPropagation(); 
            
            sidebar.classList.toggle('show');
            body.classList.toggle('sidebar-open');
        });
    }

    body.addEventListener('click', (event) => {
        if (body.classList.contains('sidebar-open')) {
            if (!sidebar.contains(event.target)) {
                sidebar.classList.remove('show');
                body.classList.remove('sidebar-open');
            }
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && body.classList.contains('sidebar-open')) {
            sidebar.classList.remove('show');
            body.classList.remove('sidebar-open');
        }
    });


    function initializeSocket() {
        if (typeof io === 'undefined') {
            console.warn("Socket.IO client not found on this page. Real-time features will be disabled.");
            return;
        }

        socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('CLIENT: Connected to Socket.IO server!');
        });

        socket.on('queue_updated', () => {
            console.log('CLIENT: Received "queue_updated" event. Refreshing lists.');
            if (paymentQueueList) loadQueues();
            if (cashierNowServingContainer) loadNowServing();
            if (labWorklistContainer) loadWorklist('Laboratory', labWorklistContainer); // <-- ADD
            if (radioWorklistContainer) loadWorklist('Radiology', radioWorklistContainer); // <-- ADD
        });

        socket.on('now_serving', (data) => {
            // **** CRUCIAL DEBUGGING LOG ****
            console.log('CLIENT: Received "now_serving" event with data:', data);
            if (nowServingNumberEl) {
                updateNowServing(data);
                playNotificationSound();
            }
        });

        socket.on('visit_status_updated', () => {
            console.log('CLIENT: Received "visit_status_updated". Refreshing details.');
            if (currentWorklistVisitId && visitDetailsContainer) {
                loadAndRenderVisitDetails(currentWorklistVisitId);
            }
        });
    }

    // --- HELPER FUNCTIONS for Cashier Page ---
    async function loadNowServing() {
        try {
            const nowServing = await queueApi.fetchNowServing('Payment');
            if (nowServing) {
                currentVisitDetails = await visitApi.fetchVisitDetails(nowServing.visit_id);
                renderCashierView(nowServing, currentVisitDetails);
            } else {
                currentVisitDetails = null;
                renderCashierView(null, null); // Clear the view
            }
        } catch (err) {
            console.error(err);
            cashierNowServingContainer.innerHTML = `<p class="error-message">Error loading patient.</p>`;
        }
    }

    function renderCashierView(nowServing, visitDetails) {
        if (!nowServing || !visitDetails) {
            cashierNowServingContainer.innerHTML = `<h3>Now Serving for Payment</h3><div class="placeholder-text">Waiting for next patient...</div>`;
            cashierPaymentDetailsContainer.innerHTML = `<h3>Visit Details</h3><div class="placeholder-text">Select a patient to view details.</div>`;
            return;
        }

        // Render Left Column: Now Serving
        cashierNowServingContainer.innerHTML = `
            <h3>Now Serving for Payment</h3>
            <div class="selected-patient-card">
                <h4>${visitDetails.patient.name}</h4>
                <p><strong>Queue No:</strong> ${nowServing.queue_number}</p>
                <p><strong>Patient ID:</strong> ${visitDetails.patient.id}</p>
            </div>`;
        
        // Render Right Column: Payment Details
        const servicesList = visitDetails.services.map(s => `<li><span>${s.name}</span><span>₱${s.price.toFixed(2)}</span></li>`).join('');
        cashierPaymentDetailsContainer.innerHTML = `
            <h3>Visit Details</h3>
            <ul id="payment-details-list">${servicesList}</ul>
            <hr>
            <div class="payment-total">
                TOTAL: ₱${visitDetails.totalAmount.toFixed(2)}
            </div>
            <form id="payment-form">
                <input type="hidden" id="payment-visit-id" value="${nowServing.visit_id}">
                <div class="form-group">
                    <label for="payment-method">Payment Method</label>
                    <select id="payment-method" required>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="HMO">HMO</option>
                    </select>
                </div>
                 <div class="form-group">
                    <label for="amount-paid">Amount Paid</label>
                    <input type="number" id="amount-paid" value="${visitDetails.totalAmount.toFixed(2)}" step="0.01" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%;">Process Payment</button>
            </form>`;
    }

    // Add this event listener inside DOMContentLoaded
    document.body.addEventListener('submit', async (e) => {
        if (e.target.id === 'payment-form') {
            e.preventDefault();
            const paymentData = {
                visit_id: document.getElementById('payment-visit-id').value,
                amount_paid: document.getElementById('amount-paid').value,
                payment_method: document.getElementById('payment-method').value,
            };

            try {
                await paymentApi.processPayment(paymentData);
                // The 'queue_updated' socket event will automatically clear the screen
                const modal = document.querySelector('#confirmation-modal');
                const question = document.querySelector('#confirmation-question');
                question.textContent = 'Payment successful! Patient sent to next queue.';
                modal.querySelector('.display-image').style.display = 'block';
                modal.style.display = 'flex';
                // Quick and dirty modal close
                modal.querySelector('.ok-btn').onclick = () => { modal.style.display = 'none'; };

            } catch (err) {
                alert('Payment failed: ' + err.message);
                console.error(err);
            }
        }
    });

    initializeSocket();

    // DISPLAY/RENDER DATA
    
    // Patients
    async function loadPatients() {
        try {
            const patients = await patientApi.fetchPatients()
            renderPatients(patients, patientListContainer)
        } catch(err) {
            console.error(err)
        }
    }

    // Medicines
    async function loadMedicines() {
        try {
            const medicines = await medicineApi.fetchMedicines()
            renderMedicines(medicines, medicineListContainer)
        } catch(err) {
            console.error(err)
        }
    }

    // Reports and KPIs
    async function loadDashboard() {
        try {
            const statsResponse = await fetch('/api/dashboard/stats')
            const statsResult = await statsResponse.json()

            console.log(statsResult)
            console.log(statsResponse)

            if(statsResult.success) {
                document.querySelector('#total-patients').textContent = statsResult.data.totalPatients
                document.querySelector('#low-stock-medicines').textContent = statsResult.data.lowStockMedicines
            }
        } catch(err) {
            console.error(err.message)
        }
    }

    // Appointments
    async function loadAppointments() {
        try {
            const appointments = await appointmentApi.fetchAllAppointments()
            renderAppointments(appointments, appointmentListContainer)
        } catch(err) {
            console.error(err)
        }
    }

    // Services
    async function loadServices() {
        try {
            const services = await serviceApi.fetchServices();
            renderServices(services, serviceListContainer);
        } catch (err) {
            console.error(err);
            serviceListContainer.innerHTML = `<p class="error-message">Error loading services.</p>`;
        }
    }

    // Reception
    async function loadServicesForVisitModal() {
        try {
            allServices = await serviceApi.fetchServices();
            renderAvailableServices();
        } catch (err) {
            console.error(err);
            availableServicesList.innerHTML = `<p class="error-message">Could not load services.</p>`
        }
    }

    // Queue Management
    async function loadQueues() {
        if (!paymentQueueList) return;
        try {
            const paymentQueue = await queueApi.fetchQueues('Payment');
            renderQueue(paymentQueue, paymentQueueList);
        } catch (err) {
            console.error(err);
        }
    }

    // Worklist
    async function loadWorklist(queueType, container) {
        try {
            const worklistItems = await queueApi.fetchQueues(queueType);
            renderWorklist(worklistItems, container);
        } catch (error) {
            console.error(`Error loading ${queueType} worklist:`, error);
            container.innerHTML = `<p class="error-message">Failed to load worklist.</p>`;
        }
    }

    // Visit
    async function loadAndRenderVisitDetails(visitId) {
        currentWorklistVisitId = visitId;
        // Highlight the active item in the worklist
        document.querySelectorAll('.worklist-item').forEach(item => {
            item.classList.toggle('active', item.dataset.visitId === visitId);
        });

        try {
            // The API now returns an object with patient and services
            const details = await visitServiceApi.fetchServicesForVisit(visitId);
            renderVisitDetails(details); // Pass the whole object
        } catch (error) {
            console.error('Failed to render visit details:', error);
            visitDetailsContainer.innerHTML = `<p class="error-message">Could not load details.</p>`;
        }
    }

    // --- HELPER FUNCTIONS for Department Pages ---
    function renderVisitDetails(details) {
        // The 'details' object now contains details.patient and details.services
        if (!details || !details.services || details.services.length === 0) {
            visitDetailsContainer.innerHTML = `<h3>Visit Details</h3><p class="placeholder-text">No services found for this visit.</p>`;
            return;
        }

        const servicesHtml = details.services.map(service => {
            let actionButton = '';
            // Define the action based on the current status
            if (service.status === 'Pending Specimen') {
                actionButton = `<button class="btn btn-primary" data-action="receive-specimen" data-id="${service.visit_service_id}">Receive Specimen</button>`;
            } else if (service.status === 'For Radiology') {
                actionButton = `<button class="btn btn-primary" data-action="complete-radiology" data-id="${service.visit_service_id}">Mark as Completed</button>`;
            } else if (service.status === 'Specimen Received') {
                // Example of a next step
                actionButton = `<button class="btn btn-secondary" data-action="enter-results" data-id="${service.visit_service_id}">Enter Results</button>`;
            }

            return `
            <div class="visit-service-item">
                <div class="service-info">
                    <p>${service.service_name}</p>
                    <small class="service-status">${service.status}</small>
                </div>
                <div class="service-action">${actionButton}</div>
            </div>
            `;
        }).join('');

        // Construct the final HTML with a proper header
        visitDetailsContainer.innerHTML = `
            <h3>Details for ${details.patient.name}</h3>
            ${servicesHtml}
        `;
    }

    function renderWorklist(items, container) {
        if (!items || items.length === 0) {
            container.innerHTML = `<p class="placeholder-text">Worklist is empty.</p>`;
            return;
        }
        container.innerHTML = items.map(item => `
            <div class="worklist-item" data-visit-id="${item.visit_id}" data-queue-number="${item.queue_number}">
                <p><strong>${item.queue_number}</strong></p>
                <p>${item.patient_name}</p>
            </div>
        `).join('');
    }


    
    // ADD PATIENT FORM
    if(addPatientForm) {
        addPatientForm.addEventListener('submit', async (event) => {
            event.preventDefault()

            const patientData = {
                name: document.querySelector('#patient-name').value,
                dob: document.querySelector('#patient-dob').value,
                address: document.querySelector('#patient-address').value
            }

            try {
                await patientApi.addPatient(patientData)
                addPatientForm.reset()
                addPatientModal.style.display = "none"
                loadPatients();
            } catch (err) {
                console.error(err);
            }
        })
    }
    // PATIENTS VIEW/EDIT/DELETE
    if(patientListContainer) {
        patientListContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const patientItem = target.closest('.patient-item');
            if (!patientItem) return;

            const patientId = patientItem.dataset.id;
            
            // DELETE
            if (target.classList.contains('delete-btn')) {
                if (await showConfirmationModal('Are you sure you want to delete this patient?', confirmationModal)) {
                    try {
                        await patientApi.deletePatient(patientId);
                        loadPatients();
                    } catch (err) {
                        console.error(err);
                    }
                }
            }

            // EDIT/UPDATE
            if(target.classList.contains('edit-btn')) {
                try {
                    currentPatientId = patientId;
                    updatePatientModal.style.display = 'flex'
                } catch (err) {
                    console.error(err);
                }
            }
        });
    }
    if(searchPatientEl) {
        searchPatientEl.addEventListener('input', async (e) => {
            e.preventDefault()

            try {
                const patients = await patientApi.searchPatients(searchPatientEl.value)
                if(patients.length === 0) {
                    loadPatients()
                    return
                }

                renderPatients(patients, patientListContainer)
            } catch(err) {
                console.error(err)
            }
        })
    }
    if(updatePatientForm) {
        updatePatientForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            const patientData = {
                name: document.querySelector('#upd-patient-name').value,
                dob: document.querySelector('#upd-patient-dob').value,
                address: document.querySelector('#upd-patient-address').value
            }

            try {
                await patientApi.updatePatient(patientData, currentPatientId)
                updatePatientForm.reset()
                updatePatientModal.style.display = "none"
                loadPatients();
            } catch (err) {
                console.error(err);
            }
        })
    }


    // ADD MEDICINE FORM
    


    // SERVICE FORM (Add/Update)
    if (serviceForm) {
        serviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const serviceId = serviceIdInput.value;
            const serviceData = {
                name: document.querySelector('#service-name').value,
                category: document.querySelector('#service-category').value,
                price: document.querySelector('#service-price').value,
                description: document.querySelector('#service-description').value,
                requires_specimen: document.querySelector('#service-requires-specimen').checked,
            };

            try {
                if (serviceId) {
                    await serviceApi.updateService(serviceId, serviceData);
                } else {
                    await serviceApi.addService(serviceData);
                }
                serviceModal.style.display = 'none';
                loadServices();
            } catch (err) {
                console.error(err);
                alert('Failed to save service. Check console for details.');
            }
        });
    }
    if (serviceListContainer) {
        serviceListContainer.addEventListener('click', async (e) => {
            const target = e.target;
            const serviceItem = target.closest('.service-item');
            if (!serviceItem) return;

            const serviceId = serviceItem.dataset.id;

            // DELETE
            if (target.classList.contains('delete-btn')) {
                if (await showConfirmationModal('Are you sure you want to delete this service?', confirmationModal)) {
                    try {
                        await serviceApi.deleteService(serviceId);
                        loadServices();
                    } catch (err) {
                        console.error(err);
                    }
                }
            }

            // EDIT
            if (target.classList.contains('edit-btn')) {
                // Populate modal with data from dataset
                serviceIdInput.value = serviceItem.dataset.id;
                document.querySelector('#service-name').value = serviceItem.dataset.name;
                document.querySelector('#service-category').value = serviceItem.dataset.category;
                document.querySelector('#service-price').value = serviceItem.dataset.price;
                document.querySelector('#service-description').value = serviceItem.dataset.description;
                document.querySelector('#service-requires-specimen').checked = serviceItem.dataset.requires_specimen === '1';

                serviceModalTitle.textContent = 'Edit Service';
                serviceModal.style.display = 'flex';
            }
        });
    }


    // RECEPTION PAGE LOGIC
    if (receptionPatientSearchEl) {
        receptionPatientSearchEl.addEventListener('input', async () => {
            try {
                const searchTerm = receptionPatientSearchEl.value;
                if (searchTerm.length < 2) {
                    patientSearchResultsContainer.innerHTML = `<p class="placeholder-text">Enter at least 2 characters.</p>`;
                    return;
                }
                const patients = await patientApi.searchPatients(searchTerm);
                renderPatientSearchResults(patients);
            } catch (err) {
                console.error(err);
            }
        });
    }
    if (patientSearchResultsContainer) {
        patientSearchResultsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.patient-search-result')) {
                const patientDiv = e.target.closest('.patient-search-result');
                currentVisitPatient = {
                    id: patientDiv.dataset.id,
                    name: patientDiv.dataset.name,
                    dob: patientDiv.dataset.dob
                };
                renderSelectedPatient();
            }
        });
    }
    if (closeNewVisitModalBtn) {
        closeNewVisitModalBtn.addEventListener('click', () => newVisitModal.style.display = 'none');
    }
    if (selectedPatientContainer) {
        selectedPatientContainer.addEventListener('click', async (e) => {
            if (e.target.id === 'start-visit-btn') {
                if (!currentVisitPatient) return;
                newVisitHeader.textContent = `New Visit for ${currentVisitPatient.name}`;
                // Reset and show modal
                selectedServices.clear();
                await loadServicesForVisitModal();
                renderSelectedServices();
                newVisitModal.style.display = 'flex';
            }
        });
    }
    if (serviceSearchInput) {
        serviceSearchInput.addEventListener('input', () => {
            renderAvailableServices(serviceSearchInput.value);
        });
    }
    if (availableServicesList) {
        availableServicesList.addEventListener('click', (e) => {
            const serviceItem = e.target.closest('.service-list-item');
            if (serviceItem) {
                const serviceId = parseInt(serviceItem.dataset.id);
                const service = allServices.find(s => s.id === serviceId);
                if (service && !selectedServices.has(serviceId)) {
                    selectedServices.set(serviceId, service);
                    renderSelectedServices();
                }
            }
        });
    }
    if (selectedServicesList) {
        selectedServicesList.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-service-btn');
            if (removeBtn) {
                const serviceId = parseInt(removeBtn.dataset.id);
                if (selectedServices.has(serviceId)) {
                    selectedServices.delete(serviceId);
                    renderSelectedServices();
                }
            }
        });
    }
    if (confirmVisitBtn) {
        confirmVisitBtn.addEventListener('click', async () => {
            if (!currentVisitPatient || selectedServices.size === 0) {
                alert('Please select a patient and at least one service.');
                return;
            }
            try {
                const serviceIds = Array.from(selectedServices.keys());
                const result = await visitApi.createVisit(currentVisitPatient.id, serviceIds);
                
                newVisitModal.style.display = 'none';
                visitConfirmationMessageEl.innerHTML = `
                    Patient: ${currentVisitPatient.name}<br>
                    <strong>Queue Number: ${result.queue_number}</strong>
                `;
                visitConfirmationModal.style.display = 'flex';
            } catch (err) {
                console.error(err);
                alert('Error creating visit. Check console for details.');
            }
        });
    }
    if (visitConfirmationModal) {
        visitConfirmationModal.addEventListener('click', (e) => {
            if(e.target.classList.contains('ok-btn')) {
                visitConfirmationModal.style.display = 'none';
                // Reset the workflow
                currentVisitPatient = null;
                receptionPatientSearchEl.value = '';
                patientSearchResultsContainer.innerHTML = '<p class="placeholder-text">Search for a patient to begin.</p>';
                renderSelectedPatient();
            }
        });
    }
    function renderPatientSearchResults(patients) {
        if (!patients || patients.length === 0) {
            patientSearchResultsContainer.innerHTML = `<p class="placeholder-text">No patients found.</p>`;
            return;
        }
        patientSearchResultsContainer.innerHTML = patients.map(p => `
            <div class="patient-search-result" data-id="${p.id}" data-name="${p.name}" data-dob="${p.dob}">
                <strong>${p.name}</strong><br>
                <small>DOB: ${new Date(p.dob).toLocaleDateString()}</small>
            </div>
        `).join('');
    }
    function renderSelectedPatient() {
        if (!currentVisitPatient) {
            selectedPatientContainer.innerHTML = `<p class="placeholder-text">No patient selected.</p>`;
        } else {
            selectedPatientContainer.innerHTML = `
                <div class="selected-patient-card">
                    <h4>${currentVisitPatient.name}</h4>
                    <p><strong>ID:</strong> ${currentVisitPatient.id}</p>
                    <p><strong>DOB:</strong> ${new Date(currentVisitPatient.dob).toLocaleDateString()}</p>
                    <button id="start-visit-btn" class="btn btn-primary">Start New Visit</button>
                </div>
            `;
        }
    }
    function renderAvailableServices(filter = '') {
        const lowercasedFilter = filter.toLowerCase();
        const filteredServices = allServices.filter(s => s.name.toLowerCase().includes(lowercasedFilter));

        if (filteredServices.length === 0) {
            availableServicesList.innerHTML = '<p class="placeholder-text">No services match your search.</p>';
            return;
        }

        availableServicesList.innerHTML = filteredServices.map(s => `
            <div class="service-list-item" data-id="${s.id}">
                <span>${s.name}</span>
                <span>₱${parseFloat(s.price).toFixed(2)}</span>
            </div>
        `).join('');
    }
    function renderSelectedServices() {
        if (selectedServices.size === 0) {
            selectedServicesList.innerHTML = `<p class="placeholder-text">Add services from the left.</p>`;
            return;
        }
        selectedServicesList.innerHTML = Array.from(selectedServices.values()).map(s => `
            <div class="service-cart-item" data-id="${s.id}">
                <span>${s.name}</span>
                <button class="remove-service-btn" data-id="${s.id}">&times;</button>
            </div>
        `).join('');
    }


    // QUEUE MANAGEMENT EVENT LISTENERS
    if (callNextPaymentBtn) {
        callNextPaymentBtn.addEventListener('click', async () => {
            try {
                const calledPatient = await queueApi.callNext('Payment', 1);
                console.log('Called:', calledPatient);
            } catch (err) {
                alert(err.message);
                console.error(err);
            }
        });
    }


    // HELPER FUNCTIONS FOR DISPLAY PAGE 
    function updateNowServing(data) {
        nowServingNumberEl.textContent = data.queue_number;
        nowServingCounterEl.textContent = `COUNTER ${data.counter_number}`;
        nowServingNumberEl.classList.add('new-call');
        setTimeout(() => nowServingNumberEl.classList.remove('new-call'), 300);

        if (!recentlyCalled.includes(data.queue_number)) {
            recentlyCalled.unshift(data.queue_number);
        }
        if (recentlyCalled.length > MAX_RECENTLY_CALLED) {
            recentlyCalled.pop();
        }
        renderRecentlyCalled();
    }

    function renderRecentlyCalled() {
        if (!recentlyCalledListEl) return;
        if (recentlyCalled.length === 0) {
            recentlyCalledListEl.innerHTML = `<li class="placeholder-text">Waiting for next number...</li>`;
        } else {
            recentlyCalledListEl.innerHTML = recentlyCalled.map(num => `<li>${num}</li>`).join('');
        }
    }


    // LOGIN FORM
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            const credentials = {
                username: document.querySelector('#username-login').value,
                password: document.querySelector('#password-login').value
            }

            try {
                await authApi.loginUser(credentials)
                await showDisplayModal("Welcome back!", displayModal, displayTextEl, 'assets/checked.png', displayImageEl)
                sessionStorage.setItem('isLoggedIn', 'true')
                window.location.href = 'dashboard.html'
            } catch(err) {
                await showDisplayModal("Wrong credentials!", displayModal, displayTextEl, null, displayImageEl)
                loginForm.reset()
                console.error(err)
            }
        })
    }


    // LOGOUT BUTTON
    if(logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault()
            if(await showConfirmationModal('Are you sure you want to logout?', confirmationModal)) {
                sessionStorage.clear()
                window.location.href = 'index.html'
            }
        })
    }


    // CONFIRMATION MODAL
    const showConfirmationModal = (message, modal) => {
        return new Promise((resolve) => {
            modal.style.display = 'flex'
            confirmationMessageEl.innerHTML = message
            modal.addEventListener('click', (e) => {
                let choice = null
                const target = e.target
                
                if(target.classList.contains('yes-btn')) {
                    choice = true
                }

                if(target.classList.contains('cancel-btn')) {
                    choice = false
                }
                
                modal.style.display = 'none'
                resolve(choice)
            })
        })
    }
    // DISPLAY MODAL
    const showDisplayModal = (message, modal, messageEl, iconLink, imageEl) => {
        return new Promise((resolve) => {
            modal.style.display = 'flex'
            messageEl.innerHTML = message
            if(iconLink === null) {
                imageEl.style.display = 'none'
            } else {
                imageEl.style.display = 'block'
                imageEl.src = iconLink
            }
            modal.addEventListener('click', (e) => {
                let choice = null
                const target = e.target
                
                if(target.classList.contains('ok-btn')) {
                    choice = true
                    modal.style.display = 'none'
                }
                
                resolve(choice)
            })
        })
    }

    // AUDIO
    // Place this inside your DOMContentLoaded listener, with other constants
    const audioOverlay = document.querySelector('#audio-overlay');

    // Place this with your other event listeners
    if (audioOverlay) {
        audioOverlay.addEventListener('click', () => {
            audioOverlay.style.display = 'none';
            // You can optionally try to play a silent sound here to "prime" the audio
            playNotificationSound(); 
        }, { once: true }); // The listener will only run once
    }

    // And modify the playNotificationSound function slightly
    function playNotificationSound() {
        // Check if the overlay is gone. If not, don't play.
        if (audioOverlay && audioOverlay.style.display !== 'none') {
            console.warn("Audio blocked: User has not interacted with the overlay yet.");
            return;
        }
        const audio = new Audio('assets/notification.mp3');
        audio.play().catch(e => console.warn("Audio playback failed:", e));
    }

    // --- EVENT LISTENERS for Department Pages ---
    document.body.addEventListener('click', async (e) => {
        // Handle clicking on a patient in any worklist
        const worklistItem = e.target.closest('.worklist-item');
        if (worklistItem) {
            const visitId = worklistItem.dataset.visitId;
            loadAndRenderVisitDetails(visitId);
        }

        // Handle clicking an action button in the details view
        const actionButton = e.target.closest('.service-action .btn');
        if (actionButton) {
            const visitServiceId = actionButton.dataset.id;
            const action = actionButton.dataset.action;
            let newStatus = '';

            if (action === 'receive-specimen') newStatus = 'Specimen Received';
            if (action === 'complete-radiology') newStatus = 'Completed';
            // Add more actions here

            if (newStatus) {
                try {
                    await visitServiceApi.updateVisitServiceStatus(visitServiceId, newStatus);
                    // The socket event 'visit_status_updated' will trigger the refresh
                } catch (error) {
                    alert('Failed to update status: ' + error.message);
                }
            }
        }
    });





    

    if(window.location.pathname.endsWith("patients.html")){
        loadPatients()
    }

    if(window.location.pathname.endsWith("inventory.html")){
        loadMedicines()
    }

    if (window.location.pathname.endsWith("dashboard.html")) {
        loadDashboard();
    }

    if (window.location.pathname.endsWith("appointments.html")) {
        loadAppointments();
    }

    if (window.location.pathname.endsWith("services.html")) {
        loadServices();
    }

    if (window.location.pathname.endsWith("reception.html")) {
        renderSelectedPatient();
        loadQueues();
    }

    if (window.location.pathname.endsWith("display.html")) {
        renderRecentlyCalled();
    }

    if (window.location.pathname.endsWith("cashier.html")) {
        loadNowServing();
    }

    if (window.location.pathname.endsWith("laboratory.html")) {
        loadWorklist('Laboratory', labWorklistContainer);
    }
    if (window.location.pathname.endsWith("radiology.html")) {
        loadWorklist('Radiology', radioWorklistContainer);
    }

    // GATEKEEPER
    if(!window.location.pathname.endsWith("index.html") && !sessionStorage.getItem('isLoggedIn')){
        // alert('Session does not exist. Redirecting..')
        window.location.href = 'index.html'
    }
});