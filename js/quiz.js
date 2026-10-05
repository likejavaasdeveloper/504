(function () {
  "use strict";

  var QUESTIONS_PER_ATTEMPT = 10;
  var lesson = window.LESSON_DATA;
  var state = { questions: [], currentIndex: 0, correctAnswers: 0, answered: false };

  var elements = {
    lessonLabel: document.getElementById("lesson-label"),
    lessonTitle: document.getElementById("lesson-title"),
    lessonDescription: document.getElementById("lesson-description"),
    quizView: document.getElementById("quiz-view"),
    resultView: document.getElementById("result-view"),
    progress: document.getElementById("progress"),
    progressBar: document.getElementById("progress-bar"),
    questionNumber: document.getElementById("question-number"),
    questionText: document.getElementById("question-text"),
    choices: document.getElementById("choices"),
    feedback: document.getElementById("feedback"),
    nextButton: document.getElementById("next-button"),
    correctCount: document.getElementById("correct-count"),
    scorePercent: document.getElementById("score-percent"),
    resultMessage: document.getElementById("result-message"),
    tryAgainButton: document.getElementById("try-again-button")
  };

  function shuffle(items) {
    var copy = items.slice();
    for (var index = copy.length - 1; index > 0; index -= 1) {
      var randomIndex = Math.floor(Math.random() * (index + 1));
      var temporary = copy[index];
      copy[index] = copy[randomIndex];
      copy[randomIndex] = temporary;
    }
    return copy;
  }

  function createAttempt() {
    state.questions = shuffle(lesson.questions).slice(0, QUESTIONS_PER_ATTEMPT).map(function (question) {
      var questionCopy = Object.assign({}, question);
      questionCopy.choices = shuffle(question.choices);
      return questionCopy;
    });
    state.currentIndex = 0;
    state.correctAnswers = 0;
    state.answered = false;
  }

  function renderQuestion() {
    var question = state.questions[state.currentIndex];
    var questionNumber = state.currentIndex + 1;
    state.answered = false;
    elements.progress.textContent = "Question " + questionNumber + " of " + QUESTIONS_PER_ATTEMPT;
    elements.progressBar.style.width = (questionNumber / QUESTIONS_PER_ATTEMPT) * 100 + "%";
    elements.questionNumber.textContent = "Question " + questionNumber;
    elements.questionText.textContent = question.question;
    elements.choices.innerHTML = "";
    elements.feedback.hidden = true;
    elements.feedback.className = "feedback";
    elements.nextButton.hidden = true;

    question.choices.forEach(function (choice, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.dataset.choiceId = choice.id;
      button.setAttribute("aria-label", "Choice " + String.fromCharCode(65 + index) + ": " + choice.text);
      button.innerHTML = '<span class="choice-marker" aria-hidden="true">' + String.fromCharCode(65 + index) + '</span><span>' + choice.text + "</span>";
      button.addEventListener("click", function () { evaluateAnswer(choice.id, button); });
      elements.choices.appendChild(button);
    });
  }

  function evaluateAnswer(selectedId, selectedButton) {
    if (state.answered) return;
    state.answered = true;
    var question = state.questions[state.currentIndex];
    var isCorrect = selectedId === question.correctAnswer;
    if (isCorrect) state.correctAnswers += 1;

    Array.prototype.forEach.call(elements.choices.children, function (button) {
      button.disabled = true;
      if (button.dataset.choiceId === question.correctAnswer) button.classList.add("is-correct");
    });
    selectedButton.classList.add(isCorrect ? "is-correct" : "is-incorrect", "is-selected");
    showFeedback(question, isCorrect);
    elements.nextButton.textContent = state.currentIndex === QUESTIONS_PER_ATTEMPT - 1 ? "See your result" : "Next question →";
    elements.nextButton.hidden = false;
  }

  function showFeedback(question, isCorrect) {
    elements.feedback.className = "feedback " + (isCorrect ? "is-correct" : "is-incorrect");
    var title = isCorrect ? "✓ Correct!" : "✗ Incorrect";
    var correctText = getChoiceText(question, question.correctAnswer);
    elements.feedback.innerHTML = '<p class="feedback-title">' + title + "</p>" +
      (isCorrect ? "" : "<p><strong>Correct answer:</strong> " + correctText + "</p>") +
      "<p>" + question.explanation + "</p>" +
      '<p class="example-label"><strong>Example:</strong> ' + question.example + "</p>";
    elements.feedback.hidden = false;
  }

  function getChoiceText(question, choiceId) {
    return question.choices.filter(function (choice) { return choice.id === choiceId; })[0].text;
  }

  function showResult() {
    var percentage = Math.round((state.correctAnswers / QUESTIONS_PER_ATTEMPT) * 100);
    elements.quizView.hidden = true;
    elements.resultView.hidden = false;
    elements.correctCount.textContent = "Correct Answers: " + state.correctAnswers + " / " + QUESTIONS_PER_ATTEMPT;
    elements.scorePercent.textContent = "Score: " + percentage + "%";
    elements.resultMessage.textContent = percentage >= 80 ? "Excellent work. Keep using these words in your own sentences." : percentage >= 60 ? "Good effort. Review the feedback and try the lesson again." : "Keep practicing. A fresh attempt can help the words become familiar.";
    elements.tryAgainButton.focus();
  }

  function nextQuestion() {
    if (!state.answered) return;
    if (state.currentIndex === QUESTIONS_PER_ATTEMPT - 1) {
      showResult();
      return;
    }
    state.currentIndex += 1;
    renderQuestion();
  }

  function startAttempt() {
    createAttempt();
    elements.quizView.hidden = false;
    elements.resultView.hidden = true;
    renderQuestion();
  }

  function initialize() {
    if (!lesson || !Array.isArray(lesson.questions) || lesson.questions.length < QUESTIONS_PER_ATTEMPT) {
      elements.questionText.textContent = "This lesson is not available yet.";
      return;
    }
    elements.lessonLabel.textContent = lesson.label;
    elements.lessonTitle.textContent = lesson.title;
    elements.lessonDescription.textContent = lesson.description;
    elements.nextButton.addEventListener("click", nextQuestion);
    elements.tryAgainButton.addEventListener("click", startAttempt);
    startAttempt();
  }

  initialize();
}());
