import { Component } from "solid-js";

const FONTS = ["Times New Roman", "Roboto"];

export type ToolbarState = {
  font: string;
  fontSize: number;
};

export type ToolbarProps = {
  fonts?: string[];
  fontSize?: number;

  onChangeFont?: (fontIndex: number) => void;
  onChangeFontSize?: (fontSize: number) => void;
};

const Toolbar: Component = () => {
  return (
    <ul class="flex flex-row">
      <li>Back</li>
      <li>Forward</li>
      <li>
        <select class="bg-slate-200 rounded-md">
          {FONTS.map((font) => (
            <option>{font}</option>
          ))}
        </select>
      </li>
      <li>
        <input type="number" value={12} min={1} max={92} class="bg-slate-200 rounded-md" />
      </li>
      <li>
        <select class="bg-slate-200 rounded-md">
          <option>Overskrift 1</option>
          <option>Overskrift 2</option>
          <option>Overskrift 3</option>
          <option>Overskrift 4</option>
          <option>Overskrift 5</option>
          <option>Overskrift 6</option>
          <option selected>Normal</option>
        </select>
      </li>
    </ul>
  );
};

export default Toolbar;
