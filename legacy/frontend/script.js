document.addEventListener('DOMContentLoaded', (event) => {
    function calculateTotalScore() {
        const form = document.getElementById('eligibility-form');
        if (!form) return;

        const formData = new FormData(form);
        let totalScore = 0;

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
        event.preventDefault();

        const form = document.getElementById('eligibility-form');
        if (!form) return;

        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            const score = parseInt(value, 10);
            data[key] = isNaN(score) ? 0 : score;
        });

        data['timestamp'] = new Date().toISOString();

        fetch('https://nucalapp24-20166d95612a.herokuapp.com/submit', {
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
                printWindow.document.write('<p>' + key + ': ' + data[key] + '</p>');
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

    function showHelp() {
        alert('Passo a passo:\n\n1. Preencha todos os campos do formulário.\n2. Clique em "Calcular" para calcular a pontuação total.\n3. Clique em "Enviar" para enviar os dados.\n4. Use o botão "Imprimir" para imprimir os resultados.\n5. Use o botão "Resetar" para limpar o formulário.\n6. Clique nos títulos para acessar facilidades ( links, Imagens, calculadoras) \n7. Válido para o SNOt-22, EVA, Escore Polipo Nasal, Escore Lund-Mackay');
    }

    // Função para mostrar o popup com a imagem correta
    function showPopup(imageSrc) {
        const popup = document.getElementById('popup-container');
        const popupImage = document.getElementById('popup-image');
        if (popup && popupImage) {
            popupImage.src = imageSrc;
            popup.classList.remove('hidden');
        }
    }

    // Função para fechar o popup
    function closePopup() {
        const popup = document.getElementById('popup-container');
        if (popup) {
            popup.classList.add('hidden');
        }
    }

    // Adicionar eventos de clique aos botões e ícones
    document.getElementById('close-popup').addEventListener('click', closePopup);

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

    // Abrir popup ao clicar nos ícones de informação
    const openEvaPopup = document.getElementById('open-eva-popup');
    if (openEvaPopup) {
        openEvaPopup.addEventListener('click', () => {
            showPopup('images/eva.png');
        });
    }

    const openPolypPopup = document.getElementById('open-polyp-popup');
    if (openPolypPopup) {
        openPolypPopup.addEventListener('click', () => {
            showPopup('images/polyp.png');
        });
    }

    const openLundMckayPopup = document.getElementById('open-lundmckay-popup');
    if (openLundMckayPopup) {
        openLundMckayPopup.addEventListener('click', () => {
            showPopup('images/lundmckay.jpeg');
        });
    }

    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.addEventListener('click', showHelp);
    }
});
