
import React from 'react';
import DiplomaticStage from './DiplomaticStage.js';
import GameBoard from './GameBoard.js';


class GameState extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        year: 2301,
        period: "Spring",
        phase: "",
        is_over: false,
        player_num: 0,
        support_graph: [[], [], [], []],
      };
      
      this.handle_order_change = this.handle_order_change.bind(this);
    }
    
    componentDidMount() {
      this.setState({phase: "Diplomatic"});

    }
    
    inc_year() {
      if(this.state.year < 2400) {
        this.setState({year: this.state.year + 1});
      }
  
      else {
        this.setState({is_over: true});
      }
  
    }

    inc_period() {
      if (this.state.period === "Spring") {
        this.setState({period: "Fall"});
      } 
      
      else {
        this.setState({period: "Spring"});
        this.inc_year();
      }
  
    }
  
    
    inc_phase() {
      if (this.state.phase === "Diplomatic") {
        this.setState({phase: "Order"});
      } 
      
      else if (this.state.phase === "Order") {
        this.setState({phase: "Movement"});
      } 
      
      else if (this.state.phase === "Movement") {
        this.setState({phase: "Retreat"});
      } 
      
      if (this.state.period === "Fall") {
        if (this.state.phase === "Retreat") {
          this.setState({phase: "Diplomatic"});
          this.inc_period();
        }
  
      }
    }
 
    // handle diplomatic orders
    handle_order_change(player, player_allied) {
      if(player_allied > 3) {
        alert("Invalid Player Number");
        return;
      }
      
      let support_map = this.state.support_graph;
      // console.log(support_map[Number(player)]);
      support_map[player].push(player_allied);
      this.setState({support_graph : support_map});
      console.log(this.state.support_graph);
    }


    
    render() {
      let game_over = "";
      if(this.state.is_over) {
        game_over = "Game Over";
      }

      // let el = <GameBoard/>;
      let el = this.state.phase === "Diplomatic" ? (
          <div>
            <DiplomaticStage player={this.state.player_num} onChange={this.handle_order_change}/>
            <button onClick={this.inc_phase.bind(this)}>Next Stage</button>
        </div>
        ) : <GameBoard player={this.state.player_num} support_map={this.support_graph}/>;

      return (
        <div>
          <h2>Year: {this.state.year}</h2>
          <h2>Period: {this.state.period}</h2>
          <h2>Phase: {this.state.phase}</h2>
          <h2>{game_over}</h2>
          <br></br>
          <br></br>
          {el}
        </div>
      );
    }
  };

export default GameState;

