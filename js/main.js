import { levelQuestions, questionSize } from "./answers.js";

let NICKNAME = localStorage.getItem('nickname') || 'Player';
let CURRENT_LEVEL_QUESTIONS_ORDER = [];

let nicknameInput = document.querySelector('.nickname input');
nicknameInput.addEventListener('input', function () {
    NICKNAME = this.value;
    console.log(NICKNAME);
});

let startGameButtons = document.querySelectorAll('.levels button');
startGameButtons.forEach((item) => item.addEventListener('click', startLevel));

let taskContainer = document.querySelector('.task');
let answersContainer = document.querySelector('.answers');

function startLevel() {
    level = parseInt(this.textContent) - 1;
    createLevel1Task(level);
}

function createLevel(level) {
    let CURRENT_QUESTION_SCORE = 0;
    CURRENT_LEVEL_QUESTIONS_ORDER = createRandomIndexesArray(levelQuestions[level]);
    taskContainer.innerHTML = '';
    answersContainer.innerHTML = '';

    if (level == 0) {
        drawPictureItems(taskContainer, level, questionSize[level].options, CURRENT_LEVEL_QUESTIONS_ORDER[0]);
        drawPictureItems(answersContainer, level, questionSize[level].answers, CURRENT_LEVEL_QUESTIONS_ORDER[0]);
    }
}

function drawPictureItems(container, level, length, question) {
    let indexes = createRandomIndexesArray(length);
    for (let i = 0; i < indexes.length; i++) {
        container.append(createPictureItem(level, question, indexes[i]));
    }

    setDragListeners();
}

function createPictureItem(level, question, id) {
    let currentElement = document.createElement('img');
    currentElement.classList.add('option');
    currentElement.src = `data/level${level + 1}/question${question + 1}/${id + 1}.png`;
    currentElement.dataset.question = question;
    currentElement.dataset.level = level;
    currentElement.dataset.id = id;

    return currentElement;
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

            this.onmouseup = level1Validation;
        }
    });
}

let level1Validation = function () {
    let correctAnswer = this.dataset.id;
    let taskBlock = taskContainer.querySelector(`img[data-id="${correctAnswer}"]`);

    if (objectIntersectionArea(taskBlock, this)) {
        taskBlock.classList.add('done');
        this.remove();
    } else {
        answersContainer.append(createPictureItem(parseInt(this.dataset.level), parseInt(this.dataset.question), parseInt(this.dataset.id)));
        setDragListeners();
        this.remove();
    }

    document.onmousemove = null;
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

    return [rightLeft, bottomTop, leftRight, topBottom].every((measure) => measure>staticSide*0.5);
}

function moveAt(obj, ev) {
    obj.style.left = ev.pageX - obj.offsetWidth / 2 + 'px';
    obj.style.top = ev.pageY - obj.offsetHeight / 2 + 'px';
}

function createRandomIndexesArray(l) {
    return Array.from({ length: l }, (v, i) => i).map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('nickname', NICKNAME);
});

createLevel(0);
setDragListeners();