"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import PageTransition from "@/components/layout/PageTransition";
import { useNotification } from "@/components/layout/NotificationComponent";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: string;
}

export default function IndexDBPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const { sendNotification } = useNotification();

    // Inisialisasi IndexedDB
    useEffect(() => {
        const request = indexedDB.open("TodoDB", 1);

        request.onerror = (event) => {
            console.error("Database error: ", event);
        };

        request.onsuccess = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;
            setDb(database);
            loadTodos(database);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains("todos")) {
                const objectStore = database.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
                objectStore.createIndex("text", "text", { unique: false });
                objectStore.createIndex("completed", "completed", { unique: false });
            }
        };
    }, []);

    // Load Semua todo dari IndexedDB
    const loadTodos = (database: IDBDatabase) => {
        const transaction = database.transaction(["todos"], "readonly");
        const objectStore = transaction.objectStore("todos");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            setTodos(result);
        };
    };

    // Tambah Todo baru
    const addTodo = () => {
        if (!db || newTodo.trim() === "") return;
        const transaction = db.transaction(["todos"], "readwrite");
        const objectStore = transaction.objectStore("todos");

        const todo = {
            text: newTodo,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        const request = objectStore.add(todo);

        request.onsuccess = () => {
            loadTodos(db);
            sendNotification({
                title: "Todo Ditambahkan (IndexedDB)",
                body: `"${newTodo}" berhasil ditambahkan ke daftar.`
            });
            setNewTodo("");
        };
    };

    // Toggle Completed Todo
    const toggleTodo = (id: number) => {
        if (!db) return;
        const transaction = db.transaction(["todos"], "readwrite");
        const objectStore = transaction.objectStore("todos");
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            const todo = (event.target as IDBRequest).result;
            todo.completed = !todo.completed;

            const updateRequest = objectStore.put(todo);
            updateRequest.onsuccess = () => {
                loadTodos(db);
                sendNotification({
                    title: "Status Todo Diperbarui",
                    body: `Status todo "${todo.text}" diubah menjadi ${todo.completed ? "selesai" : "belum selesai"}.`
                });
            };
        };
    };

    // Hapus satu Todo
    const deleteTodo = (id: number) => {
        if (!db) return;
        const transaction = db.transaction(["todos"], "readwrite");
        const objectStore = transaction.objectStore("todos");
        const request = objectStore.delete(id);

        request.onsuccess = () => {
            loadTodos(db);
            sendNotification({
                title: "Todo Dihapus",
                body: "Todo berhasil dihapus dari IndexedDB."
            });
        };
    };

    // Hapus semua Todo
    const clearTodos = () => {
        if (!db) return;
        const transaction = db.transaction(["todos"], "readwrite");
        const objectStore = transaction.objectStore("todos");
        const request = objectStore.clear();

        request.onsuccess = () => {
            loadTodos(db);
            sendNotification({
                title: "Semua Todo Dihapus",
                body: "Seluruh daftar todo telah dibersihkan."
            });
        };
    };

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
                    {/* PERBAIKAN DI SINI: Menghapus max-w-5xl agar kontainer mengikuti 100% lebar layar browser */}
                    <div className="w-full space-y-6">

                        {/* Tombol Kembali */}
                        <div className="mb-6">
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Home
                            </Link>
                        </div>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 md:p-8 rounded-xl shadow-lg">
                            <h1 className="text-2xl md:text-3xl font-bold">Todo List with IndexedDB</h1>
                            <p className="text-sm opacity-90">Database Browser untuk data kompleks</p>
                        </div>

                        {/* Input Form - Menggunakan flex-col (mobile) ke flex-row (desktop) */}
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
                            <h2 className="text-xl font-bold mb-4">Tambah Todo</h2>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                                    placeholder="Apa yang ingin anda lakukan"
                                    className="flex-grow w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={addTodo}
                                    className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    Tambah
                                </button>
                            </div>
                        </div>

                        {/* Todo List */}
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                <h2 className="text-xl font-bold">Daftar Todo ({todos.length})</h2>
                                {todos.length > 0 && (
                                    <button
                                        onClick={clearTodos}
                                        className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    >
                                        Hapus Semua
                                    </button>
                                )}
                            </div>

                            {todos.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <p className="text-4xl mb-2">-</p>
                                    <p>Tidak ada todo yang tersedia</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {todos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => toggleTodo(todo.id)}
                                                className="w-5 h-5 cursor-pointer shrink-0"
                                            />
                                            <span
                                                className={`flex-1 text-sm break-all ${todo.completed ? "line-through text-gray-400" : ""}`}
                                            >
                                                {todo.text}
                                            </span>
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm shrink-0"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageTransition>
        </MainLayout>
    );
}