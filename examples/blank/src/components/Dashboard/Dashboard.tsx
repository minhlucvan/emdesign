/**
 * Dashboard — captured by emdesign.
 * Reusable, design-system-bound component. Edit freely; re-capture to update.
 */
import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import { StatsCard } from '../StatsCard/StatsCard';
import { DataTable } from '../DataTable/DataTable';
import { FilterBar } from '../FilterBar/FilterBar';
import { ChartContainer } from '../ChartContainer/ChartContainer';
import { ActivityFeed } from '../ActivityFeed/ActivityFeed';

const sampleColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'method', label: 'Method' },
];

const sampleRows = [
  { name: 'Alice Johnson', status: 'Completed', amount: '$1,250', date: '2026-06-27', method: 'Visa' },
  { name: 'Bob Smith', status: 'Pending', amount: '$830', date: '2026-06-26', method: 'Mastercard' },
  { name: 'Carol White', status: 'Completed', amount: '$2,100', date: '2026-06-26', method: 'ACH' },
  { name: 'David Lee', status: 'Active', amount: '$450', date: '2026-06-25', method: 'PayPal' },
  { name: 'Eve Brown', status: 'Completed', amount: '$3,675', date: '2026-06-25', method: 'Visa' },
  { name: 'Frank Davis', status: 'Pending', amount: '$920', date: '2026-06-24', method: 'Wire' },
  { name: 'Grace Kim', status: 'Active', amount: '$1,800', date: '2026-06-24', method: 'Mastercard' },
  { name: 'Henry Wilson', status: 'Completed', amount: '$560', date: '2026-06-23', method: 'ACH' },
];

const sampleActivities = [
  { action: 'Payment received', detail: 'from Alice Johnson — $1,250', time: '2m ago', status: 'success' as const },
  { action: 'New customer', detail: 'Bob Smith registered', time: '15m ago', status: 'success' as const },
  { action: 'Invoice overdue', detail: 'Carol White — #INV-2024-089', time: '1h ago', status: 'warn' as const },
  { action: 'Subscription cancelled', detail: 'David Lee — Pro plan', time: '2h ago', status: 'danger' as const },
  { action: 'Report generated', detail: 'Q2 2026 Financial Summary', time: '3h ago' },
  { action: 'Refund processed', detail: 'Eve Brown — $230', time: '5h ago', status: 'success' as const },
];

export function Dashboard() {
  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Stat cards row */}
            <div className="grid grid-cols-4 gap-5">
              <StatsCard label="Total Revenue" value="$48,250" trend="up" trendLabel="12.5% from last month" />
              <StatsCard label="Active Users" value="2,847" trend="up" trendLabel="8.2% from last month" />
              <StatsCard label="Bounce Rate" value="24.3%" trend="down" trendLabel="3.1% decrease" />
              <StatsCard label="Avg. Session" value="4m 32s" trend="neutral" trendLabel="Stable" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-5">
              <ChartContainer title="Revenue Overview" subtitle="Monthly revenue for the past 6 months" height={280} />
              <ChartContainer title="User Growth" subtitle="New signups by month" height={280} />
            </div>

            {/* Transactions section */}
            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-text">Recent Transactions</h2>
              <FilterBar />
              <DataTable columns={sampleColumns} rows={sampleRows} />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Activity */}
      <div className="w-80 border-l border-border bg-surface-raised overflow-y-auto">
        <ActivityFeed activities={sampleActivities} />
      </div>
    </div>
  );
}
