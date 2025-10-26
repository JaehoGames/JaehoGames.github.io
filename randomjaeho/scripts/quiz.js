// quiz.js - 봇 방지 퀴즈 시스템

let quiz = {
    problem: '',
    correctAnswer: 0,
    type: 'anti-cheat', // 퀴즈 종류 ('anti-cheat', 'periodic')
    userAnswer: null,
    timer: null,
    timeout: 30000, // 30초 제한시간
    interval: null
};

/**
 * 간단한 수학 문제 생성
 */
function generateMathProblem() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];

    let problem, answer;

    switch (operator) {
        case '+':
            problem = `${num1} + ${num2}`;
            answer = num1 + num2;
            break;
        case '-':
            // 결과가 음수가 되지 않도록
            if (num1 < num2) {
                problem = `${num2} - ${num1}`;
                answer = num2 - num1;
            } else {
                problem = `${num1} - ${num2}`;
                answer = num1 - num2;
            }
            break;
        case '*':
            problem = `${num1} × ${num2}`;
            answer = num1 * num2;
            break;
    }

    quiz.problem = problem;
    quiz.correctAnswer = answer;
}

/**
 * 퀴즈 모달 표시
 * @param {string} type - 'anti-cheat' 또는 'periodic'
 */
function showQuiz(type = 'anti-cheat') {
    generateMathProblem();
    quiz.type = type; // 현재 퀴즈 종류 저장

    const quizModal = document.getElementById('quizModal');
    const quizProblem = document.getElementById('quizProblem');
    const quizAnswers = document.getElementById('quizAnswers');
    const quizSubmitButton = document.getElementById('quizSubmitButton');
    const title = quizModal.querySelector('h2');
    const paragraph = quizModal.querySelector('p');

    quizProblem.textContent = `${quiz.problem} = ?`;

    // 퀴즈 종류에 따라 안내 문구 변경
    if (type === 'periodic') {
        title.textContent = '🕒 자리 비움 방지 퀴즈';
        paragraph.textContent = '게임 진행을 위해 간단한 퀴즈를 풀어주세요.';
    } else { // anti-cheat
        title.textContent = '🤖 봇 방지 퀴즈';
        paragraph.textContent = '매크로 사용이 의심되어 퀴즈를 표시합니다. 정답을 맞혀주세요.';
    }

    // 답변 옵션 생성 (기존과 동일)
    const answers = new Set([quiz.correctAnswer]);
    while (answers.size < 4) {
        const wrongAnswer = quiz.correctAnswer + (Math.floor(Math.random() * 10) - 5);
        if (wrongAnswer !== quiz.correctAnswer && wrongAnswer >= 0) {
            answers.add(wrongAnswer);
        }
    }

    const shuffledAnswers = Array.from(answers).sort(() => Math.random() - 0.5);

    quizAnswers.innerHTML = '';
    shuffledAnswers.forEach(ans => {
        const button = document.createElement('button');
        button.classList.add('quiz-answer-button');
        button.textContent = ans;
        button.dataset.answer = ans;
        button.onclick = () => selectAnswer(button);
        quizAnswers.appendChild(button);
    });

    quiz.userAnswer = null;
    quizSubmitButton.disabled = true;
    quizModal.classList.add('show');
}

/**
 * 답변 선택 처리
 */
function selectAnswer(selectedButton) {
    document.querySelectorAll('.quiz-answer-button').forEach(btn => btn.classList.remove('selected'));
    selectedButton.classList.add('selected');
    quiz.userAnswer = parseInt(selectedButton.dataset.answer);
    document.getElementById('quizSubmitButton').disabled = false;
}

/**
 * 퀴즈 결과 처리
 * @param {boolean} isCorrect - 정답 여부
 * @param {boolean} [isTimeout=false] - 시간 초과 여부
 * @param {string} [type='anti-cheat'] - 퀴즈 종류.
 */
function handleQuizResult(isCorrect, isTimeout = false, type = 'anti-cheat') {
    if (quiz.timer) clearTimeout(quiz.timer);
    document.getElementById('quizModal').classList.remove('show');

    if (isCorrect) {
        showNotification('✅ 정답입니다! 감사합니다.', '#2ecc71');
    } else {
        const reason = isTimeout ? '시간 초과' : '오답';
        if (type === 'periodic') {
            // 주기적 퀴즈 페널티: 코인 2/3 손실 및 총 뽑기 횟수 초기화
            const penaltyCoins = Math.floor(stats.coins * (2 / 3));
            stats.coins -= penaltyCoins;
            stats.total = 0;
            updateStatsDisplay();
            showNotification(`❌ ${reason}입니다. 코인의 2/3 (${penaltyCoins.toLocaleString()}개)를 잃고, 총 뽑기 횟수가 초기화됩니다.`, '#e74c3c');
        } else {
            // 안티치트 퀴즈 페널티: 코인 1/4 손실
            const penalty = Math.floor(stats.coins / 4);
            stats.coins -= penalty;
            updateStatsDisplay();
            showNotification(`❌ ${reason}입니다. 코인 ${penalty.toLocaleString()}개를 잃었습니다.`, '#e74c3c');
        }
        // 페널티 적용 후, 사용자가 회피하지 못하도록 변경사항을 즉시 자동 저장합니다.
        if (typeof saveGameData === 'function') {
            saveGameData(false); // 알림 없이 조용히 저장
        }
    }
}