// quiz.js - 봇 방지 퀴즈 시스템

let quiz = {
    problem: '',
    correctAnswer: 0,
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
 */
function showQuiz() {
    generateMathProblem();

    const quizModal = document.getElementById('quizModal');
    const quizProblem = document.getElementById('quizProblem');
    const quizAnswers = document.getElementById('quizAnswers');
    const quizSubmitButton = document.getElementById('quizSubmitButton');

    quizProblem.textContent = `${quiz.problem} = ?`;

    // 답변 옵션 생성
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

    // 시간 초과 타이머
    quiz.timer = setTimeout(() => handleQuizResult(false, true), quiz.timeout);
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
 */
function handleQuizResult(isCorrect, isTimeout = false) {
    clearTimeout(quiz.timer);
    document.getElementById('quizModal').classList.remove('show');

    if (isCorrect) {
        showNotification('✅ 정답입니다! 감사합니다.', '#2ecc71');
    } else {
        const penalty = Math.floor(stats.coins / 4);
        stats.coins -= penalty;
        updateStatsDisplay();
        saveGameData();
        const reason = isTimeout ? '시간 초과' : '오답';
        showNotification(`❌ ${reason}입니다. 코인 ${penalty.toLocaleString()}개를 잃었습니다.`, '#e74c3c');
    }
}