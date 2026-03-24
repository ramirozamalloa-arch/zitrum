"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, Bookmark } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName = user?.user_metadata?.full_name as string | undefined;
  const userInitials = (displayName ?? user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272A] bg-[#0A0A0B]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-2xl font-bold text-[#D4A853] tracking-tight hover:opacity-90 transition-opacity"
        >
          ZITRUM
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href
                  ? "text-white"
                  : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none rounded-full">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-[#27272A] hover:ring-[#D4A853] transition-all">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-[#1A1A1D] text-[#D4A853] text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[#1A1A1D] border-[#27272A] text-white"
              >
                <div className="px-2 py-1.5">
                  {displayName && (
                    <p className="text-xs font-medium text-white truncate">{displayName}</p>
                  )}
                  <p className="text-xs text-[#A1A1AA] truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#27272A]" />
                <DropdownMenuItem className="hover:bg-[#27272A] cursor-pointer">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#27272A] cursor-pointer">
                  <Link href="/saved" className="flex items-center w-full">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#27272A]" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="hover:bg-[#27272A] cursor-pointer text-[#EF4444] focus:text-[#EF4444]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="text-sm font-semibold bg-[#D4A853] hover:bg-[#C49843] text-black px-4 py-1.5 rounded-[6px] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="md:hidden text-[#A1A1AA] hover:text-white p-2 bg-transparent"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 bg-[#0A0A0B] border-[#27272A] p-0"
          >
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
                <span className="text-xl font-bold text-[#D4A853]">ZITRUM</span>
              </div>

              {/* Mobile nav links */}
              <nav className="flex flex-col gap-1 px-4 py-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      pathname === href
                        ? "bg-[#1A1A1D] text-white"
                        : "text-[#A1A1AA] hover:bg-[#1A1A1D] hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Mobile auth */}
              <div className="mt-auto px-4 py-4 border-t border-[#27272A] space-y-3">
                {user ? (
                  <>
                    <p className="text-xs text-[#A1A1AA] px-3 truncate">{user.email}</p>
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="flex items-center gap-2 w-full rounded-md px-3 py-2.5 text-sm text-[#EF4444] hover:bg-[#1A1A1D]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full border border-[#27272A] text-white hover:bg-[#1A1A1D] rounded-md px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full bg-[#D4A853] hover:bg-[#C49843] text-black font-semibold rounded-md px-4 py-2 text-sm transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
