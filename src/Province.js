
// Province class

class Province {
    constructor(center_coord) {
      this.center = center_coord;
      this.occupier = null;
      this.region_coords = []; 
      this.dist = 0;
      this.unit_lst = [];
      this.type = "None";
      this.name = "None";
    }
 
 
    // setter to update distance
    set update_dist(new_dist) {
      this.dist = new_dist;
    }

    set set_name(new_name) {
        this.name = new_name;
    }
    
    get get_dist() {
      return this.dist;
    }
      
    get get_center() {
      return this.center;
    }
  
    get get_occupier() {
      return this.occupier;
    }
  
    add_region(coord) {
      this.region_coords.push(coord);
  
    }
  
    get get_region_lst() {
      return this.region_coords;
    }
  
    get get_type() {
        return this.type;
    }

    get get_name() {
        return this.name;
    }

    set_occupier(new_occupier) {
      this.occupier = new_occupier;
      this.occupier.set_xy(this.center[0], this.center[1]);
      this.occupier.state.current_province = this;
    }
  
    shares_border(other_province) {
        // TODO: implement
        return true;
    }

  
    is_occupied() {
        if(this.occupier === "None") {
            return false;
        }
        
        return true;
    }
  
    get get_unit() {
        return this.unit;
    }
  
    replace_unit(new_unit) {
        this.unit.self_destruct();
        this.unit = new_unit;
    }
  
  };

  export default Province;
  