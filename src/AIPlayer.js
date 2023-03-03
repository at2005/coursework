class AIPlayer {
    constructor(trustworthiness, trusting, expansionist) {
        this.player_lst = [];
        this.trustworthiness = trustworthiness;
        this.trusting = trusting;
        this.expansionist = expansionist;
        this.likelihood_of_support = 0.5;
    }
 
    execute_move() {

    }


    request_for_support(request_for_support_callback, player, player_allied) {
        let prob = Math.random();
        if(prob <= this.trustworthiness) {
            request_for_support_callback(true, player, player_allied);
            return;
        }

        request_for_support_callback(false, player, player_allied);
    
    }
    
    accept_alliance(accept_alliance_callback, player, player_allied) {
        let prob = Math.random();
        if(prob <= this.likelihood_of_support) {
            accept_alliance_callback(true, player, player_allied);
            return;
        }
    
       accept_alliance_callback(false, player, player_allied);
    }



    request_alliance() {
        

    }


};


export default AIPlayer;
