import React from "react";
import { get } from "lodash";
import defaultOptions from "./defaultOptions";
import { parseSequence } from "./utils";
import mapIcons from "./mapIcons";

const fabric = window.fabric;
const Button = fabric.util.createClass(fabric.Group, {
  type: "button",
  superType: "button",
  leftIcon: {},
  rightIcon: {},
  minWidth: 0,
  minHeight: 0,
  upperCase: false,
  componentName: "Button",
  options: {},
  text: "",
  icon: {},

  getWidth: function () {
    const fullWidth = get(this.options, "fullWidth", false);

    if (fullWidth) return get(this.options, "parentWidth");

    return this.options.width;
  },

  getLeft: function () {
    const fullWidth = get(this.options, "fullWidth", false);
    if (fullWidth) return get(this.options, "deltaX");

    return this.options.x;
  },

  getAttributes() {
    return Object.assign({}, this.options, {
      x: Math.round(this.get("left")),
      y: Math.round(this.get("top")),
      // width: Math.round(this.rect.get("width")),
      // height: Math.round(this.rect.get("height")),
      minWidth: Math.trunc(this.label.get("width")),
      minHeight: Math.trunc(this.label.get("height")),
      borderColor: this.rect.get("stroke"),
      borderWidth: this.rect.get("strokeWidth"),
    });
  },

  handleChangeAttributes(attributes) {
    this.set("options", attributes);
    const width = this.getWidth();
    const x = this.getLeft();
    let { name, icon, text, fullWidth } = attributes;
    const { color, backgroundColor, upperCase } = attributes;
    // const x = attributes.x || this.get("left");
    const y = attributes.y || this.get("top");
    // const width = attributes.width || this.get("width");
    const height = attributes.height || this.get("height");
    const fontSize = attributes.fontSize || this.get("fontSize");
    const borderColor = attributes.borderColor || this.rect.get("borderColor");
    const borderWidth = attributes.borderWidth || this.rect.get("borderWidth");
    const borderRadius =
      attributes.borderRadius || this.rect.get("borderRadius");
    this.rect.set({
      // width: fullWidth?.enable ? attributes.parentWidth : attributes.width,
      width,
      height,
      fill: backgroundColor,
      stroke: borderColor,
      strokeWidth: borderWidth,
      rx: borderRadius,
      ry: borderRadius,
    });
    this.rect.setCoords();
    this.set({
      name,
      text,
      top: y,
      left: x,
      width: fullWidth ? attributes.parentWidth : this.rect.get("width"),
      fullWidth: fullWidth || false,
      lockScalingX: get(this.options, "fullWidth", false),
      // height,
    });
    this.setCoords();

    if (upperCase) {
      text = text.toUpperCase();
    }
    if (icon.enable) {
      const styles = mapIcons[icon.content];
      this.set("icon", icon);
      text = `${parseSequence(icon.content)}  ${text}`;
      this.label.set("styles", {
        0: {
          0: styles,
        },
      });
    } else {
      this.set("icon", {});
      this.label.set({
        fill: this.options.color,
        fontSize: this.options.fontSize,
        fontWeight: 400,
        fontFamily: "Arial",
        styles: {},
      });
    }
    this.label.set({
      fill: color,
      text,
      fontSize,
    });
    if (this.rect.width < this.label.width) {
      const { top, left } = this;
      this.rect.set("width", this.label.width);
      this.forEachObject((o) => {
        this.removeWithUpdate(o).addWithUpdate(o);
      });
      this.set({ top, left });
      this.setCoords();
    }
    this.rect.set({
      fill: backgroundColor,
      height:
        this.label.get("height") > height ? this.label.get("height") : height,
    });
    this.canvas.requestRenderAll();
  },

  initialize(options) {
    options = options || {};
    options.icon = options.icon || {};
    options.fullWidth = options.fullWidth || false;
    this.options = options;
    this.icon = options.icon;
    this.upperCase = options.upperCase;
    this.fullWidth = options.fullWidth || false;
    const commonOptions = {
      originX: "center",
      originY: "center",
    };
    const labelOptions = Object.assign(
      {},
      {
        fill: options.color,
        fontSize: options.fontSize,
        fontWeight: 400,
        styles: {},
        fontFamily: "Arial",
      },
      commonOptions
    );
    let text = options.upperCase ? options.text.toUpperCase() : options.text;
    this.text = text;
    if (options.icon.enable) {
      const icon = parseSequence(options.icon.content);
      text = `${icon}  ${text}`;
      const { fontWeight, fontFamily } = options.icon;
      labelOptions.styles = {
        0: {
          0: {
            fontWeight: fontWeight,
            fontFamily: fontFamily,
          },
        },
      };
    }
    this.label = new fabric.Text(text, labelOptions);
    const rectOptions = Object.assign(
      {},
      {
        x: this.getLeft(),
        fill: options.backgroundColor,
        // width: options.fullWidth?.enable ? options.parentWidth : options.width,
        width: this.getWidth(),
        height:
          this.label.get("height") >= options.height
            ? this.label.get("height")
            : options.height,
        // height: options.height,
        rx: options.borderRadius,
        ry: options.borderRadius,
        strokeWidth: options.borderWidth || 1,
        stroke: options.borderColor || "#756AF8",
      },
      commonOptions
    );
    console.log(rectOptions);

    this.rect = new fabric.Rect(rectOptions);
    this.minWidth = this.label.get("width");
    this.minHeight = this.label.get("height");
    const node = [this.rect, this.label];
    const groupOptions = Object.assign(
      {},
      {
        cid: options.cid,
        name: options.name,
        top: options.y,
        left: this.getLeft(),
        screenId: options.screenId,
        lockScalingX: get(this.options, "fullWidth", false),
        height:
          this.label.get("height") >= options.height
            ? this.label.get("height")
            : options.height,
        minScaleLimit: this.label.get("width") / options.width,
        visible: !options.hidden,
      },
      defaultOptions
    );
    this.callSuper("initialize", node, groupOptions, false);
    this.setControlsVisibility({
      tl: false,
      tr: false,
      bl: false,
      br: false,
      mb: false,
      mt: false,
      mtr: false,
    });
    this.on({
      scaling: function () {
        const newWidth = this.getScaledWidth();
        const scaleX = this.get("width") / newWidth;
        this.label.set({ scaleX: scaleX }).setCoords();
        this.rect
          .set({
            scaleX: scaleX,
            width: newWidth,
          })
          .setCoords();
        this.set("minScaleLimit", this.label.get("width") / newWidth);
      },
      scaled: ({ target }) => {
        target.setCoords().addWithUpdate().canvas.renderAll();
        target.options.width = target.width;
      },
    });
  },

  render(ctx) {
    this.callSuper("render", ctx);
  },
});

class Rect extends React.Component {
  componentDidMount() {
    const button = new Button({
      text: "test",
      x: 0,
      y: 0,
      width: 150,
      height: 20,
      iconName: "f555",
      top: 0,
      left: 0,
    });

    this.props.canvas.add(button);
  }

  render() {
    return null;
  }
}

export default Rect;
