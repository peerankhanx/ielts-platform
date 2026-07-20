"use client";

import { useState } from "react";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_VARIANT: Record<string, "success" | "error" | "warning"> = {
  active: "success",
  suspended: "error",
  pending: "warning",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminUsers(page, 20, search);
  const updateStatus = useUpdateUserStatus();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-text-soft">Manage student and staff accounts.</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading && <p className="text-sm text-text-soft">Loading users…</p>}
      {isError && <p className="text-sm text-error">Couldn&apos;t load users.</p>}

      {data && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-soft">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Verified</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-5 py-3 text-text-muted">{u.email}</td>
                    <td className="px-5 py-3 text-text-muted">{u.role}</td>
                    <td className="px-5 py-3">
                      <Badge variant={STATUS_VARIANT[u.status] ?? "default"}>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{u.emailVerified ? "Yes" : "No"}</td>
                    <td className="px-5 py-3 text-text-soft">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.status === "suspended" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          isLoading={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ userId: u.id, status: "active" })}
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={updateStatus.isPending}
                          onClick={() => updateStatus.mutate({ userId: u.id, status: "suspended" })}
                        >
                          Suspend
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-text-soft">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
