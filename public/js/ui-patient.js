
export const renderPatients = (patients, divContainer) => {
    divContainer.innerHTML = ``

    if(patients.length === 0) {
        divContainer.innerHTML = `<p style="text-align:center;">No patients found.</p>`
        return
    }

    const table = document.createElement('table');
    table.className = 'table patient';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>  <!-- The body is initially empty -->
    `;
    const tbody = table.querySelector('tbody');

    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.className = 'patient-item';
        row.dataset.id = patient.id;
        
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${new Date(patient.dob).toLocaleDateString()}</td>
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