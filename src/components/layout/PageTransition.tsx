// components/PageTransition.tsx
"use client";
import { motion } from "framer-motion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }} // Mulai dari bawah (y: 20) dan transparan
            animate={{ y: 0, opacity: 1 }}  // Bergerak ke posisi asli (y: 0) dan terlihat
            transition={{ duration: 0.5, ease: "easeOut" }} // Durasi animasi
        >
            {children}
        </motion.div>
    );
}