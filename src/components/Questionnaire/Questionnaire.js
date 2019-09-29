import React from 'react';
import ChoiceQuestion from './ChoiceQuestion';
import WritingQuestion from './WritingQuestion'
import FinalPage from './FinalPage'
import axios from '../../axios-questions';

class Questionnaire extends React.Component {
    state = {
        questions: [],
        currentQuestion: 0,
        numberOfQuestions: 0,
        remainingQuestions: 0,
        numberOfAtempts: 1,
    }

    componentDidMount() {
        axios.get(this.props.category + "?numberOfWords=5")
            .then(response => {
                const questions = response.data
                    .map(question => this.buildQuestion(question));
                const numberOfQuestions = questions.length;
                const remainingQuestions = questions.length;

                this.setState({
                    questions: questions,
                    currentQuestion: 0,
                    numberOfAtempts: 1,
                    numberOfQuestions: numberOfQuestions,
                    remainingQuestions: remainingQuestions
                });
            }).finally(response => {
            })
    }

    buildQuestion(question) {
        return { ...question, answeredCorrectly: false };
    }

    handleAnswerChoice(answerWasCorrect) {
        let remainingQuestions = this.state.remainingQuestions;
        if (answerWasCorrect) {
            const questionsToUpdate = this.state.questions.slice();
            questionsToUpdate[this.state.currentQuestion].answeredCorrectly = true;
            remainingQuestions = remainingQuestions - 1;
            this.setState({ questions: questionsToUpdate, remainingQuestions: remainingQuestions });
        }

        if (remainingQuestions > 0) {
            const newCurrentQuestion = this.findNextQuestion();
            const atempts = this.state.numberOfAtempts + 1;
            this.setState({ currentQuestion: newCurrentQuestion, numberOfAtempts: atempts });
        }
    }

    getStatistics() {
        let total = this.state.questions.length;
        let answered = this.state.questions.filter(q => q.answeredCorrectly === true).length;
        return {
            total: total,
            answered: answered,
            remaining: total - answered
        }
    }

    findNextQuestion() {
        let newCurrentQuestion = this.findNextQuestionToAnswer(this.state.currentQuestion);
        return newCurrentQuestion;
    }

    findNextQuestionToAnswer(questionNumber) {
        let newCurrentQuestion = questionNumber + 1;
        if (newCurrentQuestion >= this.state.numberOfQuestions) {
            newCurrentQuestion = 0;
        }

        if (this.questionAlreadyAnswered(newCurrentQuestion)) {
            newCurrentQuestion = this.findNextQuestionToAnswer(newCurrentQuestion);
        }

        return newCurrentQuestion;
    }

    questionAlreadyAnswered(questionNumber) {
        return this.state.questions[questionNumber].answeredCorrectly;
    }

    showQuestion(questionData) {
        if (this.props.category === "/writingQuestions") {
            return this.showWritingQuestion(questionData);
        }
        if (this.props.category === "/motherLanguageChoiceQuestions" || this.props.category === "/foreignLanguageChoiceQuestions") {
            return this.showChoiceQuestion(questionData);
        }
    }

    showChoiceQuestion(questionData) {
        let variants = questionData.variants.slice();
        variants.push(questionData.answer)
        variants = [...new Set(variants)]
        variants.sort((a, b) => { return 0.5 - Math.random() });

        let statistics = this.getStatistics();

        let doneBarWidth = Math.round(100 * (statistics.answered / statistics.total));

        return <div>
            <ChoiceQuestion
                question={questionData.question}
                correctAnswer={questionData.answer}
                variants={variants}
                answered={(answerWasCorrect) => this.handleAnswerChoice(answerWasCorrect)} />

            <div style={{ marginTop: 20 }} className="d-flex justify-content-center">
                <div className="progress" style={{ width: 1000 }}>
                    <div className="progress-bar progress-bar-striped" role="progressbar" style={{ width: doneBarWidth + '%' }}>
                    </div>
                </div>
            </div>
        </div>;
    }

    showWritingQuestion(questionData) {
        return (
            <WritingQuestion
                question={questionData.question}
                validAnswers={questionData.validAnswers}
                answered={(answerWasCorrect) => this.handleAnswerChoice(answerWasCorrect)}/>);
    }

    finishQuestionnaire() {
        setTimeout(() => this.props.answeredToQuestions(), 6000);
        return (<FinalPage score={this.calculateFinalScore()} />);
    }

    calculateFinalScore() {
        return this.state.numberOfQuestions / this.state.numberOfAtempts;
    }

    render() {
        const questionData = this.state.questions[this.state.currentQuestion];
        let questionnaire = null;

        if (this.state.numberOfQuestions === 0) {
            questionnaire =
                <div style={{ marginTop: 40 }} className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
        }
        else if (this.state.remainingQuestions > 0) {
            questionnaire = this.showQuestion(questionData);
        }
        else {
            questionnaire = this.finishQuestionnaire();
        }

        return (questionnaire);
    }
}

export default Questionnaire;