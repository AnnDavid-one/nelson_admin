// src/app/(dashboard)/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import {
  BookOpen,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  Users,
  Plus,
  Eye,
  Settings as SettingsIcon,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats();
        if (isMounted) setStats(data);
      } catch (err: any) {
        console.error("Failed to load stats:", err);
        if (isMounted)
          setError(
            "Failed to load metrics. Check your network or admin login.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      title: "Total Books",
      value: stats?.totalBooks || 0,
      subtitle: `${stats?.activeBooks || 0} active`,
      icon: BookOpen,
      color: "bg-blue-500",
      href: "/books",
    },
    {
      title: "Orders",
      value: stats?.totalOrders || 0,
      subtitle: `${stats?.pendingOrders || 0} pending`,
      icon: ShoppingCart,
      color: "bg-green-500",
      href: "/orders",
    },
    // {
    //   title: 'Revenue',
    //   value: `₦${((stats?.totalRevenueKobo || 0) / 100).toLocaleString()}`,
    //   subtitle: 'Total sales',
    //   icon: DollarSign,
    //   color: 'bg-yellow-500',
    //   href: '/orders',
    // },
    // 1223`    `d`
    {
      title: "Customers",
      value: stats?.totalCustomers || 0,
      subtitle: "Registered customers",
      icon: Users,
      color: "bg-orange-500",
      href: "#",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h2 className="font-semibold text-lg">
          Unable to load dashboard stats
        </h2>
        <p className="text-sm mt-1">
          {error || "No data returned from the server."}
        </p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* add new book */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/books/new/edit"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Plus className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Add New Book</h3>
            <p className="text-sm text-gray-500">Create a new book listing</p>
          </div>
        </Link>

        <Link
          href="/orders"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="bg-green-100 p-3 rounded-lg">
            <Eye className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">View Orders</h3>
            <p className="text-sm text-gray-500">Manage customer orders</p>
          </div>
        </Link>

        <Link
          href="/cbt"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="bg-purple-100 p-3 rounded-lg">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Manage CBT</h3>
            <p className="text-sm text-gray-500">Update practice questions</p>
          </div>
        </Link>

        {/* <Link
          href="/settings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="bg-orange-100 p-3 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Settings</h3>
            <p className="text-sm text-gray-500">Update site configuration</p>
          </div>
        </Link> */}
      </div>
    </div>
  );
}
