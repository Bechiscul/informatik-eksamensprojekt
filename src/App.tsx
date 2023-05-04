import { JSX, Component, createSignal, Show, Setter } from "solid-js";
import { Portal } from "solid-js/web";

import { generateDocument } from "./assignment";

import Toolbar from "./Toolbar";
import Icon from "./Icon";

import imgUrl from "./generering.png";
import videoUrl from "./guide.mp4";

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
  const [showHelp, setShowHelp] = createSignal(true);

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
    for (let i = 0; i < generate(); i++) {
      generateDocument({ title: title(), tasks: tasks() }, { shuffle: true }).save(title());
    }
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
      <header class="w-screen drop-shadow-md sticky top-0 left-0 z-10">
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
            <HelpModal setShowHelp={setShowHelp} />
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

const HelpModal: Component<{ setShowHelp: Setter<boolean> }> = (props) => {
  return (
    <Portal>
      <div
        class="absolute w-full h-full top-0 bg-black/40 py-8 z-20"
        onclick={() => props.setShowHelp(false)}
      >
        <div
          class="bg-white relative left-1/2 top-16 -translate-x-1/2 rounded px-12 py-12 drop-shadow-md w-8/12 h-[80vh] overflow-y-scroll"
          onclick={(e) => e.stopPropagation()}
        >
          <div class="absolute top-6 w-full right-8 flex justify-end">
            <button onclick={() => props.setShowHelp(false)} class="">
              <Icon name="close" class="!text-4xl" />
            </button>
          </div>
          <h1 class="text-4xl font-semibold">Hjælp</h1>
          <p>
            På denne side findes en guide samt hjælp til hvordan man bruger programmet til at
            generere tests.
          </p>
          <h2 class="text-2xl font-semibold my-2">Guide</h2>
          <video src={videoUrl} controls></video>
          <h2 class="text-2xl font-semibold my-2">Kommandoer</h2>
          <p>Lige nu findes der to typer af kommandoer man kan bruge:</p>
          <ul class="">
            <ol class="list-disc list-item list-inside">\[N0..5]\</ol>
            <ol class="list-disc list-item list-inside">\[1,2,3,4,5]\</ol>
          </ul>
          <p class="mt-2">
            Den første type er en række-generering, hvor man kan generere et valgfrit tal mellem et
            start og et slut tal. Den er opbygget således at man starter med at give den 1 eller
            flere talmængder i en række af karakterer efter hinanden. <b>Eksempelvis NZQ</b>.
            Programmet vil udelukkende generere tal som er indenfor de talmængder.
            <br />
            Derefter specificerer man rækken af tal man vil generere, hvor man giver den minimums
            tallet efterfulgt af "<b>..</b>", hvorefter man giver den maksimums tallet. <br />
            Intervallet man giver er inklusivt, den vil altså generere til og med de tal man
            specificerer.
          </p>
          <h3 class="mt-4 text-lg font-medium">Talmængder</h3>
          <ul class="">
            <li class="list-item list-inside list-disc">
              <b>N</b> betyder at den kun genererer positive heltal.{" "}
            </li>
            <li class="list-item list-inside list-disc">
              <b>Z</b> betyder at den kun genererer negative heltal.
            </li>
            <li class="list-item list-inside list-disc">
              <b>Q</b> betyder at den kan genere positive eller negative decimaltal.
            </li>
          </ul>
          <p class="mt-2">
            <b>
              Man kan også kombinere flere talmængder sammen så man kan generere flere tilfældige
              tal. F.eks. NZ eller QZ, hvor NZ betyder positive eller negative heltal samt QZ som
              betyder negative heltal eller decimaltal.
            </b>
          </p>
          <p class="text-red-500 font-semibold mt-2">
            Det er en fejl at give en negativ række af tal og kun specificere N-talmængden. F.eks.
            vil \\[N-5..-2]\\ resultere i en fejl.
          </p>
          <p>
            Den anden type af kommando er en liste af tal eller andre tegn. Man specificerer en
            liste som er separaret med "<b>,</b>". Følgende er eksempler på denne type kommando:
            <br />
            \\[1,2,3,4,5]\\
            <br />
            \\[-1, 1/3, 4.2]\\
            <span class="text-yellow-500 font-semibold">
              <br></br>
              Husk at alle tal skrives med engelsk notation, altså man skal ikke bruge komma, men
              punktum som decimalseparator.
            </span>
          </p>
          <h2 class="text-2xl font-semibold my-2">Generering</h2>
          Når du har lavet testen færdig skal du finde ud af hvor mange testsæt som skal genereres.
          <div class="w-full flex justify-center mt-4">
            <img src={imgUrl} />
          </div>
          <p>
            Oppe i højre hjørne kan man finde de 3 ovenstående knapper. Den første bruges til at
            indskrive antallet af sæt man vil generere. <b>Den 2. knap</b> er en måde at omrokere
            opgaverne, så opgaver kommer i forskellig rækkefølge i de forskellige sæt.{" "}
            <b>Den 3. knap</b> genererer sættene og downloader det specificerede antal sæt ned til
            din computer.
          </p>
          <h2 class="text-2xl font-semibold my-2">Eksempler</h2>
        </div>
      </div>
    </Portal>
  );
};
