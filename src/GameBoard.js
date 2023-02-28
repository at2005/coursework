import logo from './logo.svg';

import React from 'react';
import { createRef } from 'react';
// import "./Province";
import Unit from "./Unit.js";
import Stages from "./Stages.js";
import Province from "./Province.js";


class NoiseBoard extends React.Component {
  constructor(props) {
    super(props);
    this.height = 800;
    this.width = 800;
    this.num_provinces = 16;
    this.granularity = 2;
    this.canvasRef = createRef();
    this.update_init = this.update_init.bind(this);

    // map of length 16
    this.province_map = {
      "Saggitarius" : null,
      "Perseus" : null,
      "Eridanus" : null,
      "Cassiopeia" : null,
      "Cepheus" : null,
      "Cygnus" : null,
      "Aquila" : null,
      "Pegasus" : null,
      "Andromeda" : null,
      "Orion" : null,
      "Ursa Major" : null,
      "Ursa Minor" : null,
      "Local Group" : null,
      "Sirius" : null,
      "Canis Major" : null,
      "Canis Minor" : null,
    };
  }

  // different distance measures
  euclidean_distance(p1_lst, p2_lst) {
    let x1 = p1_lst[0];
    let y1 = p1_lst[1];
    let x2 = p2_lst[0];
    let y2 = p2_lst[1];
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))    

  }

  manhattan_distance(p1_lst, p2_lst) {
    let x1 = p1_lst[0];
    let y1 = p1_lst[1];
    let x2 = p2_lst[0];
    let y2 = p2_lst[1];
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
  
  check_approx(coord, coords) {
    let dist_min = 100;
    for(let i = 0; i < coords.length; i++) {
      if(this.euclidean_distance(coord, coords[i]) < dist_min) {
        return false;
      }
    }

    return true;
  }

  // use voronoi noise to generate province regions/boundaries
  scatter_points() {
    // scatter voronoi points randomly
    let coords = [];
    for(let i = 0; i < this.num_provinces; i++) {
      let coord = [Math.floor(Math.random() * (this.width)), Math.floor(Math.random() * (this.height))];
      if(this.check_approx(coord, coords)) {
        coords[i] = coord;
      }

      else {
        i -= 1;
      }
    }
  
    return coords;
  }
    
    
  // map coordinates to Province objects
  create_provinces() {
    // get coordinates
    let province_lst = [];
    let province_coords = this.scatter_points();
    for(let i = 0; i < this.num_provinces; i++) {
      province_lst[i] = new Province(province_coords[i]);
      province_lst[i].set_name = Object.keys(this.province_map)[i];
      this.province_map[province_lst[i].name] = province_lst[i];
    }
    
    return province_lst;

  }



  // map each pixel to Province
  map_points() {
    var provinces = this.create_provinces();
    for(let i = 0; i < this.height; i+=this.granularity) {
      for(let j = 0; j < this.width; j+=this.granularity) {
        // iterate over each province
        let province_min = 0;
        for(let prov = 0; prov < this.num_provinces; prov++) {
          // temporary province as initial
          let dist = 1.2 * this.manhattan_distance([i,j], provinces[prov].get_center) + this.euclidean_distance([i,j], provinces[prov].get_center) * 5.5;
          provinces[prov].update_dist = (dist);
          
          if(prov == 0) {
           continue;
          }

          // console.log(dist);
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
 

  plot_all_units() {
    // get all values of this.province_map
    let provinces = Object.values(this.province_map);
    for(let i = 0; i < provinces.length; i++) {
      // New unit instance
      // console.log(provinces[i].get_occupier);
      if(provinces[i].occupier.is_destroyed()) { continue };
      this.plot_unit(provinces[i].occupier);
    } 
  }
  
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
    return [sorted_map[0], sorted_map[1], sorted_map[2], sorted_map[3]];
  }


  get_index_from_name(province_name, province_lst) {
    for(let i = 0; i < province_lst.length; i++) {
      if(province_lst[i].name == province_name) {
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
      let occupier_unit = new Unit();
      provinces[i].set_occupier(occupier_unit);
    }


    let color_lst = ["red", "blue", "green", "yellow"];
    let corner_lst = [[0,0], [0, this.height], [this.width, 0], [this.width, this.height]];
    let provinces_temp = provinces;
    for(let i = 0; i < corner_lst.length; i++) {
      let closest_four = this.closest_provinces(corner_lst[i][0], corner_lst[i][1], provinces_temp);
      // console.log(closest_four);
      for(let j = 0; j < closest_four.length; j++) {
        let name = closest_four[j];
        let index = this.get_index_from_name(name[0], provinces_temp);
        provinces_temp[index].occupier.state.colour = color_lst[i];
      }
    }

    for(let i = 0; i < provinces.length; i++) {
      // console.log(provinces[i].occupier.state.colour);
      provinces[i].center = this.get_average_center(provinces[i].get_region_lst);
      this.province_map[provinces[i].get_name] = provinces[i];
    }
    

    this.plot_all_units();

  }

  // input validation
  validate_inputs(type, location_a, location_b) {
    // First input
    if(type === "Army" || type === "Fleet") {
      // second input and third input
      if(location_a in this.province_map && location_b in this.province_map) {
        return true;
      }
    }

   return false;
  
  }

  
  // for executing orders
  async post_move(e) {
    e.preventDefault();
    const data = {
      unit_a_type : document.getElementById("ua_type").value,
      unit_a_cloc : document.getElementById("ua_current").value,
      unit_a_tloc : document.getElementById("ua_target").value,
    }

    // validate inputs and raise error if invalid
    if(!this.validate_inputs(data.unit_a_type, data.unit_a_cloc, data.unit_a_tloc)) {
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

    prov_current.occupier.move(prov_target, this.props.support_map);
    this.plot_all_units();


    // // post data to server at port 3005
    // await fetch('http://localhost:3005/write_move', { 
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // })
    // .then(response => response.json())
    // .then(data => {
    //   console.log('Success:', data);
    // }
    // )
    // .catch((error) => {
    //   console.error('Error:', error);
    // }
    // );
  }

  // for multiplayer, don't worry until later
  get_recent_move() {
    fetch('http://localhost:3005/get_move')
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    }
    )
    .catch((error) => {
      console.error('Error:', error);
    }
    );
  }

  update_init(e) {
    e.preventDefault();
    this.plot_all_units();
  }

  render() {
    return (
      <div>
      <h1>Diplomacy</h1>
        <canvas ref={this.canvasRef} width={this.props.width} height={this.props.height} />

        <div>
        <h1>Order Input</h1>
        <form>
          <input name="unit_a_type" id="ua_type" defaultValue="Army"></input>
          <input name="unit_a_cloc" id="ua_current" defaultValue = "Saggitarius"></input>
          <input name="unit_a_tloc" id="ua_target" defaultValue="Perseus"></input>
          <button type = "submit" onClick={this.post_move.bind(this)}>Submit Order</button>
          <button onClick={this.update_init}>Update</button>
        </form>
        <br>
        </br>
        <br></br>
      </div>

    </div>
    );
  }

};


class GameBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Game Board</h1>
        <NoiseBoard height="800" width="800"/>
      </div>
    );
  }
};

export default GameBoard;