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
    move(target_province, support_map, adj_map, province_map) {
      console.log(target_province.center);
      
      let current_province_owner = this.state.player_owner;
      let target_province_owner = target_province.occupier.state.player_owner;


      // check if you are moving to your own province
      if(target_province_owner === current_province_owner) {
        alert("You cannot move to this province, you already own it");
        return;
      }

      // check if you own fleet -- cannot move other players' fleets
      if(current_province_owner !== 0) {
        alert("You cannot move this fleet, it is not yours");
        return;
      }

      // console.log(adj_map[target_province.get_name]);
      // console.log(this.state.current_province.get_name);

      // check if you border the province you are moving to
      if(!(adj_map[target_province.get_name].includes(this.state.current_province.get_name))) {
        alert("You do not border this province");
        return;
      }
      
      // calculate support
      let all_bordering_target = adj_map[target_province.get_name];
      console.log(all_bordering_target);
      let support = 1;
      // for(let i = 0; i < all_bordering_target.length; i++) {
      //   let bordering_province = province_map[all_bordering_target[i]];
      //   console.log(support_map[current_province_owner.toString()]);
      //   console.log(bordering_province.occupier.state.player_owner.toString());
      //   if(support_map[current_province_owner.toString()].includes(bordering_province.occupier.state.player_owner.toString())) {
      //     support++;
      //   }
      // }

      console.log(adj_map);

      // check if you have support to move to target province
      if(support) { 
        // target_province.occupier.state.destroyed = true;
        // this.state.x = target_province.get_center[0];
        // this.state.y = target_province.get_center[1];
        // this.state.current_province = target_province;
        let new_unit = new Unit();
        let target_province_actual = province_map[target_province.get_name];
        console.log(target_province_actual);
        console.log(target_province_actual.center);
        new_unit.player_owner = current_province_owner;
        new_unit.state.x = target_province_actual.center[0];
        new_unit.state.y = target_province_actual.center[1];
        new_unit.state.colour = this.state.colour;
        new_unit.state.current_province = target_province;
        console.log(new_unit);
        
        target_province_actual.set_occupier(new_unit);
        return;
      }

      alert("You cannot move to this province, you do not have enough support");

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
