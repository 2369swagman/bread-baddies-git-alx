"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Home,
  Compass,
  User,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavigationMenuProps {
  user: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export function NavigationMenu({ user }: NavigationMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      description: "Your community overview",
    },
    {
      label: "Discover Communities",
      icon: Compass,
      href: "/communities/browse",
      description: "Browse and search communities",
    },
    {
      label: "My Communities",
      icon: Users,
      href: "/communities",
      description: "Manage your communities",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile/edit",
      description: "Edit your profile and preferences",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      description: "Account settings",
    },
  ];

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navigate through the platform</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="flex items-center gap-3 py-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} alt={user.fullName || user.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.fullName || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Navigation Items */}
          <nav className="flex-1 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {/* Logout */}
          <div className="py-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Desktop Navigation Header
export function DesktopNavigation({ user }: NavigationMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="hidden md:flex items-center gap-4">
      <Link href="/dashboard">
        <Button variant="ghost">Dashboard</Button>
      </Link>
      <Link href="/communities/browse">
        <Button variant="ghost">Discover</Button>
      </Link>
      <Link href="/communities">
        <Button variant="ghost">My Communities</Button>
      </Link>

      <Separator orientation="vertical" className="h-6" />

      <Link href="/profile/edit">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user.avatarUrl} alt={user.fullName || user.email} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Link>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
