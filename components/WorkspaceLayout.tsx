"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import ChatInterface from "./ChatInterface";
import WorkspaceCards from "./WorkspaceCards";

interface WorkspaceLayoutProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function WorkspaceLayout({ user }: WorkspaceLayoutProps) {
  const [activeView, setActiveView] = useState<"chat" | "workspace">("chat");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Nexus</h1>
              <nav className="hidden md:flex space-x-1">
                <button
                  onClick={() => setActiveView("chat")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === "chat"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveView("workspace")}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === "workspace"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Workspace Tools
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "chat" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name?.split(" ")[0]}!
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                How can I help you with your Google Workspace today?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <QuickAction
                icon="✉️"
                title="Email Assistant"
                description="Draft, send, and manage emails"
                example="Draft an email to my team about the meeting"
              />
              <QuickAction
                icon="📅"
                title="Calendar Manager"
                description="Schedule meetings and events"
                example="Schedule a meeting with John next Tuesday"
              />
              <QuickAction
                icon="📁"
                title="Drive Explorer"
                description="Find and organize files"
                example="Find the Q3 report in my Drive"
              />
              <QuickAction
                icon="✅"
                title="Task Creator"
                description="Create and manage tasks"
                example="Create a task to review the proposal"
              />
            </div>

            <ChatInterface userId={user.id} />
          </div>
        ) : (
          <WorkspaceCards />
        )}
      </main>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  example,
}: {
  icon: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 italic">"{example}"</p>
      </div>
    </div>
  );
}