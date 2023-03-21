// class UNIT -- for Fleets and Armies
class Unit {//extends React.Component {
    constructor(update_callback) {
     
      this.state = {
        type: "Army",
        x: 0,
        y: 0,
        current_province: 0,
        destroyed: false,
        support_units : [],
        player_owner: 0,
        colour: "red",
      };

      this.update_board = update_callback;
  
    }

    set_xy(x, y) {
      this.state.x = x;
      this.state.y = y;
    }


    update_owner(new_owner) {
      this.state.player_owner = new_owner;
    }

    self_destruct() {
      this.destroyed = true;
    }

    is_destroyed() {
      return this.destroyed;
    }
  
    // movement logic
    move(player_id, target_province, support_map, adj_map, province_map, request_support_callback, logging_callback, callback_finished=null) {
     
      let current_province_owner = this.state.player_owner;
      let target_province_owner = target_province.occupier.state.player_owner;

      // return Promises in future
      let true_promise = new Promise((resolve, reject) => {
        resolve(true);
      });

      let false_promise = new Promise((resolve, reject) => {
        resolve(false);
      });

      // INPUT VALIDATION START -- basic requirement 2

      // check if you are moving to your own province
      if(target_province_owner === current_province_owner) {
        logging_callback("You cannot move to this province, you already own it");
        
        return true;
      }

      // check if you own fleet -- cannot move other players' fleets
      if(current_province_owner !== player_id) {
        logging_callback("You cannot move this fleet, it is not yours");
        return true;
      }

      // check if you border the province you are moving to
      if(!(adj_map[target_province.get_name].includes(this.state.current_province.get_name))) {
        logging_callback("You do not border this province");
        return true;
      }

      // INPUT VALIDATION END -- basic requirement 2

      
      // calculate support
      let all_bordering_target = adj_map[target_province.get_name];
 
      // your total support 
      let support = 1;
      // enemy total support
      let enemy_support = 1;


      // iterate over all bordering provinces and request support
      for(let i = 0; i < all_bordering_target.length; i++) {
        let bordering_province = province_map[all_bordering_target[i]];

        // if you own neighbouring provinces you can support yourself
        if(bordering_province.occupier.state.player_owner === this.state.player_owner) { 
          logging_callback("Player " + (current_province_owner+1).toString() + " owns a bordering province, so gave themselves support");
          support++; 
          continue;
        }

        // if enemy owns neighbouring provinces, then supports themselves
        if(bordering_province.occupier.state.player_owner === target_province_owner) {
          logging_callback("Player " + (target_province_owner+1).toString() + " owns a bordering province, so gave themselves support");
          enemy_support++;
          continue;
        }

        // get support from bordering province
        if(support_map[current_province_owner.toString()].includes(bordering_province.occupier.state.player_owner.toString())) {
         
        let support_is_given = request_support_callback(this.state.current_province, target_province, bordering_province);
          if(support_is_given) {
            logging_callback("Support was given by Player " + (bordering_province.occupier.state.player_owner+1).toString() + " to Player " + (current_province_owner+1).toString() + " for Player " + (current_province_owner+1).toString() + " to move to " + target_province.get_name);
            support++;
            continue;
          }

          logging_callback("Support was not given by Player " + (bordering_province.occupier.state.player_owner+1).toString() + " to Player " + (current_province_owner+1).toString() + " for Player " + (current_province_owner+1).toString() + " to move to " + target_province.get_name);
        }

       
        if(support_map[target_province_owner.toString()].includes(bordering_province.occupier.state.player_owner.toString())) {
          let support_given_enemy = request_support_callback(this.state.current_province, target_province, bordering_province);
          if(support_given_enemy) {
            logging_callback("Support was given by Player " + (bordering_province.occupier.state.player_owner+1).toString() + " to Player " + (target_province_owner+1).toString() + " for Player " + (target_province_owner+1).toString() + " to resist invasion by " + (Number(current_province_owner)+1).toString());
            enemy_support++;
            continue;
          }

            logging_callback("Support was not given by Player " + (bordering_province.occupier.state.player_owner+1).toString() + " to Player " + (target_province_owner+1).toString() + " for Player " + (target_province_owner+1).toString() + " to resist invasion by " + (Number(current_province_owner)+1).toString());
        } 
      }
    
      // snippet of Unit.move() function
      // check if you have support to move to target province
      if(support > enemy_support) { 
        let new_unit = new Unit(this.update_board);
        let target_province_actual = province_map[target_province.get_name];
        new_unit.state.player_owner = current_province_owner;
        new_unit.state.x = target_province_actual.center[0];
        new_unit.state.y = target_province_actual.center[1];
        new_unit.state.colour = this.state.colour;
        new_unit.state.current_province = target_province;
        
        target_province_actual.set_occupier(new_unit);
        this.update_board();
        logging_callback((current_province_owner+1).toString() + " successfully moved to this province");
        return false;
      }

      logging_callback((current_province_owner+1).toString() + " cannot move to this province, does not have enough support");
      return true;

    }

    // adding support to self support list
    add_support(support_unit) {
      this.state.support_units.push(support_unit);
    }
    

    // support other unit
    support(unit_to_support, target_province) {
      if(this.current_province.shares_border(target_province)) {
        this.move(target_province);
        unit_to_support.add_support(this);
      }
      
    }

    convoy() {

    }
    
  };
  
export default Unit;
