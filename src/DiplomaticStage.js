// import react
import React from 'react';

class DiplomaticStage extends React.Component {
    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
 
    handleSubmit(e) {
      e.preventDefault();
      let val = document.getElementById("player_id").value;
      this.props.onChange(this.props.player, val); 
    }

    render() {
      return (
      <div>
        <h1>Diplomatic Stage</h1>
        <form onSubmit={this.handleSubmit}>
          <input id="player_id" defaultValue={"Player"}></input>
          <button>Send Request</button>
        </form>
      </div>
      );
    }
  }

export default DiplomaticStage;