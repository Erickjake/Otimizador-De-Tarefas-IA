export type Task = {
  title: string;
  id: number;
  completed: boolean;
};

export type Action =
  | {
      type: "add";
      payload: Task;
    }
  | { type: "remove"; payload: { id: number } }
  | { type: "toggle"; payload: { id: number } }
  | { type: "clear" };
