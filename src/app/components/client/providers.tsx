"use client";

import { ConfirmProvider } from "@/app/components/ui/confirm_dialog";
import { ToastProvider } from "@/app/components/ui/toast";

export const Providers = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
);
