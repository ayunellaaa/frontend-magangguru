"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
    const [loading, setLoading] = useState(true);
    // Tambahkan state ini untuk mencegah Hydration Error
    const [isMounted, setIsMounted] = useState(false);
    const { sendNotification } = useNotification();

    //inisialisasi indexdb
    useEffect(() => {
        setIsMounted(true); // Set true setelah komponen ter-mount di client
        loadTodos();

        //Subcribe ke perubahan realtime
        const channel = supabase
            .channel('todos-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'todos' },
                (payload) => {
                    console.log('Change received!', payload);
                    loadTodos();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    //Load Semua todo dari indexdb
    const loadTodos = async () => {
        try {
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTodos(data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading todos;', error);
            setLoading(false);
        }
    };

    //Tambah Todo baru
    const addTodo = async () => {
        try {
            if (newTodo.trim() === "") return;
            const todoText = newTodo;
            const { error } = await supabase
                .from('todos')
                .insert([{ text: todoText, completed: false }]);

            if (error) throw error;
            sendNotification({
                title: "Todo Ditambahkan (Supabase)",
                body: `"${todoText}" berhasil ditambahkan ke database.`
            });
            setNewTodo("");
            loadTodos(); // Memastikan UI ter-refresh setelah menambah data
        } catch (error: any) {
            console.error('Error adding todo:', error?.message || error, JSON.stringify(error));
        }
    };

    //Togle Completed Todo
    const toggleTodo = async (id: number, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('todos')
                .update({ completed: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            sendNotification({
                title: "Status Todo Diperbarui",
                body: `Status todo diubah menjadi ${!currentStatus ? "selesai" : "belum selesai"}.`
            });
            loadTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    //Hapus Todo
    const deleteTodo = async (id: number) => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            sendNotification({
                title: "Todo Dihapus",
                body: "Todo berhasil dihapus dari Supabase."
            });
            loadTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    //Hapus semua Todo
    const clearAll = async () => {
        try {
            const { error } = await supabase
                .from('todos')
                .delete()
                .neq("id", 0); //Hapus Semua Record

            if (error) throw error;
            sendNotification({
                title: "Semua Todo Dihapus",
                body: "Seluruh daftar todo telah dibersihkan dari database."
            });
            loadTodos();
        } catch (error) {
            console.error('Error clearing todos:', error);
        }
    };

    // Jika belum mounted di browser, return null atau loading state tipis untuk mencegah perbedaan HTML server-client
    if (!isMounted) {
        return null;
    }

    return (
        <MainLayout>
            <PageTransition>
                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
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
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-md">
                            <h1 className="text-3xl font-bold">Todo List with SSupabase</h1>
                        </div>

                        {/* Input Form */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h2 className="text-xl font-bold mb-4">Tambah Todo</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addTodo()}
                                    placeholder="Apa yang ingin anda lakukan"
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                                />
                                <button
                                    onClick={addTodo}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                >
                                    Tambah
                                </button>
                            </div>
                        </div>

                        {/* Todo List - Sekarang diletakkan sejajar di luar div Input Form agar HTML-nya valid */}
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Daftar Todo ({todos.length})</h2>
                                {todos.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition"
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
                                            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => toggleTodo(todo.id, todo.completed)}
                                                className="w-5 h-5 cursor-pointer"
                                            />
                                            <span
                                                className={`flex-1 text-sm ${todo.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                                            >
                                                {todo.text}
                                            </span>

                                            {/* Tombol hapus satuan */}
                                            <button
                                                onClick={() => deleteTodo(todo.id)}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium transition"
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