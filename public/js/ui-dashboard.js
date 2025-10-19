export const renderConsultationsChart = (labels, data, chartContainer) => {
    const ctx = chartContainer.getContext('2d')
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Consultations',
                data: data,
                backgroundColor: 'rgba(76, 72, 255, 0.5)',
                borderColor: 'rgba(76, 72, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })

    return chartContainer
}