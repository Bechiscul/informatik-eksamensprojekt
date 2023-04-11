import { JSX, Component, createSignal, createEffect, createContext } from "solid-js";
import { jsPDF as PDF } from "jspdf";

import Toolbar from "./Toolbar";

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray<T>(array: T[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

type Task = {
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
    const f: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
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
            <input
              type="text"
              value={question}
              onchange={handleQuestionChange(i)}
              class="w-full border p-2"
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
    <input
      value={props.title}
      onchange={(e) => props.setTitle(e.currentTarget.value)}
      class="bg-transparent text-center outline-none"
    />
  );
};

export type Assignment = {
  title: string;
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

  const [title, setTitle] = createSignal("Opgavesæt");
  const [tasks, setTasks] = createSignal<Task[]>([
    {
      title: "Opgave 1",
      body: "I disse opgave skal du anvende viden om ligninger til at løse ligninger samt redegøre for måden derpå",
      questions: [
        "A) Løs følgende: \\[N100..500]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
      ],
    },
  ]);

  const handleDownload = () => {
    for (let i = 0; i < generate(); i++) {
      const document = new PDF();
      const { getWidth, getHeight } = document.internal.pageSize;
      const [marginX, marginY] = [25, 25];

      // Front Page
      document.setFontSize(32).text(title(), getWidth() / 2, 64, { align: "center" });

      let randomTasks = [...tasks()];
      shuffleArray(randomTasks);
      console.log(randomTasks);

      for (const task of randomTasks) {
        document.addPage();
        document.setFontSize(24).text(task.title, marginX, marginY + 0);

        document.setFontSize(12).text(task.body, marginX, marginY + 12);

        for (let i = 0; i < task.questions.length; i++) {
          const question = task.questions[i];

          //
          if (question.includes("\\[") && question.includes("]\\")) {
            // Parses \\[N5..123]
            const startExpression = question.indexOf("\\[");
            const endExpression = question.lastIndexOf("]\\");
            const expression = question.slice(startExpression + "\\[".length, endExpression);
            // only natural numbers
            if (expression.startsWith("N")) {
              const startRange = expression.indexOf("..");
              const endRange = startRange + "..".length;
              Number.parseInt(expression.slice(1, startRange));

              const min = Number.parseInt(expression.slice(1, startRange));
              const max = Number.parseInt(expression.slice(endRange));

              const number = Math.round(Math.random() * (max - min) + min);
              const generatedQuestion = question
                .slice(0, startExpression)
                .concat(`${number}`)
                .concat(question.slice(endExpression + "]\\".length));

              document.text(generatedQuestion, marginX, marginY + 24 + 12 * i);
            }
          } else {
            document.text(question, marginX + 0, marginY + 24 + 12 * i);
          }
        }
      }

      document.save(`${i + 1}`);
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
              class="w-12 h-10 border rounded text-center rounded-xl"
            />
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
