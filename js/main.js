import { answers, levelQuestions, maxAnimTime, questionSize } from "./answers.js";

let NICKNAME = JSON.parse(localStorage.getItem('nickname')) || 'Player';
let RECORDS = JSON.parse(localStorage.getItem('records')) || [[], [], []];
let CURRENT_LEVEL_QUESTIONS_ORDER = [];
let CURRENT_QUESTION_COUNTER = 0;
let CURRENT_LEVEL_TIMER;
let CURRENT_LEVEL_TIME = 0;

let endGameScreen = document.querySelector('.endLevelScreen');
let timeReport = document.querySelector('span.time');
let gameScreen = document.querySelector('.gameContainer');
let backToMenuButton = document.querySelector('.backToMenu');
let ratingScreen = document.querySelector('.ratingScreen')

let backButtons = document.querySelectorAll('.backButton');
backButtons.forEach((btn) => {
    btn.addEventListener('click', closeCurrentTab);
});

function closeCurrentTab() {
    this.parentElement.classList.remove('active');
}

backToMenuButton.addEventListener('click', () => {
    endGameScreen.classList.remove('active');
    gameScreen.classList.remove('active');
});

let ratingButton = document.querySelector('.ratingButton');
ratingButton.addEventListener('click', () => {
    showRating(0);
    ratingScreen.classList.add('active');
});

let showRatingButtons = document.querySelectorAll('.ratingBlock nav span');

showRatingButtons.forEach((item) => {
    item.addEventListener('click', function() {
        showRating(parseInt(this.textContent[this.textContent.length - 1]) - 1);
    });
});

let ratingList = document.querySelector('.rating');

function showRating(level) {
    showRatingButtons.forEach((item) => item.classList.remove('selected'));
    showRatingButtons[level].classList.add('selected');
    let bestPlayersHTML = '';
    RECORDS[level].forEach((record, index) => {
        bestPlayersHTML += `<p>${index + 1}. ${record.nick} - ${record.score}</p>`
    });

    ratingList.innerHTML = bestPlayersHTML ? bestPlayersHTML : '<p>Список лучших игроков пока пуст :(</p>';
}

let nicknameInput = document.querySelector('.nickname input');
nicknameInput.addEventListener('input', function () {
    NICKNAME = this.value;
    console.log(NICKNAME);
});

function addBestPlayer(level, score) {
    let bestPlayers = RECORDS[level];
    let topPlayers = RECORDS[level].map((value) => value.nick);
    if (topPlayers.includes(NICKNAME)) {
        if (bestPlayers.filter((value) => value.nick == NICKNAME)[0].score > score) {
            bestPlayers = bestPlayers.filter((value) => value.nick != NICKNAME)
            bestPlayers.push({ 'nick': NICKNAME, 'score': score });
        }
    } else {
        bestPlayers.push({ 'nick': NICKNAME, 'score': score });
    }
    bestPlayers = bestPlayers.sort((a, b) => {
        return a.score > b.score;
    });
    bestPlayers = bestPlayers.slice(0, 5);
    RECORDS[level] = bestPlayers;
}

let startGameButtons = document.querySelectorAll('.levels button');
startGameButtons.forEach((item) => item.addEventListener('click', startLevel));

let taskContainer = document.querySelector('.task');
let answersContainer = document.querySelector('.answers');

let levelP = document.querySelector('p.level');
let questionP = document.querySelector('p.question');
let timerP = document.querySelector('p.timer');

function startLevel() {
    let level = parseInt(this.textContent) - 1;
    createLevel(level);
    gameScreen.classList.add('active');
}

function startTimer() {
    clearInterval(CURRENT_LEVEL_TIMER);
    CURRENT_LEVEL_TIME = 0;
    CURRENT_LEVEL_TIMER = setInterval(() => {
        CURRENT_LEVEL_TIME += 1;
        timerP.textContent = formatTime(CURRENT_LEVEL_TIME);
    }, 1000)
}

function formatTime(initial) {
    let minutes = Math.floor(initial / 60);
    let seconds = initial % 60;

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${seconds}`

}

function createLevel(level) {
    CURRENT_QUESTION_COUNTER = 0;
    CURRENT_LEVEL_QUESTIONS_ORDER = createRandomIndexesArray(levelQuestions[level]);
    startTimer();
    levelP.textContent = `Level ${level + 1}`;
    createQuestion(level, CURRENT_LEVEL_QUESTIONS_ORDER[CURRENT_QUESTION_COUNTER]);
}

function createQuestion(level, question) {
    taskContainer.innerHTML = '';
    answersContainer.innerHTML = '';

    questionP.textContent = `Question ${CURRENT_QUESTION_COUNTER + 1}/${levelQuestions[level]}`;

    drawPictureItems(taskContainer, level, questionSize[level].options, question);
    drawPictureItems(answersContainer, level, questionSize[level].answers, question);
}

function drawPictureItems(container, level, length, question) {
    container.style.background = 'none';
    console.log(1);
    let blank = false;
    if (!(level == 0 || container == answersContainer)) {
        container.style.background = `url('data/level${level + 1}/question${question + 1}/q.jpg')`;
        container.style.backgroundSize = 'cover';
        blank = true;
    }
    let indexes = createRandomIndexesArray(length);
    for (let i = 0; i < indexes.length; i++) {
        container.append(createPictureItem(level, question, indexes[i], blank));
    }
    if (!(level == 0 || container == answersContainer)) {
        container.lastElementChild.dataset.id = answers[level - 1][question];
    }
    setDragListeners();
}

function createPictureItem(level, question, id, isBlank) {
    let fileType = level == 0 ? 'png' : 'jpg';
    let adding = level == 0 ? '' : 'a';
    let currentElement = document.createElement('img');
    currentElement.classList.add('option');
    if (isBlank) {
        currentElement.classList.add('blank');
        currentElement.src = 'data/blank.png';
        currentElement.dataset.id = -1;
    }
    if (!isBlank) {
        currentElement.src = `data/level${level + 1}/question${question + 1}/${adding}${id + 1}.${fileType}`;
        currentElement.dataset.id = id;
        if (level == 2) {
            let timeToChange = getRandomAnimationTime();
            currentElement.style.animation = `fadeAnim ${timeToChange}s ease infinite`;
            setTimeout(randomChange, timeToChange*1000, currentElement, timeToChange)
        }
    }
    currentElement.dataset.question = question;
    currentElement.dataset.level = level;


    return currentElement;
}

function randomChange(currentElement, timeToChange) {
    console.log(timeToChange);
    if (currentElement.style.position!='absolute') {
        let randomIndex = Math.floor(Math.random()*questionSize[2].answers);
        currentElement.src = currentElement.src.substring(0, currentElement.src.lastIndexOf('/')) + `/a${randomIndex+1}.jpg`;
        currentElement.dataset.id = randomIndex;
        setTimeout(randomChange, timeToChange*1000, currentElement, timeToChange);
    }
}

function getRandomAnimationTime() {
    return 1 + maxAnimTime * Math.random();
}

function setDragListeners() {
    let draggingElements = Array.from(answersContainer.children);
    draggingElements.forEach((element) => {
        element.ondragstart = () => false;
        element.onmousedown = function (e) {

            this.style.width = this.getBoundingClientRect().width + 'px';
            this.style.height = this.getBoundingClientRect().height + 'px';
            this.style.position = 'absolute';

            moveAt(this, e);

            document.body.appendChild(this);

            this.style.zIndex = 1000;

            document.onmousemove = (e) => { moveAt(this, e); }

            this.onmouseup = this.dataset.level == '0' ? level1Validation : level23Validation;
        }
    });
}

let level23Validation = function () {
    let taskBlock = taskContainer.lastElementChild;
    if (objectIntersectionArea(taskBlock, this) && parseInt(this.dataset.id) + 1 == answers[parseInt(this.dataset.level) - 1][parseInt(this.dataset.question)]) {
        this.remove();
        if (CURRENT_QUESTION_COUNTER < CURRENT_LEVEL_QUESTIONS_ORDER.length - 1) {
            CURRENT_QUESTION_COUNTER++;
            createQuestion(parseInt(this.dataset.level), CURRENT_LEVEL_QUESTIONS_ORDER[CURRENT_QUESTION_COUNTER]);
        } else {
            clearInterval(CURRENT_LEVEL_TIMER);
            addBestPlayer(parseInt(this.dataset.level), CURRENT_LEVEL_TIME);
            showEndLevel();
        }
    } else {
        answersContainer.append(createPictureItem(parseInt(this.dataset.level), parseInt(this.dataset.question), parseInt(this.dataset.id)));
        setDragListeners();
        this.remove();
    }
}

let level1Validation = function () {
    let correctAnswer = parseInt(this.dataset.id);
    let taskBlock = taskContainer.querySelector(`img[data-id="${correctAnswer}"]`);

    if (objectIntersectionArea(taskBlock, this)) {
        taskBlock.classList.add('done');
        this.remove();
        if (Array.from(taskContainer.children).every((item) => item.classList.contains('done'))) {
            if (CURRENT_QUESTION_COUNTER < CURRENT_LEVEL_QUESTIONS_ORDER.length - 1) {
                CURRENT_QUESTION_COUNTER++;
                createQuestion(parseInt(this.dataset.level), CURRENT_LEVEL_QUESTIONS_ORDER[CURRENT_QUESTION_COUNTER]);
            } else {
                clearInterval(CURRENT_LEVEL_TIMER);
                addBestPlayer(parseInt(this.dataset.level), CURRENT_LEVEL_TIME);
                showEndLevel();
            }
        }
    } else {
        answersContainer.append(createPictureItem(parseInt(this.dataset.level), parseInt(this.dataset.question), parseInt(this.dataset.id)));
        setDragListeners();
        this.remove();
    }

    document.onmousemove = null;
}

function showEndLevel() {
    endGameScreen.classList.add('active');
    timeReport.textContent = CURRENT_LEVEL_TIME;
}

function objectIntersectionArea(staticObj, dynamicObj) {
    let staticCoords = staticObj.getBoundingClientRect();
    let dynamicCoords = dynamicObj.getBoundingClientRect();

    console.log(staticCoords, dynamicCoords);

    let rightLeft = staticCoords.right - dynamicCoords.left;
    let bottomTop = staticCoords.bottom - dynamicCoords.top;
    let leftRight = dynamicCoords.right - staticCoords.left;
    let topBottom = dynamicCoords.bottom - staticCoords.top;

    let staticSide = staticCoords.right - staticCoords.left;

    return [rightLeft, bottomTop, leftRight, topBottom].every((measure) => measure > staticSide * 0.5);
}

function moveAt(obj, ev) {
    obj.style.left = ev.pageX - obj.offsetWidth / 2 + 'px';
    obj.style.top = ev.pageY - obj.offsetHeight / 2 + 'px';
}

function createRandomIndexesArray(l) {
    return Array.from({ length: l }, (v, i) => i).map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('nickname', JSON.stringify(NICKNAME));
    localStorage.setItem('records', JSON.stringify(RECORDS));
});