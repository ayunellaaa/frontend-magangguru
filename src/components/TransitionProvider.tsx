"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [key, setKey] = useState(pathname);

    useEffect(() => {
        // Setiap kali pathname berubah, kita ganti key-nya
        // Ini memaksa React untuk me-render ulang elemen pembungkus
        setKey(pathname);
    }, [pathname]);

    return (
        <div key={key} className="animate-fade-in">
            {children}
        </div>
    );
}