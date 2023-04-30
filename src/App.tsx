import { JSX, Component, createSignal, createEffect, createContext, Show } from "solid-js";
import { jsPDF as PDF } from "jspdf";

import Toolbar from "./Toolbar";

import { generateDocument, generateQuestion } from "./assignment";
import Icon from "./Icon";
import { Portal } from "solid-js/web";

export type Task = {
  title: string;
  body: string;
  questions: string[];
};

type TaskItemProps = {
  task: Task;
  deleteTask: () => void;
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

  const handleDeleteQuestion = (i: number) => {
    const f: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
      let questions = props.task.questions;
      questions.splice(i, 1);

      props.updateTask({ ...props.task, questions });
    };

    return f;
  };

  return (
    <li class="relative bg-white rounded-xl px-6 py-8 w-full">
      <button onclick={() => props.deleteTask()} class="absolute right-6 top-6 text-neutral-600">
        <Icon name="delete" />
      </button>
      <input
        value={props.task.title}
        onchange={handleTitleChange}
        class="text-2xl font-semibold py-2 my-2"
      />
      <textarea value={props.task.body} onchange={handleBodyChange} class="w-full border p-2" />
      <ol class="flex flex-col gap-2 pb-2">
        {props.task.questions.map((question, i) => (
          <li class="flex items-center">
            <textarea
              value={question}
              onchange={handleQuestionChange(i)}
              class="w-full border p-2 min-h-fit"
            />
            <button
              class="w-10 h-10 flex items-center justify-center text-red-500"
              onclick={handleDeleteQuestion(i)}
            >
              <Icon name="delete" />
            </button>
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
    <div class="col-start-2 col-span-1 justify-self-center flex items-center">
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

const App: Component = () => {
  const [showHelp, setShowHelp] = createSignal(false);

  const [generate, setGenerate] = createSignal<number>(1);
  const [shuffle, setShuffle] = createSignal(false);

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
    <div class="bg-[#D9D9D9] min-h-screen pb-8 relative">
      <header class="w-screen drop-shadow sticky top-0 left-0">
        <nav class="w-full h-12 bg-[#002B59] grid grid-cols-3 items-center justify-center text-white">
          <Title title={title()} setTitle={setTitle} />
          <div class="col-start-3 col-span-1 w-full h-full flex items-center justify-end px-12">
            <button
              onclick={() => setShowHelp(true)}
              class="inline-flex items-center justify-center justify-self-end"
            >
              <Icon name="help" />
            </button>
          </div>
          <Show when={showHelp()}>
            <Portal>
              <div
                class="absolute w-full h-full top-0 bg-black/40 flex justify-center py-8"
                onclick={() => setShowHelp(false)}
              >
                <div
                  class="bg-white rounded px-12 py-12 drop-shadow-md w-8/12"
                  onclick={(e) => e.stopPropagation()}
                >
                  <div class="absolute top-6 w-full right-8 flex justify-end">
                    <button onclick={() => setShowHelp(false)} class="">
                      <Icon name="close" class="!text-4xl" />
                    </button>
                  </div>
                  <h1 class="text-4xl font-semibold">Hjælp</h1>
                  <h2 class="text-2xl font-semibold">Guide</h2>
                  <p>// TODO VIDEO</p>
                  <h2 class="text-2xl font-semibold">Kommandoer</h2>
                  <ul></ul>
                  <h2 class="text-2xl font-semibold">Eksempler</h2>
                </div>
              </div>
            </Portal>
          </Show>
        </nav>
        <div class="w-full h-16 bg-white grid grid-cols-[1fr_auto] pr-12 pl-6 items-center">
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
              deleteTask={() => setTasks((prev) => [...prev.slice(0, i), ...prev.slice(i + 1)])}
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
