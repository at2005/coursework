import React from 'react';
import { createRef } from 'react';
// import "./Province";
import Unit from "./Unit.js";
import Province from "./Province.js";


class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    this.height = 800;
    this.width = 800;
    this.num_provinces = 15;
    this.granularity = 2;
    this.canvasRef = createRef();
    this.update_init = this.update_init.bind(this);
    this.plot_all_units = this.plot_all_units.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    
    this.state = {
      your_provinces : [],
      hovering_province: null,
    };

    // map of length 15
    this.province_map = {
      "Saggitarius" : null,
      "Perseus" : null,
      "Eridanus" : null,
      "Cassiopeia" : null,
      "Cepheus" : null,
      "Cygnus" : null,
      "Aquila" : null,
      //"Pegasus" : null,
      "Andromeda" : null,
      "Orion" : null,
      "Ursa Major" : null,
      "Ursa Minor" : null,
      "Local Group" : null,
      "Sirius" : null,
      "Canis Major" : null,
      "Canis Minor" : null,
    };

    this.adjacency_map = {
      "Saggitarius" : [],
      "Perseus" : [],
      "Eridanus" : [],
      "Cassiopeia" : [],
      "Cepheus" : [],
      "Cygnus" : [],
      "Aquila" : [],
      //"Pegasus" : [],
      "Andromeda" : [],
      "Orion" : [],
      "Ursa Major" : [],
      "Ursa Minor" : [],
      "Local Group" : [],
      "Sirius" : [],
      "Canis Major" : [],
      "Canis Minor" : [],
    };


    // this.province_coord_lookup = {

    // };

  }


  // update current hovering province name
  _onMouseMove(e) {
    const canvas = this.canvasRef.current;
    let rect = canvas.getBoundingClientRect();
    let x_relative = e.clientX - rect.left;
    let y_relative = e.clientY -  Math.ceil(rect.top);

    let provinces = Object.keys(this.province_map);
    for(let i = 0; i < provinces.length; i++) {
      let prov = this.province_map[provinces[i]];
      let center = prov.center;
      if(this.euclidean_distance(center, [x_relative, y_relative]) <= 56) {
        this.setState({hovering_province: provinces[i]});
      }
    }

  }


  // euclidean distance between two points
  euclidean_distance(p1_lst, p2_lst) {
    let x1 = p1_lst[0];
    let y1 = p1_lst[1];
    let x2 = p2_lst[0];
    let y2 = p2_lst[1];
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))    

  }
  
  // manhattan distance between two points
  manhattan_distance(p1_lst, p2_lst) {
    let x1 = p1_lst[0];
    let y1 = p1_lst[1];
    let x2 = p2_lst[0];
    let y2 = p2_lst[1];
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
  
  // check if coordinate within proximity of other coordinates
  check_approx(coord, coords) {
    let dist_min = 100;
    for(let i = 0; i < coords.length; i++) {
      if(this.euclidean_distance(coord, coords[i]) < dist_min) {
        return false;
      }
    }

    return true;
  }

  // use voronoi noise to generate province regions/boundaries, scatter 15 points randomly across the board, evenly spaced using check_approx()
  scatter_points() {
    // scatter voronoi points randomly
    let coords = [];
    for(let i = 0; i < this.num_provinces; i++) {
      let coord = [Math.floor(Math.random() * (this.width - 50)), Math.floor(Math.random() * (this.height - 50))];
      // map coordiante if not too close to others (evenly spacing algo)
      if(this.check_approx(coord, coords)) {
        coords[i] = coord;
      }

      // else go back one iteration
      else {
        i -= 1;
      }
    }
  
    return coords;
  }
    

  
  // map scattered centers to Province objects 
  create_provinces() {
    // get coordinates
    let province_lst = [];
    let province_coords = this.scatter_points();
    for(let i = 0; i < this.num_provinces; i++) {
      // create province object for each center basically
      province_lst[i] = new Province(province_coords[i]);
      province_lst[i].set_name = Object.keys(this.province_map)[i];
      this.province_map[province_lst[i].name] = province_lst[i];
    }
    
    return province_lst;

  }



  // map each pixel to Province (Voronoi method)
  map_points() {
    var provinces = this.create_provinces();
    for(let i = 0; i < this.height; i+=(this.granularity)) {
      for(let j = 0; j < this.width; j+=(this.granularity)) {
        // iterate over each province
        let province_min = 0;
        for(let prov = 0; prov < this.num_provinces; prov++) {
          // distance measure, converged to 6.2 weight for manhattan distance and 5.5 weight for euclidean distance
          let dist = 6.2 * this.manhattan_distance([i,j], provinces[prov].get_center) + this.euclidean_distance([i,j], provinces[prov].get_center) * 5.5;
          provinces[prov].update_dist = (dist);
          
          if(prov === 0) {
           continue;
          }

          // if within minimum distance, then update province to be assigned to 
          if(dist <= provinces[province_min].get_dist) {
            province_min = prov;
          }

        }
    
        // after iterating over each province, assign point to particular province
        provinces[province_min].add_region([i,j]);
    
      }

    }

    return provinces;

  }


  // plot a single unit, modelling an army piece on the board as a rectangle
  plot_unit(unit) {
    // plot img on canvas
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');
    let img = new Image();
    let x = unit.state.x;
    let y = unit.state.y;
    img.src = require("./images/sword.png");
  // tint image
    ctx.fillStyle = (unit.state.colour);
    ctx.fillRect(x, y, 40, 40);
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.drawImage(img, x, y, 40, 40);
    ctx.restore();
    // console.log(x,y);
  }
 

  // helper function to plot all units, should be called at the start
  plot_all_units() {
    // get all values of this.province_map
    let provinces = Object.values(this.province_map);
    for(let i = 0; i < provinces.length; i++) {
      // New unit instance
      // console.log(provinces[i].get_occupier);
      if(provinces[i].occupier.is_destroyed()) { continue };
      // console.log(provinces[i].occupier);
      this.plot_unit(provinces[i].occupier);
    } 
  }
  
  // random colour for each province
  gen_random_rgb() {
    let r = Math.floor(Math.random() * 255);
    let g = Math.floor(Math.random() * 255);
    let b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // this function gets closest provinces to a coordinate
  closest_provinces(x, y, province_lst) {
    let map_province = {};
    for(let i = 0; i < province_lst.length; i++) {
        let d = this.euclidean_distance([x,y], province_lst[i].get_center);
        map_province[province_lst[i].name] = d;    
    }

    let sorted_map = Object.entries(map_province).sort((a,b) => a[1] - b[1]);
    return [sorted_map[0], sorted_map[1], sorted_map[2]];
  }


  get_index_from_name(province_name, province_lst) {
    for(let i = 0; i < province_lst.length; i++) {
      if(province_lst[i].name === province_name) {
        return i;
      }
    }
  }

  get_average_center(pixel_lst) {
    let x_avg = 0;
    let y_avg = 0;
    for(let i = 0; i < pixel_lst.length; i++) {
      x_avg += pixel_lst[0];
      y_avg += pixel_lst[1];
    }

    return [x_avg / pixel_lst.length, y_avg / pixel_lst.length];
  
  }

  // ideally only run once because super inefficient
  map_adjacency(province_lst) {
    for(let i = 0; i < this.adjacency_map.length; i++) {
      this.adjacency_map[i] = [];
    }

    const min_dist = 3;
    // iterate over any two provinces and if they are ever only separated by less than four units then assume they are adjacent
    for(let i = 0; i < province_lst.length; i++) {
      for(let j = 0; j < province_lst.length; j++) {
        if(i === j) { continue; }
        // console.log(province_lst[j].name, this.adjacency_map[province_lst[i].name]);
        if(this.adjacency_map[province_lst[i].name].includes(province_lst[j].name) || this.adjacency_map[province_lst[j].name].includes(province_lst[i].name)) {
          continue;
        }

        let region_lst_prov1 = province_lst[i].get_region_lst;
        region_lst_prov1 = region_lst_prov1.sort(() => (Math.random() - 0.5));
        // console.log(region_lst_prov1);
        let region_lst_prov2 = province_lst[j].get_region_lst;
        region_lst_prov2 = region_lst_prov2.sort(() => (Math.random() - 0.5));


        break_point:
        for(let reg_coord1 = 0; reg_coord1 < region_lst_prov1.length; reg_coord1+=5) {
          for(let reg_coord2 = 0; reg_coord2 < region_lst_prov2.length; reg_coord2+=5) {
            let dist = this.euclidean_distance(region_lst_prov1[reg_coord1], region_lst_prov2[reg_coord2]);
            // verification and creating adjacency map
            if(Math.abs(dist) < Math.abs(min_dist)) {
              // console.log(dist);
              this.adjacency_map[province_lst[i].name].push(province_lst[j].name);
              this.adjacency_map[province_lst[j].name].push(province_lst[i].name);
              break break_point;
            }
          }
        }
      }
    }

    this.props.create_adjacency(this.adjacency_map);
    // console.log(this.adjacency_map);

  }


  // plot provinces upon component mount
  componentDidMount() {
    let provinces = this.map_points();
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext('2d');

    for(let i = 0; i < provinces.length; i++) { 
      // choose random color 
      let color_prov = this.gen_random_rgb();//color_lst[Math.floor(Math.random() * color_lst.length)];
      ctx.fillStyle = color_prov;
      let reg = (provinces[i].get_region_lst);
      // console.log(provinces[i]);
      for(let reg_coord = 0; reg_coord < reg.length; reg_coord++) {
        // console.log(reg_coord);
        // console.log(reg_coord[0], reg_coord[1]);
        ctx.fillRect(reg[reg_coord][0], reg[reg_coord][1], this.granularity, this.granularity);
      }
    }

    // assign occupier to each province
    for(let i = 0; i < provinces.length; i++) {
      // New unit instance
      let occupier_unit = new Unit(this.plot_all_units);
      provinces[i].set_occupier(occupier_unit);
    }
  

    // assign provinces to each player
    let color_lst = ["red", "blue", "green", "yellow", "white"];
    let corner_lst = [[0,0], [0, this.height], [this.width, 0], [this.width, this.height], [this.width/2, this.height/2]];
    let provinces_temp = [];

    // this is for assigning provinces to players, remove province from list after assignment so everyone gets equal amount
    // create deep copy
    for(let i = 0; i < provinces.length; i++) {
      provinces_temp[i] = provinces[i];
    }


    for(let i = 0; i < corner_lst.length; i++) {
      let closest_four = this.closest_provinces(corner_lst[i][0], corner_lst[i][1], provinces_temp);
      // console.log(closest_four);
      for(let j = 0; j < closest_four.length; j++) {
        let name = closest_four[j];
        const index_to_remove = this.get_index_from_name(name[0], provinces_temp);
        provinces_temp.splice(index_to_remove, 1);

        const index = this.get_index_from_name(name[0], provinces);
        provinces[index].occupier.state.colour = color_lst[i];
        provinces[index].occupier.state.player_owner = i;
      }
    }

    for(let i = 0; i < provinces.length; i++) {
      this.province_map[provinces[i].get_name] = provinces[i];
    }

    // create adjacency map
    this.map_adjacency(provinces);

    // plot all units
    this.plot_all_units();
    this.props.create_province_map(this.province_map);

    // automatically start game if in simulation mode
    if(this.props.mode === "sim") {
      // wait for 2 seconds before starting 
      setTimeout(() => {
        this.props.start_ai();
      }, 2000);
      
    }


  }

  
  // input validation
  validate_inputs(location_a, location_b) {
    // First input
      // second input and third input
    if(location_a in this.province_map && location_b in this.province_map) {
      return true;
    }
    

   return false;
  
  }

  
  // for executing orders
  async post_move(e) {
    e.preventDefault();
    const data = {
      unit_a_cloc : document.getElementById("ua_current").value,
      unit_a_tloc : document.getElementById("ua_target").value,
    }

    // validate inputs and raise error if invalid
    if(!this.validate_inputs(data.unit_a_cloc, data.unit_a_tloc)) {
      alert("Invalid input");
    }

    // get current and target province objects for movement
    this.plot_all_units();
    let province_lst = Object.values(this.province_map); 
    let prov_current = null;
    let prov_target = null;


    for(let i = 0; i < province_lst.length; i++) {
      if(province_lst[i].get_name === data.unit_a_cloc) {
        prov_current = province_lst[i];      
      }

      if(province_lst[i].get_name === data.unit_a_tloc) {
        prov_target = province_lst[i];
      }

    }


    // execute move
    let is_error = prov_current.occupier.move(this.props.turn, prov_target, this.props.support_map, this.adjacency_map, this.province_map, this.props.request_support_callback, this.props.logging_callback);
    
    // wait if error 
    if(!is_error) {
      this.update_your_provinces();
      this.plot_all_units();

      this.props.signal_move_done();

    }
    
  }

  update_init(e) {
    e.preventDefault();
    this.plot_all_units();
    this.update_your_provinces();
  }


  update_your_provinces() {
    let your_provinces = [];
    let provinces_all = Object.values(this.province_map);
    for(let i = 0; i < provinces_all.length; i++) {
      if(provinces_all[i].occupier.state.player_owner === this.props.turn) {
        your_provinces.push(provinces_all[i].get_name);
      }
    }

    this.setState({your_provinces: your_provinces});
    // console.log(your_provinces);

  }

  render() {
    // let mapped_names = this.state.your_provinces.map((province) => <li key={province}>{province}</li>);
    let owner_hover_el = null;
    if(this.state.hovering_province) {
      let owner = this.province_map[this.state.hovering_province].occupier.state.player_owner;
      owner_hover_el = <h2>Owned by Player {owner + 1}</h2>
    }

    let order_box = this.props.phase === "Order" ? (
    <div id="order_box">
      <h1><u>Input Move Order</u></h1>
      <form>
        <label>From:</label>
        <input name="unit_a_cloc" id="ua_current" defaultValue = "Saggitarius"></input>
        <label>To:</label>
        <input name="unit_a_tloc" id="ua_target" defaultValue="Perseus"></input> <br></br>
        <button type = "submit" onClick={this.post_move.bind(this)}>Submit Order</button> <br></br>
        <button onClick={this.update_init}>Start Game</button>
        <br>
        </br>
      </form>
    </div>
  ) : (<br></br>);


    return (
      <div>
        <h1>Diplomacy</h1>

        <canvas ref={this.canvasRef} onMouseMove={this._onMouseMove} width={this.props.width} height={this.props.height} />
          
        <div>
          <h2>Hovering Province: {this.state.hovering_province}</h2>
          {owner_hover_el}
          <br></br>
          <br></br>
          {order_box}
    
          {/* <h1>Your Provinces</h1> */}
            {/* <div> */}
              {/* <ul> */}
              {/* {mapped_names} */}
              {/* </ul> */}
            {/* </div> */}
      </div>
    </div>
    );
  }

};


export default GameBoard;