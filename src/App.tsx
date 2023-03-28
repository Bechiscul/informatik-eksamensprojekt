import { JSX, Component, createSignal, createEffect } from "solid-js";
import { jsPDF as PDF } from "jspdf";

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
  const handleChange: JSX.EventHandler<HTMLTextAreaElement, Event> = (e) => {
    props.updateTask({ ...props.task, body: e.currentTarget.value });
  };

  return (
    <li class="bg-white rounded-xl px-6 py-8 w-full">
      <h2 class="text-2xl font-semibold">{props.task.title}</h2>
      <textarea value={props.task.body} onchange={handleChange} class="w-full" />
      <ol>
        {props.task.questions.map((question) => (
          <li>{question}</li>
        ))}
      </ol>
    </li>
  );
};

const Title: Component<{ title: string; setTitle(_: string): void }> = (props) => {
  return (
    <>
      <p contentEditable={true} class="outline-none border-none">
        {props.title}
      </p>
    </>
  );
};

const App: Component = () => {
  const [title, setTitle] = createSignal("Opgavesæt");
  const [tasks, setTasks] = createSignal<Task[]>([
    {
      title: "Opgave 1",
      body: "I disse opgave skal du anvende viden om ligninger til at løse ligninger samt redegøre for måden derpå",
      questions: [
        "A) Løs følgende: \\[N1..5]\\x + 2 = 5",
        "B) Redegør for måden du løste delspørgsmål `A` på",
      ],
    },
  ]);

  const handleDownload = () => {
    const document = new PDF();
    const { getWidth, getHeight } = document.internal.pageSize;
    const [marginX, marginY] = [25, 25];

    // Front Page
    document.setFontSize(32).text(title(), getWidth() / 2, 64, { align: "center" });

    for (const task of tasks()) {
      document.addPage();
      document.setFontSize(24).text(task.title, marginX, marginY + 0);

      document.setFontSize(12).text(task.body, marginX, marginY + 12);

      for (let i = 0; i < task.questions.length; i++) {
        const question = task.questions[i];

        if (question.includes("\\[") && question.includes("]\\")) {
          // N5..7
          const start = question.indexOf("\\[");
          const end = question.lastIndexOf("]\\");
          console.log(start);
          console.log(end);

          const splitted = question.slice(start + 2, end);
          console.log(splitted);

          const min = Number.parseInt(splitted[1]);
          const max = Number.parseInt(splitted[4]);
          console.log(min);
          console.log(max);

          const number = Math.round(Math.random() * (max - min) + min);
          const generatedQuestion = question
            .slice(0, start)
            .concat(`${number}`)
            .concat(question.slice(end + 2));

          document.text(generatedQuestion, marginX, marginY + 24 + 12 * i);
        } else {
          document.text(question, marginX + 0, marginY + 24 + 12 * i);
        }
      }
    }

    document.save();
  };

  const handleCreateTask = () => {
    setTasks((prev) =>
      prev.concat([{ title: `Opgave ${prev.length + 1}`, body: "", questions: [] }])
    );
  };

  return (
    <div class="bg-[#D9D9D9] min-h-screen">
      <header class="w-screen drop-shadow">
        <nav class="w-full h-12 bg-[#002B59] flex items-center justify-center text-white">
          <Title title={title()} setTitle={setTitle} />
        </nav>
        <div class="w-full h-16 bg-white flex justify-end px-12">
          <button onclick={handleDownload}>Download</button>
        </div>
      </header>
      <main class="px-36 flex items-center flex-col">
        <ul class="w-full">
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
