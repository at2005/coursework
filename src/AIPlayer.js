import PlayerOpinion from "./PlayerOpinion";

class AIPlayer {
    constructor(player_id, trustworthiness, trusting, expansionist) {
        this.player_lst = [];
        
        // Change parameters within the game to test hypotheses

        // for testing Hypothesis #2
        this.trustworthiness = Math.random();

        // for testing Hypothesis #3
        this.likelihood_of_alliance = Math.random();
        
        this.player_id = player_id;
        this.player_opinions = {};
    
        this.account_alliance = this.account_alliance.bind(this);
        this.accept_alliance = this.accept_alliance.bind(this);
        this.account_betrayal = this.account_betrayal.bind(this);

        // create opinion of players map
        for(let i = 0; i < 5; i++) {
            if(i !== this.player_id) {
                this.player_opinions[i.toString()] = new PlayerOpinion(i);
            }
        }
        // this.trusting = Math.random();
        // this.expansionist = Math.random();
        // this.isolationist = Math.random();
    }
    

    account_betrayal(player2_id) {
        this.player_opinions[player2_id.toString()].account_betrayal_op();
    }

    account_support_given(player2_id) {
        this.player_opinions[player2_id.toString()].account_support_given_op();
    }

    account_alliance(player2_id) {
        // console.log(this.player_id, this.player2_id);
        // console.log(this.player_opinions[player2_id.toString()]);
        this.player_opinions[player2_id.toString()].account_alliance_op();
    }


    // get all provinces matching the player id
    get_available_provinces(province_map, player_id) {
        let available_provinces = [];
        let prov_keys = Object.keys(province_map);
        for(let prov = 0; prov < prov_keys.length; prov++) {
            if(province_map[prov_keys[prov]].occupier.state.player_owner === player_id) {
                available_provinces.push(province_map[prov_keys[prov]]);
            }
        }

        return available_provinces;
    }

    // get all bordering provinces of AI Player
    get_bordering_provinces(province_map, adj_map, province_chosen) {
        let all_bordering_provinces = adj_map[province_chosen.name];
        let bordering_provinces = [];
        
        for(let i = 0; i < all_bordering_provinces.length; i++) {
            let bordering_prov = province_map[all_bordering_provinces[i]];
            // console.log(bordering_prov);
            
            if(bordering_prov.occupier.state.player_owner === this.player_id) { continue; }
            bordering_provinces.push(bordering_prov);
        }

        return bordering_provinces;

    }


    does_support(province1, province2, support_map) {
        if(support_map[province1.occupier.state.player_owner.toString()].includes(province2.occupier.state.player_owner.toString())) {
            return true;
        }
        
        return false;
    }

    does_support_player(province1_owner, province2_owner, support_map) {
        if(support_map[province1_owner.toString()].includes(province2_owner.toString())) {
            return true;
        }
        
        return false;
    }



    // calculate first higher-order term in payoff summation => calculates expected gain from attacking enemy's allies
    calculate_h1_payoff(province_to, bordering_target, support_map) {
        let h1_payoff = 0;
        for(let i = 0; i < bordering_target.length; i++) {
            // if borders enemy
            if(this.does_support(bordering_target[i], province_to, support_map)) {
                let enemy = bordering_target[i].occupier.state.player_owner.toString();
                let opinion = this.player_opinions[enemy].score;
                opinion = 1/opinion;
                h1_payoff += opinion;
            }
        }

        // inversely proportional to opinion of enemy => higher opinion, lower payoff (add scale of 2 since we don't want everyone betraying each other
        // unless they have a low trustworthiness score anyways)
        h1_payoff /= 2*(this.player_opinions[province_to.occupier.state.player_owner.toString()].score);
        return h1_payoff;
    }
    

    // quantify shared borders
    calculate_h2_payoff(province_requesting_owner, province_map, adj_map) {
        let provinces = Object.keys(province_map);
        let your_provinces = [];
        let their_provinces = [];
        
        for(let prov_name = 0; prov_name < provinces.length; prov_name++) {
            let province = province_map[provinces[prov_name]];
            
            // get your provinces
            if(province.occupier.state.player_owner === this.player_id) {
                your_provinces.push(province);
            }

            // get other players' provinces
            else if(province.occupier.state.player_owner === province_requesting_owner) {
                their_provinces.push(province);
            }
        }

        // check for shared borders
        let h2_payoff = 0;
        for(let i = 0; i < your_provinces.length; i++) {
            for(let j = 0; j < their_provinces.length; j++) {
                if(adj_map[your_provinces[i].name].includes(their_provinces[j].name)) {
                    h2_payoff++;
                }
            }
        }
     
        return h2_payoff;
        
    }

    

    calculate_payoff_individual(province_from, province_to, bordering_target, support_map) {
        let support_attack = 1; 
        let support_def = 1;

        // console.log(bordering_target);

        for(let i = 0; i < bordering_target.length; i++) {
            if(bordering_target[i].occupier.state.player_owner === this.player_id) {
                support_attack++;    
            }

            else if(this.does_support(province_from, bordering_target[i], support_map)) {
                support_attack += this.player_opinions[bordering_target[i].occupier.state.player_owner.toString()].score;   
            }

            else if(bordering_target[i].occupier.state.player_owner === province_to.occupier.state.player_owner) {
                support_def++;
            } 

            else if(this.does_support(province_to, bordering_target[i], support_map)) {
                support_def += this.player_opinions[bordering_target[i].occupier.state.player_owner.toString()].score;
            }
            
        }
 
        let payoff = support_attack - support_def;
        if(this.does_support(province_from, province_to, support_map)) {
            // the less trustworthy, the greater the payoff for betrayal
            payoff /= this.trustworthiness;
        }
        
        // add h1_payoff
        let h1_payoff_move = this.calculate_h1_payoff(province_to, bordering_target, support_map);
        payoff += h1_payoff_move;

        return payoff;
        
    }


    calculate_payoff_overall(available_provinces, province_map, adj_map, support_map) {
        let payoff_current = -100000;
        let final_available = null;
        let final_chosen = null;
        

        //let payoff_lst = [];
        for(let i = 0; i < available_provinces.length; i++) {
            let bordering_chosen = this.get_bordering_provinces(province_map, adj_map, available_provinces[i]);

            for(let j = 0; j < bordering_chosen.length; j++) {
                let bordering_target = this.get_bordering_provinces(province_map, adj_map, bordering_chosen[j]);
                let calculated_payoff = this.calculate_payoff_individual(available_provinces[i], bordering_chosen[j], bordering_target, support_map);
               
                if(calculated_payoff >= payoff_current) {
                    payoff_current = calculated_payoff;
                    final_available = available_provinces[i];
                    final_chosen = bordering_chosen[j];
                }

            }
        }

        return [final_available, final_chosen];

    }


    // make a move
     execute_move(player_id, support_map, adj_map, province_map, request_support_callback, logging_callback, signal_destroyed_self, callback_finished) {
        
        let available_provinces = this.get_available_provinces(province_map, player_id);

        
        let arr = this.calculate_payoff_overall(available_provinces, province_map, adj_map, support_map);
        let province_chosen = arr[0];
        let target_province = arr[1];

        // no provinces left to move, completely destroyed
        if(province_chosen === null) {
            signal_destroyed_self(this.player_id);
            return;
        }
        
        province_chosen.occupier.move(player_id, target_province, support_map, adj_map, province_map, request_support_callback, logging_callback, callback_finished);
        
    }

    // calculate payoff for supporting ally
    calculate_support_payoff_gained(province_requesting, province_target, province_map, adj_map, support_map) {        
        let player_allied = province_requesting.occupier.state.player_owner;
        const opinion_of_other = this.player_opinions[player_allied.toString()].score;
        let bordering_target = this.get_bordering_provinces(province_map, adj_map, province_target);
        let h1_payoff = this.calculate_h1_payoff(province_target, bordering_target, support_map);
        let payoff = (h1_payoff+1) * opinion_of_other * this.trustworthiness;
        return payoff;
    }


    // calculate payoff for not supporting
    calculate_support_payoff_lost(province_requesting, province_target, province_map, adj_map, support_map) {
        let h2_payoff_support = this.calculate_h2_payoff(province_requesting.occupier.state.player_owner, province_map, adj_map);
        const opinion_of_other = this.player_opinions[province_requesting.occupier.state.player_owner.toString()].score;
        let payoff = 1 / ((h2_payoff_support+1) * this.trustworthiness * opinion_of_other);
        return payoff;
    }


    request_for_support(province_requesting, province_target, province_map, adj_map, support_map) {
        // ensure you are not supporting your own betrayal
        if(province_target.occupier.state.player_owner === this.player_id) {
            return false;
        }

        const payoff_gained = this.calculate_support_payoff_gained(province_requesting, province_target, province_map, adj_map, support_map);
        const payoff_lost = this.calculate_support_payoff_lost(province_requesting, province_target, province_map, adj_map, support_map);
        if(payoff_gained >= payoff_lost) {
            return true;
        }
    
        
        return false;
    }
        

    accept_alliance(accept_alliance_callback, player, player_allied) {
        let prob = Math.random();
        if(prob <= this.likelihood_of_alliance) {           
            
            this.account_alliance(player);

            accept_alliance_callback(true, player.toString(), player_allied);
            return;
        }
    
       accept_alliance_callback(false, player.toString(), player_allied);
    }


    
    make_alliance_request(province_map, adj_map, support_map) {
        let players = Object.keys(this.player_opinions);
        let h2_total = -100000;
        let player_allied = null;

        for(let i = 0; i < players.length; i++) {
            let h2_payoff_alliance = this.calculate_h2_payoff(Number(players[i]), province_map, adj_map);
            if(h2_payoff_alliance >= h2_total && !(this.does_support_player(this.player_id, Number(players[i]), support_map))) {
                player_allied = players[i];
            }
       
        }

        return player_allied;  
    }

};


export default AIPlayer;
