import { JSX, Component, createSignal, createEffect } from "solid-js";

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
      <textarea value={props.task.body} onchange={handleChange}></textarea>
    </li>
  );
};

const App: Component = () => {
  const [tasks, setTasks] = createSignal<Task[]>([]);

  const handleDownload = () => {};

  const handleCreateTask = () => {
    setTasks((prev) =>
      prev.concat([
        { title: `Opgave ${prev.length + 1}`, body: "", questions: [] },
      ])
    );
  };

  createEffect(() => {
    tasks().forEach((task) => console.log(task));
  });

  return (
    <div class="bg-[#D9D9D9] min-h-screen">
      <header class="w-screen drop-shadow">
        <nav class="w-full h-12 bg-[#002B59] flex items-center justify-center">
          <p class="text-white">Eksamenssæt Maj 2023</p>
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
