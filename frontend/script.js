function submitForm() {
    const form = document.getElementById('eligibility-form');
    const formData = new FormData(form);
    
    const data = {};
    formData.forEach((value, key) => {
        data[key] = parseInt(value);
    });

    fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById('total_score').value = result.total_score;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
