export const renderQueue = (queueItems, container) => {
    if (!queueItems || queueItems.length === 0) {
        container.innerHTML = `<p class="placeholder-text">The queue is empty.</p>`;
        return;
    }

    container.innerHTML = queueItems.map(item => `
        <div class="queue-item">
            <span class="queue-item-number">${item.queue_number}</span>
            <span class="queue-item-name">${item.patient_name}</span>
        </div>
    `).join('');
};