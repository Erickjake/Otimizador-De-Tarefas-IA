import { useEffect, useReducer, useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaMagic } from "react-icons/fa";
import type { Action, Task } from "../../Types/Tipos";
import { getTaskSuggestions } from "../../services/aiService";

// --- LÓGICA DE ESTADO (Reducer) ---
const initialState: Task[] = [];

function reducer(state: Task[] = initialState, action: Action): Task[] {
    switch (action.type) {
        case "add":
            return [action.payload, ...state];
        case "remove":
            return state.filter(task => task.id !== action.payload.id);
        case "toggle":
            return state.map(task =>
                task.id === action.payload.id ? { ...task, completed: !task.completed } : task
            );
        case "clear":
            return [];
        default:
            return state;
    }
}

// Função para inicializar o estado
function init(): Task[] {
    return JSON.parse(localStorage.getItem('tasks') || '[]')
}


// --- COMPONENTES FILHOS ---

const TaskForm = ({ onAddTask }: { onAddTask: (title: string) => void }) => {
    const [input, setInput] = useState('');
    const handleSubmit = () => {
        if (input.trim() === '') return;
        onAddTask(input);
        setInput('');
    }
    return (
        <div className="flex gap-2 mb-4">
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="O que precisa ser feito hoje?"
                className="flex-grow bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <button
                onClick={handleSubmit}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex-shrink-0"
            >
                Adicionar
            </button>
        </div>
    );
};

const TaskStats = ({ tasks, onClear }: { tasks: Task[], onClear: () => void }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    return (
        <div className="flex justify-between items-center mb-6 bg-gray-800 p-3 rounded-lg">
            <div className="flex gap-4 text-sm">
                <span className="font-semibold text-gray-300">Total: <span className="bg-blue-500 text-blue-50 font-bold px-2 py-1 rounded-full">{totalTasks}</span></span>
                <span className="font-semibold text-gray-300">Concluídas: <span className="bg-green-500 text-green-50 font-bold px-2 py-1 rounded-full">{completedTasks}</span></span>
            </div>
            {totalTasks > 0 && (
                <button
                    onClick={onClear}
                    className="bg-red-800 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
                >
                    Limpar Tudo
                </button>
            )}
        </div>
    );
};

interface TaskItemProps {
    task: Task;
    onRemove: (id: number) => void;
    onToggle: (id: number) => void;
    onGetSuggestions: (task: Task) => void;
    isSuggestingForThisTask: boolean;
}
const TaskItem = memo(({ task, onRemove, onToggle, onGetSuggestions, isSuggestingForThisTask }: TaskItemProps) => {
    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md ${task.completed ? 'opacity-50' : ''}`}
        >
            <span className={`flex-grow text-gray-300 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
            </span>
            <div className="flex items-center gap-2 ml-4">
                {!task.completed && (
                    <button
                        onClick={() => onGetSuggestions(task)}
                        disabled={isSuggestingForThisTask}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                        aria-label="Obter sugestões da IA"
                    >
                        {isSuggestingForThisTask ? <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : <FaMagic size={12} />}
                    </button>
                )}
                <button
                    onClick={() => onToggle(task.id)}
                    className={`font-bold text-xs py-1 px-3 rounded-md transition-colors ${task.completed ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {task.completed ? 'Restaurar' : 'Concluir'}
                </button>
                <button
                    onClick={() => onRemove(task.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1 px-3 rounded-md transition-colors"
                >
                    Remover
                </button>
            </div>
        </motion.li>
    );
});


// --- COMPONENTE PRINCIPAL (Orquestrador) ---
export function Tasks() {
    const [state, dispatch] = useReducer(reducer, initialState, init);
    const [suggestingTaskId, setSuggestingTaskId] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(state));
    }, [state]);

    const handleAddTask = (title: string) => dispatch({ type: 'add', payload: { title, id: Date.now(), completed: false } });
    const handleRemoveTask = (id: number) => dispatch({ type: 'remove', payload: { id } });
    const handleToggleTask = (id: number) => dispatch({ type: 'toggle', payload: { id } });
    const handleClearTasks = () => dispatch({ type: 'clear' });

    const handleGetSuggestions = async (taskToBreak: Task) => {
        setSuggestingTaskId(taskToBreak.id);
        try {
            const suggestions = await getTaskSuggestions(taskToBreak.title);
            if (suggestions.length > 0) {
                suggestions.forEach(title => {
                    dispatch({ type: 'add', payload: { title, id: Date.now() + Math.random(), completed: false } });
                });
                dispatch({ type: 'remove', payload: { id: taskToBreak.id } });
            } else {
                alert("A IA não conseguiu gerar sugestões para esta tarefa.");
            }
        } finally {
            setSuggestingTaskId(null);
        }
    };

    return (
        <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center pt-10 font-sans">
            <div className="w-full max-w-2xl p-4">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-500">
                        Gerenciador de Tarefas IA ✨
                    </h1>
                </header>

                <TaskForm onAddTask={handleAddTask} />
                <TaskStats tasks={state} onClear={handleClearTasks} />

                <section>
                    <ul className="space-y-3">
                        <AnimatePresence>
                            {state.length > 0 ? (
                                state.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onRemove={handleRemoveTask}
                                        onToggle={handleToggleTask}
                                        onGetSuggestions={handleGetSuggestions}
                                        isSuggestingForThisTask={suggestingTaskId === task.id}
                                    />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-10 px-4 bg-gray-800 rounded-lg"
                                >
                                    <p className="text-gray-400">Nenhuma tarefa por aqui ainda.</p>
                                    <p className="text-gray-500 text-sm">Que tal adicionar uma?</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ul>
                </section>
            </div>
        </main>
    );
}