export const renderServices = (services, divContainer) => {
    divContainer.innerHTML = ``;

    if (services.length === 0) {
        divContainer.innerHTML = `<p style="text-align:center;">No services found. Add one to get started!</p>`;
        return;
    }

    const table = document.createElement('table');
    table.className = 'table services';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Requires Specimen?</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');

    services.forEach(service => {
        const row = document.createElement('tr');
        row.className = 'service-item';
        row.dataset.id = service.id;
        // Store all data in dataset attributes for easy editing
        Object.keys(service).forEach(key => {
            row.dataset[key] = service[key];
        });
        
        row.innerHTML = `
            <td>${service.name}</td>
            <td>${service.category}</td>
            <td>₱${parseFloat(service.price).toFixed(2)}</td>
            <td>${service.requires_specimen ? 'Yes' : 'No'}</td>
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