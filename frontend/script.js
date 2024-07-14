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
            const score = parseInt(value, 10);
            data[key] = isNaN(score) ? 0 : score;
        });

        // Adiciona data e hora da submissão
        data['timestamp'] = new Date().toISOString();

        fetch('https://nucalapp24-20166d95612a.herokuapp.com/submit', { // Atualize com o URL do seu Heroku
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            document.getElementById('total_score').value = result.total_score;
            printResult(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function printResult(data) {
        let printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Resultado do Questionário</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css" type="text/css" />');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Resultado do Questionário de Elegibilidade</h1>');
        printWindow.document.write('<p>Data: ' + new Date(data.timestamp).toLocaleString() + '</p>');
        Object.keys(data).forEach(key => {
            if (key !== 'timestamp') {
                printWindow.document.write('<p>' + key + ': ' + data[key] + '</p>');
            }
        });
        printWindow.document.write('<p>Pontuação Total: ' + data.total_score + '</p>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', updateScore);
    });
    document.querySelector('button').addEventListener('click', submitForm);
});
