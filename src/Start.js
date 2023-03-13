import React from 'react';

class Start extends React.Component {
    constructor(props) {
        super(props);
        this.handle_click = this.handle_click.bind(this);
    }

    handle_click(e) {
        e.preventDefault();
        let id = e.currentTarget.id;
        this.props.set_mode(id);
    }


    render() {
        return (
            <div>
                <h1>Welcome to Diplomacy!</h1>
                <h3>Diplomacy is a strategy game where one tries to capture as many territories as possible by collaborating with and betraying other players.</h3>
                <h3>First, choose your mode of play: </h3>
                <button id="single" onClick={this.handle_click}>Single Player</button>
                <button id="multi" onClick={this.handle_click}>Multi-Player</button>
                <button id="sim" onClick={this.handle_click}>Simulation Play</button>
            </div>
        );
    }

}


export default Start;

