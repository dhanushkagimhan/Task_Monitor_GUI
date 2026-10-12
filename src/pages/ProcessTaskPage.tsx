import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { io } from "socket.io-client";

import { getTask, startTaskProcessing } from "../api/tasks";
import type { Task } from "../types/task";

const SOCKET_URL = "http://localhost:3000";

export default function ProcessTaskPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const startedRef = useRef(false);

    const taskQuery = useQuery({
        queryKey: ["task", id],
        queryFn: () => getTask(id!),
        enabled: Boolean(id),
    });

    useEffect(() => {
        if (!id) return;

        let disposed = false;
        const socket = io(SOCKET_URL);

        socket.on("connect", () => {
            socket.emit("join-task", { taskId: id });
        });

        socket.on("task:progress", (update: Partial<Task> & { taskId: string }) => {
            if (update.taskId !== id) return;

            queryClient.setQueryData<Task>(["task", id], (old) =>
                old ? { ...old, ...update } : old,
            );

            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        });

        socket.on("task:joined", async () => {
            try {
                const task = await queryClient.fetchQuery({
                    queryKey: ["task", id],
                    queryFn: () => getTask(id),
                });

                if (
                    disposed ||
                    startedRef.current ||
                    task.status === "processing" ||
                    task.status === "completed"
                ) {
                    return;
                }

                startedRef.current = true;

                await startTaskProcessing(id);
                await queryClient.invalidateQueries({
                    queryKey: ["task", id],
                });
            } catch (error) {
                console.error("Could not start task processing:", error);
                queryClient.invalidateQueries({
                    queryKey: ["task", id],
                });
            }
        });

        return () => {
            disposed = true;
            socket.disconnect();
        };
    }, [id, queryClient]);

    if (taskQuery.isPending) {
        return <p className="p-8">Loading task...</p>;
    }

    if (taskQuery.isError || !taskQuery.data) {
        return (
            <main className="p-8">
                <p>Could not load this task.</p>
                <Link to="/" className="text-indigo-600 underline">
                    Back to tasks
                </Link>
            </main>
        );
    }

    const task = taskQuery.data;

    const statusStyles: Record<string, string> = {
        pending: "bg-slate-100 text-slate-700",
        processing: "bg-indigo-100 text-indigo-700",
        completed: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
    };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-12">
            <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <Link to="/" className="text-sm font-medium text-indigo-600">
                    ← Back to tasks
                </Link>

                <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-indigo-600">
                    Task processing
                </p>

                <h1 className="mt-2 break-words text-3xl font-bold text-slate-900">{task.title}</h1>

                <div className="mt-6">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                            statusStyles[task.status] ?? statusStyles.pending
                        }`}
                    >
                        {task.status}
                    </span>
                </div>

                <div className="mt-8">
                    <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">Progress</span>
                        <span className="font-semibold text-slate-900">{task.progress}%</span>
                    </div>

                    <div
                        className="h-3 overflow-hidden rounded-full bg-slate-200"
                        role="progressbar"
                        aria-valuenow={task.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                task.status === "failed" ? "bg-red-500" : "bg-indigo-600"
                            }`}
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                </div>

                {task.status === "processing" && (
                    <p className="mt-6 text-slate-600">
                        Your task is running. Progress updates will appear automatically.
                    </p>
                )}

                {task.status === "completed" && (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                        <h2 className="font-semibold text-green-800">
                            ✓ Task completed successfully!
                        </h2>
                        <p className="mt-2 text-green-700">
                            {task.result ?? "Processing finished."}
                        </p>
                    </div>
                )}

                {task.status === "failed" && (
                    <div className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">
                        Task processing failed. Return to the task list and try again.
                    </div>
                )}

                <p className="mt-6 text-xs text-slate-400">Task ID: {task._id}</p>
            </section>
        </main>
    );
}
