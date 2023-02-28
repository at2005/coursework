// class UNIT -- for Fleets and Armies
class Unit {//extends React.Component {
    constructor(props) {
     
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
    move(target_province, map) {
    // if(!this.current_province.shares_border(target_province) || this.current_province.type !== target_province.type) {
    //     this.state.support_units = [];
    //     return;
    //   }

    //   // check if unoccupied "free" territory
    //   if (!target_province.is_occupied()) {
    //     this.current_province = target_province;
    //   }

    //   // check if occupied territory
    //   else {
    //     // determine support and see if unit can take over province
    //     // iterate over all units
    //     let total_support_a = 0;
    //     for(let i = 0; i < this.state.support_units.length; i++) {
    //       total_support_a += this.state.support_units[i].state.type;
    //     }
        
    //     // get total strength of attacking unit
    //     let total_strength_a = this.state.type + total_support_a;
        
    //     // compare to total strength of defending unit, and replace unit if attacking unit is stronger
    //     if(target_province.state.type < total_strength_a) {
    //       this.current_province = target_province;
    //       target_province.replace_unit(this);
    //     }

    //     else {
    //       this.state.support_units = [];
    //       return;
    //     }
    //   }

    //   // clear support list -- support only lasts for one move
    //   this.state.support_units = [];
      // update position state of unit

      let target_province_owner = target_province.occupier.player_owner;
      if(toString(this.player_owner) in map[target_province_owner]) { 
        target_province.occupier.state.destroyed = true;
        this.state.x =  target_province.get_center[0];
        this.state.y = target_province.get_center[1];
        this.state.current_province = target_province;
      }

      else {
        alert("You cannot move to this province");
      }

    }

    //  adding support to self support list
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
