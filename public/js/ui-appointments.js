

export const renderAppointments = (appointments, divContainer) => {
    divContainer.innerHTML = ``

    if(appointments.length === 0) {
        divContainer.innerHTML = `<p style="text-align:center;">No appointments found.</p>`
        return
    }

    const table = document.createElement('table');
    table.className = 'table appointments';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Patient ID</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.className = 'appointment-item';
        row.dataset.id = appointment.id;
        
        row.innerHTML = `
            <th>${appointment.id}</th>
            <th>${appointment.patient_id}</th>
            <th>${appointment.appointment_datetime}</th>
            <th>${appointment.status}</th>
            <th>${appointment.reason}</th>
            <th>${appointment.notes}</th>
            <td>
                <div class="action-buttons">
                    <button class="btn edit-btn">Edit</button>
                    <button class="btn delete-btn">Delete</button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
    
    divContainer.appendChild(table);
}