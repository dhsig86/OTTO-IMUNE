document.addEventListener('DOMContentLoaded', (event) => {
    function calculateTotalScore() {
        const form = document.getElementById('eligibility-form');
        if (!form) return;

        const formData = new FormData(form);
        let totalScore = 0;

        // Convert string values to integers and sum up the scores
        formData.forEach((value, key) => {
            const score = parseInt(value, 10);
            if (!isNaN(score)) {
                totalScore += score;
            }
        });

        const totalScoreElement = document.getElementById('total_score');
        if (totalScoreElement) {
            totalScoreElement.value = totalScore;
        }
    }

    function submitForm(event) {
        event.preventDefault();  // Prevent the default form submission

        const form = document.getElementById('eligibility-form');
        if (!form) return;

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
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            const totalScoreElement = document.getElementById('total_score');
            if (totalScoreElement) {
                totalScoreElement.value = result.total_score;
            }
            displayResult(result.total_score);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function displayResult(totalScore) {
        const resultDiv = document.getElementById('result');
        const resultMessage = document.getElementById('result-message');
        if (!resultDiv || !resultMessage) return;

        if (totalScore >= 14) {
            resultDiv.textContent = totalScore;
            resultDiv.classList.remove('red');
            resultDiv.classList.add('green');
            resultMessage.textContent = "Tem indicação para uso do Imunobiológico";
        } else {
            resultDiv.textContent = totalScore;
            resultDiv.classList.remove('green');
            resultDiv.classList.add('red');
            resultMessage.textContent = "Imunobiológico não indicado no momento";
        }
        resultDiv.classList.remove('hidden');
        resultMessage.classList.remove('hidden');
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
                printWindow.document.write('<p>' + document.querySelector(`label[for=${key}]`).innerText + ': ' + data[key] + '</p>');
            }
        });
        printWindow.document.write('<p>Pontuação Total: ' + data.total_score + '</p>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    function resetForm() {
        const form = document.getElementById('eligibility-form');
        if (form) {
            form.reset();
        }
        const totalScoreElement = document.getElementById('total_score');
        if (totalScoreElement) {
            totalScoreElement.value = '';
        }
        const resultDiv = document.getElementById('result');
        const resultMessage = document.getElementById('result-message');
        if (resultDiv) {
            resultDiv.classList.add('hidden');
        }
        if (resultMessage) {
            resultMessage.classList.add('hidden');
        }
    }

    const calculateButton = document.getElementById('calculate-button');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateTotalScore);
    }

    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', submitForm);
    }

    const printButton = document.getElementById('print-button');
    if (printButton) {
        printButton.addEventListener('click', () => {
            const formData = new FormData(document.getElementById('eligibility-form'));
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            data['total_score'] = document.getElementById('total_score').value;
            data['timestamp'] = new Date().toISOString();
            printResult(data);
        });
    }

    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetForm);
    }

    // Popup functionality
    function showPopup(imageSrc) {
        const popupContainer = document.getElementById('popup-container');
        const popupImage = document.getElementById('popup-image');
        if (popupContainer && popupImage) {
            popupImage.src = imageSrc;
            popupContainer.classList.remove('hidden');
        }
    }

    const openEvaPopup = document.getElementById('open-eva-popup');
    if (openEvaPopup) {
        openEvaPopup.addEventListener('click', () => {
            showPopup('images/eva.png');  // Certifique-se de que a imagem esteja na pasta correta
        });
    }

    const openPolypPopup = document.getElementById('open-polyp-popup');
    if (openPolypPopup) {
        openPolypPopup.addEventListener('click', () => {
            showPopup('images/polyp.png');  // Certifique-se de que a imagem esteja na pasta correta
        });
    }

    const openLundmckayPopup = document.getElementById('open-lundmckay-popup');
    if (openLundmckayPopup) {
        openLundmckayPopup.addEventListener('click', () => {
            showPopup('images/lundmckay.png');  // Certifique-se de que a imagem esteja na pasta correta
        });
    }

    const closePopup = document.getElementById('close-popup');
    if (closePopup) {
        closePopup.addEventListener('click', () => {
            const popupContainer = document.getElementById('popup-container');
            if (popupContainer) {
                popupContainer.classList.add('hidden');
            }
        });
    }

    // Help Popup functionality
    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            const helpPopupContainer = document.getElementById('help-popup-container');
            if (helpPopupContainer) {
                helpPopupContainer.classList.remove('hidden');
            }
        });
    }

    const closeHelpPopup = document.getElementById('close-help-popup');
    if (closeHelpPopup) {
        closeHelpPopup.addEventListener('click', () => {
            const helpPopupContainer = document.getElementById('help-popup-container');
            if (helpPopupContainer) {
                helpPopupContainer.classList.add('hidden');
            }
        });
    }
});
