import { JSXElement } from "solid-js";

export default function Icon(props: { name: string; class?: string }): JSXElement {
  return <span class={`material-symbols-outlined ${props.class}`}>{props.name}</span>;
}
