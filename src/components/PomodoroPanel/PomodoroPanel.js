import React from 'react';
import TimerPanel from '../Timer/TimerPanel';
import Questionnaire from '../Questionnaire/Questionnaire';
import DomainChooser from '../DomainChooser/DomainChooser';
import axios from '../../axios-questions';

class PomodoroPanel extends React.Component {
    constructor () {
        super()
        axios.get("/categories.json")
            .then(response => this.setState({ categories: response.data }));
    }

    state = {
        iterationFinished: false,
        categories: ['banking'],
        chosenCategory: ''
    }

    timesUp = () => {
        this.setState({ iterationFinished: true });
    }

    answeredToQuestions = () => {
        window.location.href = "/";
    }

    handleDomainChoice = (choice) => {
        this.setState({ chosenCategory: choice });
    }

    displayPanel() {
        if (!this.state.iterationFinished)
            return <TimerPanel timesUp={this.timesUp} />;
        else if (!this.state.chosenCategory) {
            return <DomainChooser
                onSkip={this.answeredToQuestions}
                categories={this.state.categories}
                onChoice={this.handleDomainChoice} />;
        } else {
            return <Questionnaire category={this.state.chosenCategory} answeredToQuestions={this.answeredToQuestions} />;
        }
    }


    render() {
        let pomodoroPanel = this.displayPanel();

        return (
            <div>
                {pomodoroPanel}
            </div>)
    }

}

export default PomodoroPanel;