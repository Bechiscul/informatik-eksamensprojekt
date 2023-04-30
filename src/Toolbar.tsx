import { Component } from "solid-js";

import Icon from "./Icon";

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
    <ul class="flex flex-row items-center gap-2">
      <li class="flex text-neutral-600">
        <button class="w-6 h-10 flex items-center justify-center">
          <Icon name="undo" />
        </button>
        <button class="w-6 h-10 flex items-center justify-center">
          <Icon name="redo" />
        </button>
      </li>
      <li class="h-5 w-[2px] bg-neutral-400"></li>
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
