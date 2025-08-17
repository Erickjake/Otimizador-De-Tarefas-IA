import type { Action, Task } from "../Types/Tipos";

export const reducer = (state: Task[], action: Action) => {
  console.log(action);
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return state.filter((task) => task.id !== action.payload.id);
    case "toggle":
      return state.map((task) => {
        if (task.id === action.payload.id) {
          return { ...task, completed: !task.completed };
        }
        return task;
      });

    default:
      return state;
  }
};
