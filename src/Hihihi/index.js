import React, { Component } from "react";
import DesignCanvas from "./DesignCanvas";
import "fabric-webpack";

import Button from "./Button";
class Hihihi extends Component {
  render() {
    return (
      <div>
        <DesignCanvas>
          <Button />
        </DesignCanvas>
      </div>
    );
  }
}

export default Hihihi;
