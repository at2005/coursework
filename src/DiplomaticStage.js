// import react
import React from 'react';

class DiplomaticStage extends React.Component {
    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    // for simulation mode only
    componentDidMount() {
      if(this.props.mode === "sim") {
        this.props.make_AI_alliances_callback();    
      }
    }
    
    
    handleSubmit(e) {
      e.preventDefault();
      let val = document.getElementById("player_id").value;
      this.props.onChange(this.props.player, val);
      // this.props.make_AI_alliances_callback();
    }

    render() {
      return (
      <div>
        <h1>Diplomatic Stage</h1>
        <form onSubmit={this.handleSubmit}>
          <input id="player_id"></input>
          <button>Send Request</button>
          <button onClick={this.props.make_AI_alliances_callback}>Finalize</button>
        </form>
      </div>
      );
    }
  }

export default DiplomaticStage;