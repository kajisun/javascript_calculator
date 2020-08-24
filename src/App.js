import React from 'react';
import './App.scss';

const isOperator = /[x/+-]/,
    endWithOperator = /[x+-/]$/,
    endWithNegativeSigh = /[x/+]-$/;

const initState = {
    currentVal: "0",
    prevVal: "0",
    formula: "",
    currentSign: "pos",
    lastClicked: "",
    evaluated: false,
};

class btnInfo {
    constructor(keyCode, keyTrigger, id, attr) {
        this.keyCode = keyCode;
        this.keyTrigger = keyTrigger;
        this.id = id;
        this.attr = attr;
    }
}

const btns = [
    new btnInfo(46, "AC", "clear", "AC"),
    new btnInfo(111, "/", "divide", "operators"),
    new btnInfo(106, "x", "multiply", "operators"),
    new btnInfo(107, "+", "add", "operators"),
    new btnInfo(109, "-", "subtract", "operators"),
    new btnInfo(105, "9", "nine", "numbers"),
    new btnInfo(104, "8", "eight", "numbers"),
    new btnInfo(103, "7", "seven", "numbers"),
    new btnInfo(102, "6", "six", "numbers"),
    new btnInfo(101, "5", "five", "numbers"),
    new btnInfo(100, "4", "four", "numbers"),
    new btnInfo(99, "3", "three", "numbers"),
    new btnInfo(98, "2", "two", "numbers"),
    new btnInfo(97, "1", "one", "numbers"),
    new btnInfo(96, "0", "zero", "numbers"),
    new btnInfo(110, ".", "decimal", "decimal"),
    new btnInfo(13, "=", "equals", "eval"),
]

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = initState;
        this.maxDigitWarning = this.maxDigitWarning.bind(this);
        this.handleOperators = this.handleOperators.bind(this);
        this.handleNumbers = this.handleNumbers.bind(this);
        this.handleDecimal = this.handleDecimal.bind(this);
        this.handleEvaluate = this.handleEvaluate.bind(this);
        this.initialize = this.initialize.bind(this);
    }

    maxDigitWarning() {
        this.setState({
            currentVal: "Digit Limit Met",
            prevVal: this.state.currentVal,
        });
        setTimeout(() => this.setState({
            currentVal: this.state.prevVal
        }), 1000);
    }

    handleOperators(value) {
        if (!this.state.currentVal.includes("Limit")) {
            const { formula, prevVal, evaluated } = this.state;
            this.setState({
                currentVal: value,
                evaluated: false,
            });
            if (evaluated) {
                this.setState({ formula: prevVal + value });
            } else if (!endWithOperator.test(formula)) {
                this.setState({
                    prevVal: formula,
                    formula: formula + value,
                });
            } else if (!endWithNegativeSigh.test(formula)) {
                this.setState({
                    formula: ( endWithNegativeSigh.test(formula + value) ?
                        formula : prevVal  ) + value,
                });
            } else if (value !== "-") {
                this.setState({ formula: prevVal + value });
            }
        }
    }

    handleNumbers(value) {
        if (!this.state.currentVal.includes("Limit")) {
            const { currentVal, formula, evaluated } = this.state;
            this.setState({ evaluated: false });

            if (currentVal.length > 21) {
                this.maxDigitWarning();
            } else if (evaluated) {
                this.setState({
                    currentVal: value,
                    formula: value !== "0" ? value : "",
                });
            } else {
                this.setState({
                    currentVal: currentVal === "0" || isOperator.test(currentVal) ? value : currentVal + value,
                    formula: currentVal === "0" && value === "0" ?
                        formula === "" ? value : formula :
                    /([^.0-9]0|^0)$/.test(formula) ?
                        formula.slice(0,-1) + value :
                        formula + value,
                })
            }
        }
    }

    handleDecimal() {
        if (this.state.evaluated === true) {
            this.setState({
                currentVal: "0.",
                formula: "0.",
                evaluated: false,
            });
        } else if (
            !this.state.currentVal.includes(".") &&
            !this.state.currentVal.includes("Limit")
        ) {
            this.setState({ evaluated: false });
            if (this.state.currentVal.length > 21) {
                this.maxDigitWarning();
            } else if (
                endWithOperator.test(this.state.formula) ||
                (this.state.currentVal === "0" && this.state.formula === "")
            ) {
                this.setState({
                    currentVal: "0.",
                    formula: this.state.formula + "0."
                });
            } else {
                this.setState({
                    currentVal: this.state.currentVal + ".",
                    formula: this.state.formula + ".",
                });
            }
        }
    }

    handleEvaluate() {
        if (!this.state.currentVal.includes("Limit") && !this.state.evaluated) {
            let exp = this.state.formula;
            while (endWithOperator.test(exp)) {
                console.log(exp);
                exp = exp.slice(0, -1);
                console.log(exp);
            }
            exp = exp.replace(/x/g, "*");
            let ans = Math.round(10000000000000000 * Function("return " + exp)()) / 10000000000000000;
            this.setState({
                currentVal: ans.toString(),
                formula: exp.replace(/\*/g, "x").replace(";", "") + "=" + ans,
                prevVal: ans,
                evaluated: true,
            });
        }
    }

    initialize() {
        this.setState(initState)
    }

    render(){  
        let btncmps = btns.map((obj) =>{  
            let handler;
            switch (obj.attr) {
                case 'AC':
                    handler = this.initialize;
                    break;
                case 'operators':
                    handler = this.handleOperators;
                    break;
                case 'numbers':
                    handler = this.handleNumbers;
                    break;
                case 'decimal':
                    handler = this.handleDecimal;
                    break;
                case 'eval':
                    handler = this.handleEvaluate;
                    break;
            }

            return (
                <MyButton keyCode={obj.keyCode}
                    keyTrigger={obj.keyTrigger}
                    key={obj.id}
                    id={obj.id}
                    attr={obj.attr}
                    update={handler}
                />)
        })
        return (
            <div className="App">
                <div id="formula">{this.state.formula}</div>
                <div id="display">{this.state.currentVal}</div>
                <div id="keybord">{btncmps}</div>
            </div>
        );
    }
}

class MyButton extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.activate = this.activate.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    handleKeyPress(e) {
        if (e.keyCode === this.props.keyCode) {
            this.activate();
        }  
    }

    activate() {
        this.props.update(this.props.keyTrigger);
    }

    render() {
        return (
            <button id={this.props.id} onClick={this.activate} className={this.props.attr} >{this.props.keyTrigger}</button>
        )
    }
}

export default App;
