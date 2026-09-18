"use client";

import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

export function AuthControl() {
  const { user, loading, error, signIn, signOutUser } = useAuth();

  if (loading) return <span className="text-sm text-slate-500">Checking account...</span>;

  if (!user) {
    return <div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={signIn} className="border-cyan-400/25 text-cyan-200 hover:bg-cyan-400/10"><LogIn /> Sign in with Google</Button>{error && <span className="hidden max-w-48 text-xs text-rose-300 lg:inline">{error}</span>}</div>;
  }

  return <div className="flex items-center gap-2"><span className="hidden max-w-36 truncate text-sm text-slate-400 sm:inline">{user.displayName ?? user.email}</span><Button size="sm" variant="outline" onClick={signOutUser} aria-label="Sign out" className="border-white/10 text-slate-300 hover:bg-white/5"><LogOut /></Button>{error && <span className="hidden text-xs text-rose-300 lg:inline">{error}</span>}</div>;
}