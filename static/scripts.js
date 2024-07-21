const cardNames = [
    "광대", "마법사", "여사제", "여제", "황제", "교황", "연인",
    "전차", "힘", "은둔자", "운명의수레바퀴", "정의", "매달린 남자",
    "죽음", "절제", "악마", "탑", "별", "달", "태양", "심판", "세계"
];

const cardImages = cardNames.map(() => "static/images/card.jpg");

let drawnCardNames = [];

// 비동기 sleep 함수 정의
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupDeck() {
    const numCards = cardImages.length;
    const deck = document.getElementById('deck');
    const cardWidth = 100;
    const overlap = 40;

    for (let i = 0; i < numCards; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        const img = document.createElement('img');
        img.src = cardImages[i];
        const label = document.createElement('div');
        label.className = 'label';
        card.appendChild(img);
        card.appendChild(label);

        const offsetX = (i * overlap) - ((numCards - 1) * overlap) / 2;
        card.style.left = `calc(50% + ${offsetX}px)`;
        card.style.top = `calc(50% - ${75}px)`;

        deck.appendChild(card);
    }
}

function drawCards() {
    const cards = document.querySelectorAll('.card');
    const selectedIndices = [];
    while (selectedIndices.length < 5) {
        const randIndex = Math.floor(Math.random() * cards.length);
        if (!selectedIndices.includes(randIndex)) {
            selectedIndices.push(randIndex);
        }
    }

    const spacing = 30;

    selectedIndices.forEach((index, i) => {
        const card = cards[index];
        setTimeout(() => {
            const offsetX = (i - 2) * spacing;
            card.style.transform = `translate(${offsetX}px, -200px)`;
            card.style.zIndex = 10 + i;
            card.querySelector('.label').innerText = cardNames[index];
        }, i * 500);
    });

    drawnCardNames = selectedIndices.map(index => cardNames[index]); // 저장된 카드 이름
    document.getElementById('drawButton').style.display = 'none';
    document.getElementById('resultButton').style.display = 'inline-block';
}


async function doAskResult() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // 로딩 애니메이션 표시

    try {
        const response = await fetch('http://127.0.0.1:8000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ card_names: drawnCardNames }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response from server:', data);

        // 서버에서 받은 URL이 유효한지 확인
        if (data.result_page_url) {
            // 페이지 이동을 위한 URL 설정
            console.log("123");
            window.location.href = data.result_page_url;
        } else {
            console.error('Invalid URL received:', data);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loader.style.display = 'none'; // 로딩 애니메이션 숨기기
    }
}
setupDeck();
document.getElementById('drawButton').addEventListener('click', drawCards);
document.getElementById('resultButton').addEventListener('click', doAskResult);