import React from 'react';
class DiplomaticStage extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
        <div>
          <h1>Diplomatic Stage</h1>
          <form>
            <label for="alliance">Make Alliance:</label>
            <input name = "Send Alliance"></input>
          </form>
            
        </div>
      );
    }
  
  };
  
  
  class OrderStage extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
        <div>
          <h1>Order Stage</h1>
          <form>
              Movement:
              <select name="movement">
                <option value="move">Move</option>
                <option value="attack">Attack</option>
                <option value="support">Support</option>
                <option value="hold">Hold</option>
              </select>
          </form>
        </div>
      );
    }
  };

export default DiplomaticStage;

