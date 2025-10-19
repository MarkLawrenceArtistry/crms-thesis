

export const renderMedicines = (medicines, divContainer) => {
    divContainer.innerHTML = ``

    if(medicines.length === 0) {
        divContainer.innerHTML = `<p style="text-align:center;">No medicines found.</p>`
        return
    }

    const table = document.createElement('table');
    table.className = 'table medicines';
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    medicines.forEach(medicine => {
        const row = document.createElement('tr');
        row.className = 'medicine-item';
        row.dataset.id = medicine.id;
        
        row.innerHTML = `
            <td>${medicine.id}</td>
            <td>${medicine.name}</td>
            <td>${medicine.quantity}</td>
            <td>${medicine.description}</td>
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