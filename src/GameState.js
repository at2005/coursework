import React from 'react';
import DiplomaticStage from './DiplomaticStage.js';
import GameBoard from './GameBoard.js';
import AIPlayer from "./AIPlayer.js"
import Start from "./Start.js"


class GameState extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        year: 2301,
        period: "Spring",
        phase: "",
        mode: "start",
        is_over: false,
        player_num: 0,
        support_graph: [[], [], [], [], []],
        players: [new AIPlayer(1,1,1,1), new AIPlayer(2,1,1,1), new AIPlayer(3,1,1,1), new AIPlayer(4,1,1,1)],
        current_turn: 0,
        diplomatic_outcomes: [],
        adjacency_map: {},
        province_map: {},
        outcome_arr: [],
        destroyed_players: [],
        player0 : null,
        winner: null,
        corrective_factor: 1,
        movements: [],
        
      };

      this.movements = [];
      this.current_turn = 0;

      this.handle_order_change = this.handle_order_change.bind(this);
      this.handle_request_support = this.handle_request_support.bind(this);
      this.make_AI_alliances_callback = this.make_AI_alliances_callback.bind(this);
      this.switch_turns = this.switch_turns.bind(this);
      this.create_adjacency = this.create_adjacency.bind(this);
      this.create_province_map = this.create_province_map.bind(this);
      this.log_event = this.log_event.bind(this);
      this.signal_player_destroyed = this.signal_player_destroyed.bind(this);
      this.set_mode = this.set_mode.bind(this);
      this.execute_turn = this.execute_turn.bind(this);
      
    }
   
    
    
    // allows completion of the game -- basic requirement 1
    check_game_over() {
      let score_arr = [0, 0, 0, 0, 0];
      // iterate over each province and count no. provinces owned by each
      let provinces = Object.keys(this.state.province_map);
      for(let i = 0; i < provinces.length; i++) {
        score_arr[this.state.province_map[provinces[i]].occupier.state.player_owner] += 1;
      }

      // if any province owns greater than 7 provinces then end game
      for(let i = 0; i < score_arr.length; i++) {
        if (score_arr[i] >= 7) {
          return [true, i];
        } 
      }

      return [false, null];

    }


    set_mode(new_mode) {
      
      if(new_mode === "sim") {
        let players_sim = this.state.players;
        // insert zeroth player at start of list
        players_sim.unshift(new AIPlayer(0,1,1,1));
        this.setState({players: players_sim, corrective_factor: 0});
      
      }
     
      this.setState({mode: new_mode});
    }

    signal_player_destroyed(player_id) {
      let destroyed_list = this.state.destroyed_players;
      destroyed_list.push(player_id);
      this.setState({destroyed_players : destroyed_list});

    }


    // callbacks to update adjacency and province maps from GameBoard component
    create_adjacency(adjacency) {
     this.setState({adjacency_map: adjacency});

    }

    create_province_map(new_province_map) {
      this.setState({province_map: new_province_map});
    }

    componentDidMount() {
      this.setState({phase: "Diplomatic"});
    }

    // logs event
    log_event(event) {
      let el = <p key={Math.random()}>{event}</p>
      // this.state.movements.push(el);
      this.movements.push(el);
      
      if(this.state.mode !== "sim") {
        this.setState(prevState => ({
          movements: [...prevState.movements, el]
        }));
      }
    }

    
    handle_alliance_request(boolean_response, player, player_allied) {

      if(boolean_response) {
        let new_support_graph = this.state.support_graph;
        new_support_graph[player].push(player_allied.toString());
        new_support_graph[player_allied].push(player.toString());

        this.setState((state, props) => {
          return {
            support_graph: new_support_graph,
          };
        });
        
        // let new_support_graph = this.state.support_graph;
        // new_support_graph[player].push(player_allied);
        // new_support_graph[player_allied].push(player);
        
        let message = ("Player " + (Number(player_allied)+1).toString() + " accepted Player " + (Number(player)+1).toString() + " alliance request");
        this.log_event(message);
        return;
      }

      this.setState({support_graph: this.state.support_graph});
      let message = ("Player " + (Number(player_allied)+1).toString() + " rejected Player " + (Number(player)+1).toString() + " alliance request");
      this.log_event(message);
     
    }


    // this function is callback which is called from a unit requesting support from another player
    handle_request_support(province_requesting, target_province, supporting_province) {
      let bool_result = 0;

      if((supporting_province.occupier.state.player_owner === 0 && this.state.mode === "single") || this.state.mode === "multi") {
        let msg = ("Player " + (province_requesting.occupier.state.player_owner + 1).toString() + " is requesting support from Player " + (supporting_province.occupier.state.player_owner+1).toString() + " to move to " + target_province.name + " from " + province_requesting.name + ". Give Support?");
        bool_result = window.confirm(msg);
      }

      else {
        
        let computer = this.state.players[supporting_province.occupier.state.player_owner - this.state.corrective_factor];
        bool_result = computer.request_for_support(province_requesting, target_province, this.state.province_map, this.state.adjacency_map, this.state.support_graph);
      }

      
      if((this.state.mode === "sim") || (province_requesting.occupier.state.player_owner !== this.state.current_turn && this.state.mode !== "sim")) {
        //console.log(province_requesting.occupier.state.player_owner - this.state.corrective_factor);
        let computer2 = this.state.players[province_requesting.occupier.state.player_owner - this.state.corrective_factor];
        
        if(!bool_result) {
            computer2.account_betrayal(supporting_province.occupier.state.player_owner);
          }
        
        else {
          computer2.account_support_given(supporting_province.occupier.state.player_owner);
        }
      
      }
 
      return bool_result;
    }


    // this function is called whenever current turn is updated and gets computer player to execute their move 
    execute_turn() {
      console.log(this.state.province_map);
      let computer = this.state.players[this.state.current_turn - this.state.corrective_factor];
      computer.execute_move(this.state.current_turn, this.state.support_graph, this.state.adjacency_map, this.state.province_map, this.handle_request_support, this.log_event, this.signal_player_destroyed, this.switch_turns);
      
      // setTimeout(() => {
      this.switch_turns();
      // }, 1000);
       
    }

    // for going around to each player after their move is executed
    switch_turns() {
      
      if(this.state.year >= 2400) { 
        this.setState({is_over: true});
        return;
      }

      if(this.state.current_turn < 4) {
        // add delay because state cannot be updated multiple times a second
        setTimeout(() => {
        this.setState((state, props) => ({
          current_turn: state.current_turn + 1
        }), () => {
          
          // check if game over
          let res_game_over = this.check_game_over();
          let bool_game_over = res_game_over[0];
          let winner_game = res_game_over[1];

          if(bool_game_over) {
            this.setState({is_over: true, winner: winner_game});
            this.log_event("won " + (winner_game+1).toString());
            
            if(this.state.mode === "sim") {
              this.post_event_log();
            }

            return;
          }

      
          // if player destroyed skip it
          if(this.state.destroyed_players.includes(this.state.current_turn)) {
            //console.log(this.state.current_turn);
            this.switch_turns();
            return;
          } 

          // don't execute computer move if multiplayer
          if(this.state.mode !== "multi") {
            this.execute_turn();
          }


        });
      }, 5000);

        // this.execute_turn();
        return;
      }
    
      setTimeout(() => {
      this.setState({current_turn: 0}, () => {
        if(this.state.mode === "sim") {
          this.execute_turn();
        }

        this.inc_period();

      });
    }, 10);

        
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
  
    // eh not going to use this beyond order tbh
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
    

    // handle diplomatic orders for human player
    handle_order_change(player, player_allied) {
      // input validation -- basic requirement 2
      if(player_allied > 4 || player_allied < 0) {
        alert("Invalid Player Number");
        return;
      }

      if(player_allied === player) {
        alert("Cannot ally with self");
        return;
      }


      if(this.state.mode !== "multi" && !(this.state.mode === "single" && player_allied === 0)) {

        let computer = this.state.players[player_allied-this.state.corrective_factor];
        computer.accept_alliance(this.handle_alliance_request.bind(this), player, player_allied);
        return;
      }

      // for multiplayer, have pop-up menu
      let msg = "Player " + (Number(player_allied)+1).toString() + ", do you accept Player " + (Number(player+1)).toString() + " alliance request?"
      let bool_res = window.confirm(msg);
      this.handle_alliance_request(bool_res, player, player_allied);
    

    }


    // handle diplomatic requests for AI players
    make_AI_alliances_callback() {
      for(let i = 0; i < this.state.players.length; i++) {
        let computer = this.state.players[i];
        let res = computer.make_alliance_request(this.state.province_map, this.state.adjacency_map, this.state.support_graph);
        if(res !== null) {
          this.handle_order_change(i+this.state.corrective_factor, res);
        }
      }

      if(this.state.mode === "sim") {
        this.inc_phase();
      }

    }
    

    // send data to server for processing
    async post_event_log() {
      let data = {};

      // get each character traits and store them as JSON
      for(let player_index = 0; player_index < this.state.players.length; player_index++) {
        data["player" + player_index.toString()] = this.state.players[player_index];
      }
      

      // get each event and store as JSON
      for(let event = 0; event < this.movements.length; event++) {
        // get string associated with HTML element
        let event_msg = this.movements[event].props.children;
        data["event" + event.toString()] = event_msg;
      }
      
      // send to server 
      await fetch("http://localhost:3005/api/post_event_log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)

      }).then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      });

    } 



    render() { 
      let movements = this.state.mode === "sim" ? this.movements : this.state.movements; 
      // let el = <GameBoard/>;
      let el = this.state.phase === "Diplomatic" ? (
          <div>
            <DiplomaticStage mode={this.state.mode} player={this.state.player_num} onChange={this.handle_order_change} make_AI_alliances_callback={this.make_AI_alliances_callback}/>
            <button onClick={this.inc_phase.bind(this)}>Next Stage</button>
      
        </div>
        ) : <br></br>

        let el_turn = this.state.phase === "Order" ? (
          <h2>Current Turn: Player {this.state.current_turn + 1}</h2> 
        ) : null;


        let main_game_el = 
          <div id="container_game">
            <div id="c1">

              <br></br>
              <GameBoard height="800" width="800" mode={this.state.mode} phase={this.state.phase} turn={this.state.current_turn} player={this.state.player_num} support_map={this.state.support_graph} request_support_callback={this.handle_request_support} signal_move_done={this.switch_turns} start_ai={this.execute_turn} create_adjacency={this.create_adjacency} create_province_map={this.create_province_map} logging_callback={this.log_event}/>
              {el}
            </div>
            
            <div id="event_log">
            <h2>Year: {this.state.year}</h2>
              <h2>Period: {this.state.period}</h2>
              <h2>Phase: {this.state.phase}</h2>
              {el_turn}
              <br></br>
              <br></br>
              <h2><u>Event Log</u></h2>
              <div>
                {movements}     
              </div>
            </div>
          </div>;

        let current_screen = this.state.mode === "start" ? <Start set_mode={this.set_mode.bind(this)}/> : main_game_el;
        let current_game_screen_over = this.state.is_over === false ? current_screen : (
        <div>
          <h2>Game Over. Player {this.state.winner+1} won.</h2>
          <h3>Event Log</h3>
          {this.movements}
        </div>
        );
        
      return (
        current_game_screen_over
      );
    }
  };

export default GameState;