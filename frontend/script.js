document.addEventListener('DOMContentLoaded', (event) => {
    function updateScore() {
        const form = document.getElementById('eligibility-form');
        const formData = new FormData(form);

        let totalScore = 0;

        // Convert string values to integers and sum up the scores
        formData.forEach((value, key) => {
            const score = parseInt(value, 10);
            if (!isNaN(score)) {
                totalScore += score;
            }
        });

        document.getElementById('total_score').value = totalScore;
    }

    function submitForm() {
        const form = document.getElementById('eligibility-form');
        const formData = new FormData(form);

        const data = {};
        formData.forEach((value, key) => {
            data[key] = parseInt(value, 10);
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

    // Attach the event listeners
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', updateScore);
    });
    document.querySelector('button').addEventListener('click', submitForm);
});
