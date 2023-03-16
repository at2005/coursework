// import react
import React from 'react';

class DiplomaticStage extends React.Component {
    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.state ={
        current_diplomatic : 0,
      };

      this.finalize_turn = this.finalize_turn.bind(this);

    }
        
    // for simulation mode only
    componentDidMount() {
      if(this.props.mode === "sim") {
        this.props.make_AI_alliances_callback();    
      }
    }
    

    finalize_turn() {
      this.setState((state, props) => ({
        current_diplomatic: state.current_diplomatic + 1
      }), () => {console.log("success");});
    }
    
    
    handleSubmit(e) {
      e.preventDefault();
      let val = document.getElementById("player_id").value;
    
      if(this.props.mode !== "multi") {  
        this.props.onChange(this.props.player, val);
        return;
      }
      
      this.props.onChange(this.state.current_diplomatic, val);

    }

    render() {
      let finalize_element = this.props.mode === "multi" ? <button onClick={this.finalize_turn}>Finalize Player {this.state.current_diplomatic} Alliances</button>  :  <button onClick={this.props.make_AI_alliances_callback}>Finalize</button> 
      return (
      <div>
        <h1>Diplomatic Stage</h1>
        <form onSubmit={this.handleSubmit}>
          <input id="player_id"></input>
          <button>Send Request</button>
          {finalize_element}
        </form>
      </div>
      );
    }
  }

export default DiplomaticStage;