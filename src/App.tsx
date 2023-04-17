import { JSX, Component, createSignal, createEffect, createContext } from "solid-js";
import { jsPDF as PDF } from "jspdf";

import Toolbar from "./Toolbar";

import { generateDocument, generateQuestion } from "./assignment";
import Icon from "./Icon";

export type Task = {
  title: string;
  body: string;
  questions: string[];
};

type TaskItemProps = {
  task: Task;
  updateTask: (task: Task) => void;
};

const TaskItem: Component<TaskItemProps> = (props) => {
  const handleTitleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    props.updateTask({ ...props.task, title: e.currentTarget.value });
  };

  const handleBodyChange: JSX.EventHandler<HTMLTextAreaElement, Event> = (e) => {
    props.updateTask({ ...props.task, body: e.currentTarget.value });
  };

  const handleClick = () => {
    let task: Task = {
      title: props.task.title,
      body: props.task.body,
      questions: [...props.task.questions, ""],
    };

    props.updateTask(task);
  };

  const handleQuestionChange = (i: number) => {
    const f: JSX.EventHandler<HTMLTextAreaElement, Event> = (e) => {
      let questions = props.task.questions;
      questions[i] = e.currentTarget.value;

      props.updateTask({ ...props.task, questions });
    };

    return f;
  };

  return (
    <li class="bg-white rounded-xl px-6 py-8 w-full">
      <input
        value={props.task.title}
        onchange={handleTitleChange}
        class="text-2xl font-semibold py-2 my-2"
      />
      <textarea value={props.task.body} onchange={handleBodyChange} class="w-full border p-2" />
      <ol class="flex flex-col gap-2 pb-2">
        {props.task.questions.map((question, i) => (
          <li>
            <textarea
              value={question}
              onchange={handleQuestionChange(i)}
              class="w-full border p-2 min-h-fit"
            />
          </li>
        ))}
      </ol>
      <button onclick={handleClick} class="px-4 text-2xl  bg-blue-400 text-white rounded">
        +
      </button>
    </li>
  );
};

const Title: Component<{ title: string; setTitle(_: string): void }> = (props) => {
  return (
    <div class="flex items-center">
      <input
        value={props.title}
        onchange={(e) => props.setTitle(e.currentTarget.value)}
        class="bg-transparent text-center outline-none"
      />
      <Icon name="edit" class="!text-lg" />
    </div>
  );
};

export type Assignment = {
  title: string;
  tasks: Task[];
};

export type CursorAt = {
  selected?: false;
};

export type CursorSelected = {
  selected: true;
  lineEnd: number;
  columnEnd: number;
};

export type Cursor = { line: number; column: number } & (CursorAt | CursorSelected);

const App: Component = () => {
  const [cursor, setCursor] = createSignal<Cursor | null>(null);
  const [generate, setGenerate] = createSignal<number>(1);
  const [shuffle, setShuffle] = createSignal(false);

  generateQuestion("hello \\[NZQR-5..5]\\ \\[NZ2..10]\\ \\[1,2,3,4]\\");

  const [title, setTitle] = createSignal("Opgavesæt");
  const [tasks, setTasks] = createSignal<Task[]>([
    {
      title: "Opgave 1",
      body: "I disse opgave skal du anvende viden om ligninger til at løse ligninger samt redegøre for måden derpå",
      questions: [
        "A) Løs følgende: \\[100..500]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
      ],
    },
    {
      title: "Question 2",
      body: "I denne opgave skal du anvende og redegøre for forskellige typer af regression.",
      questions: [
        "A) Løs følgende: \\[NZ100..500]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
        "C) Yeeet \\[NZQR-50..50]\\ + \\[10,20,30,40,50]\\ test",
      ],
    },
    {
      title: "Question 3",
      body: "I denne opgave skal du anvende og redegøre for forskellige typer af regression.",
      questions: [
        "A) Løs følgende: \\[NZ100..500]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
        "C) Yeeet \\[NZQR-50..50]\\ + \\[10,20,30,40,50]\\ test",
      ],
    },
    {
      title: "Question 4",
      body: "I denne opgave skal du anvende og redegøre for forskellige typer af regression.",
      questions: [
        "A) Løs følgende: \\[NZ100..500]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
        "C) Yeeet \\[NZQR-50..50]\\ + \\[10,20,30,40,50]\\ test",
      ],
    },
    {
      title: "Question 5",
      body: "I denne opgave skal du anvende og redegøre for forskellige typer af regression.",
      questions: [
        "A) Løs følgende: \\[NZ100..500]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
        "C) Yeeet \\[NZQR-50..50]\\ + \\[10,20,30,40,50]\\ test",
      ],
    },
  ]);

  const handleDownload = () => {
    generateDocument({ title: title(), tasks: tasks() }, { shuffle: true }).save(title());
  };

  const handleCreateTask = () => {
    setTasks((prev) =>
      prev.concat([
        { title: `Opgave ${prev.length + 1}`, body: "Body", questions: ["A)", "B)", "C)"] },
      ])
    );
  };

  return (
    <div class="bg-[#D9D9D9] min-h-screen overflow-x-hidden pb-8">
      <header class="w-screen drop-shadow sticky top-0 left-0">
        <nav class="w-full h-12 bg-[#002B59] flex items-center justify-center text-white">
          <Title title={title()} setTitle={setTitle} />
        </nav>
        <div class="w-full h-16 bg-white grid grid-cols-[1fr_auto] px-12 items-center">
          <Toolbar />
          <div class="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={generate()}
              onchange={(e) => setGenerate(Number.parseInt(e.currentTarget.value))}
              class="w-12 h-10 border text-center rounded-xl"
            />
            <button
              onclick={() => setShuffle((prev) => !prev)}
              class={
                "w-12 h-10 items-center justify-center flex rounded-xl border " +
                (!shuffle()
                  ? " border-neutral-400 text-neutral-400"
                  : "border-blue-500 text-blue-500 border-2")
              }
            >
              <Icon name={shuffle() ? "shuffle_on" : "shuffle"} />
            </button>
            <button
              onclick={handleDownload}
              class="h-11 bg-blue-500 px-3 rounded-xl text-white font-medium"
            >
              Download
            </button>
          </div>
        </div>
      </header>
      <main class="px-36 flex items-center flex-col">
        <ul class="w-full flex flex-col gap-8 py-8">
          {tasks().map((task, i) => (
            <TaskItem
              task={task}
              updateTask={(newTask) => {
                setTasks((prevTasks) => [
                  ...prevTasks.slice(0, i),
                  newTask,
                  ...prevTasks.slice(i + 1),
                ]);
              }}
            />
          ))}
        </ul>
        <button
          onClick={handleCreateTask}
          class="h-12 border-[#203671] border-4 font-bold text-lg text-[#203671] items-center border-dashed w-52 rounded-lg"
        >
          Ny Opgave
        </button>
      </main>
    </div>
  );
};

export default App;
