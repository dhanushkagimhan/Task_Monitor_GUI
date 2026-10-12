import { useState, type SubmitEvent } from "react";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "../hooks/useTasks";
import { useNavigate } from "react-router";

export default function HomePage() {
    const [title, setTitle] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const tasksQuery = useTasks();
    const createMutation = useCreateTask();
    const updateMutation = useUpdateTask();
    const deleteMutation = useDeleteTask();

    const navigate = useNavigate();

    const isSaving = createMutation.isPending || updateMutation.isPending;

    function handleCreate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        createMutation.mutate(
            { title: trimmedTitle },
            {
                onSuccess: () => setTitle(""),
            },
        );
    }

    function handleUpdate(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!editingId || !editingTitle.trim()) return;

        updateMutation.mutate(
            {
                id: editingId,
                data: { title: editingTitle.trim() },
            },
            {
                onSuccess: () => {
                    setEditingId(null);
                    setEditingTitle("");
                },
            },
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900">
            <section className="mx-auto max-w-2xl">
                <header className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                        Task Manager
                    </p>
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Organize your work.</h1>
                    <p className="mt-2 text-slate-600">
                        Manage your tasks with React, NestJS and MongoDB.
                    </p>
                </header>

                <form
                    onSubmit={handleCreate}
                    className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="What do you need to do?"
                        maxLength={200}
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                        disabled={!title.trim() || isSaving}
                        className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createMutation.isPending ? "Adding..." : "Add task"}
                    </button>
                </form>

                {createMutation.isError && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                        Could not create the task. Please try again.
                    </p>
                )}

                {tasksQuery.isPending && (
                    <p className="py-10 text-center text-slate-500">Loading tasks...</p>
                )}

                {tasksQuery.isError && (
                    <div role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
                        Could not load tasks. Check that your NestJS API and MongoDB are running.
                        <button
                            onClick={() => tasksQuery.refetch()}
                            className="ml-2 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {tasksQuery.isSuccess && (
                    <section className="mt-8">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Your tasks</h2>
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                                {tasksQuery.data.length} total
                            </span>
                        </div>

                        {tasksQuery.data.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center text-slate-500">
                                No tasks yet. Add your first task above!
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {tasksQuery.data.map((task) => (
                                    <li
                                        key={task._id}
                                        className="rounded-xl bg-white p-4 shadow-sm"
                                    >
                                        {editingId === task._id ? (
                                            <form
                                                onSubmit={handleUpdate}
                                                className="flex flex-wrap gap-2"
                                            >
                                                <input
                                                    autoFocus
                                                    value={editingTitle}
                                                    onChange={(event) =>
                                                        setEditingTitle(event.target.value)
                                                    }
                                                    maxLength={200}
                                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
                                                />
                                                <button
                                                    disabled={
                                                        !editingTitle.trim() ||
                                                        updateMutation.isPending
                                                    }
                                                    className="rounded-lg bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    className="rounded-lg border px-3 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="break-words font-medium">
                                                        {task.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Created{" "}
                                                        {new Date(
                                                            task.createdAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/tasks/${task._id}/process`)
                                                        }
                                                        disabled={
                                                            task.status === "processing" ||
                                                            task.status === "completed"
                                                        }
                                                        className={`rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50 ${task.status === "completed" ? "bg-green-800" : "bg-indigo-600 hover:bg-indigo-700"}`}
                                                    >
                                                        {task.status === "processing"
                                                            ? "Processing..."
                                                            : "Process task"}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(task._id);
                                                            setEditingTitle(task.title);
                                                        }}
                                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (
                                                                window.confirm("Delete this task?")
                                                            ) {
                                                                deleteMutation.mutate(task._id);
                                                            }
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {(updateMutation.isError || deleteMutation.isError) && (
                            <p role="alert" className="mt-3 text-sm text-red-600">
                                An operation failed. Please try again.
                            </p>
                        )}
                    </section>
                )}
            </section>
        </main>
    );
}
