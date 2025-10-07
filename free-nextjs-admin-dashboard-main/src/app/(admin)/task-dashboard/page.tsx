
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Task Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is the task dashboard for TailAdmin Dashboard Template",
};

export default function TaskDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <h1 className="text-2xl font-bold">Task Dashboard</h1>
      </div>
    </div>
  );
}
