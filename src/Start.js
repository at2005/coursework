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
                <br></br>
                <h2>Diplomacy is a strategy game where one tries to capture as many territories as possible by collaborating with and betraying other players.</h2>
                <br></br>
                <h3>There are five players. Each player is assigned a color and three <i><b>provinces</b></i>, for a total of fifteen. The goal is to conquer half of all provinces, ie more than seven.</h3>
                <br></br>
                <h3>The game consists of two phases: Diplomatic and Order. In the Diplomatic phase, you can send alliance requests to other players. In the Order phase,
                   you can move and conquer provinces.
                </h3>
                <h3>In the input box during the Diplomatic phase, enter a number from 1-5 to send alliance requests to that player. Results show up in the Event Log. You cannot ally with yourself.</h3>
                <br></br>
                <h3>During the Order Stage, there are two input boxes. Where it says "From:", enter the name of the province you wish to move. Where it says "To:",
                    enter the province name you wish to move to. 
                </h3>

                <h3>Each turn, a player can move one unit from one province to an adjacent province not owned by the player. This can only be done if the attaacking province has more support 
                than the defending unit.
                </h3>
                <br></br>
                <h3>Support can only be given by provinces adjacent to the defending province. If your allies exceed the defendant's allies, you conquer the province. Note that allies can withold support and betray you.</h3>
                <br></br>
                <br></br>
                <u><b><h2>First, choose your mode of play:</h2></b></u>
                 <h3>
                 <ul>
                    <li>Single Player means you are Player 1, alongside four unique artificial agents.</li>
                    <br></br>
                    <li>In Multi-Player, play in a group of five and use the screen as a virtual game board.</li>
                    <br></br>
                    <li>In Simulation Play, watch five artificial agents play against each other.</li>
                    <br></br>
                </ul>
                </h3>
                <button id="single" onClick={this.handle_click}>Single Player</button>
                <button id="multi" onClick={this.handle_click}>Multi-Player</button>
                <button id="sim" onClick={this.handle_click}>Simulation Play</button>
            </div>
        );
    }

}


export default Start;

