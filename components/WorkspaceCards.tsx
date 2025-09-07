"use client";

import { useState } from "react";

export default function WorkspaceCards() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: "gmail",
      name: "Gmail",
      icon: "📧",
      description: "Manage your emails efficiently",
      features: ["Read emails", "Send emails", "Search messages", "Manage labels"],
      color: "bg-red-50 border-red-200 hover:border-red-300",
      status: "connected",
    },
    {
      id: "calendar",
      name: "Google Calendar",
      icon: "📅",
      description: "Schedule and manage events",
      features: ["View events", "Create meetings", "Check availability", "Send invites"],
      color: "bg-blue-50 border-blue-200 hover:border-blue-300",
      status: "connected",
    },
    {
      id: "drive",
      name: "Google Drive",
      icon: "📁",
      description: "Access and organize files",
      features: ["Search files", "Read documents", "Create folders", "Share files"],
      color: "bg-green-50 border-green-200 hover:border-green-300",
      status: "connected",
    },
    {
      id: "tasks",
      name: "Google Tasks",
      icon: "✅",
      description: "Track your to-dos",
      features: ["Create tasks", "Set due dates", "Organize lists", "Mark complete"],
      color: "bg-purple-50 border-purple-200 hover:border-purple-300",
      status: "connected",
    },
    {
      id: "forms",
      name: "Google Forms",
      icon: "📝",
      description: "Create surveys and forms",
      features: ["Create forms", "Collect responses", "Share links", "View analytics"],
      color: "bg-yellow-50 border-yellow-200 hover:border-yellow-300",
      status: "connected",
    },
    {
      id: "meet",
      name: "Google Meet",
      icon: "🎥",
      description: "Video conferencing",
      features: ["Schedule meetings", "Generate links", "Calendar integration"],
      color: "bg-indigo-50 border-indigo-200 hover:border-indigo-300",
      status: "connected",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Your Google Workspace</h2>
        <p className="mt-2 text-gray-600">
          All your Google Workspace tools are connected and ready to use through AI commands
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${tool.color} ${
              selectedTool === tool.id ? "ring-2 ring-offset-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedTool(tool.id === selectedTool ? null : tool.id)}
          >
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>

            <div className="text-3xl mb-3">{tool.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{tool.description}</p>

            <div className="mt-4 space-y-1">
              <p className="text-xs font-medium text-gray-700">Available actions:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-1">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {selectedTool === tool.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Try saying: "Show me my recent {tool.name.toLowerCase()} activity"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🚀 Pro Tip: Use Natural Language
        </h3>
        <p className="text-sm text-gray-700">
          You don't need to click on these tools directly. Just describe what you want in the chat, and I'll handle it for you!
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <ExampleChip text="Schedule a meeting with the team tomorrow at 2 PM" />
          <ExampleChip text="Find all documents related to Q3 planning" />
          <ExampleChip text="Send an email to John about the project update" />
        </div>
      </div>
    </div>
  );
}

function ExampleChip({ text }: { text: string }) {
  return (
    <span className="inline-block text-xs px-3 py-1 bg-white text-gray-700 rounded-full border border-gray-200">
      "{text}"
    </span>
  );
}