import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../shared/ui/Card.jsx";
import Input from "../../shared/ui/Input.jsx";
import Button from "../../shared/ui/Button.jsx";
import Select from "../../shared/ui/Select.jsx";
import Table from "../../shared/ui/Table.jsx";
import { apiErrorMessage } from "../../shared/api/http.js";
import { useToast } from "../../shared/ui/toast/ToastContext.jsx";
import {
  createRoom,
  deleteRoom,
  listRooms,
  updateRoom,
} from "../../features/admin/adminApi.js";

const DEPARTMENTS = [
  "CSE",
  "IT",
  "CSAIML",
  "CSDS",
  "CSAI",
  "AIML",
  "AIDS",
  "ECE",
  "EEE",
  "ME",
];

function normalizeDept(v) {
  return (v || "").trim().toUpperCase();
}

function getInitialForm() {
  return {
    name: "",
    department: "IT",
    type: "Classroom",
    capacity: 60,
  };
}

export default function AdminRoomsPage() {
  const qc = useQueryClient();
  const { push } = useToast();

  const [filters, setFilters] = useState({
    department: "",
    type: "",
    search: "",
  });

  const [form, setForm] = useState(getInitialForm());
  const [editing, setEditing] = useState(null);

  const q = useQuery({
    queryKey: ["admin-rooms", filters.department, filters.type],
    queryFn: () =>
      listRooms({
        ...(filters.department
          ? { department: normalizeDept(filters.department) }
          : {}),
        ...(filters.type ? { type: filters.type } : {}),
      }),
  });

  const save = useMutation({
    mutationFn: async (payload) => {
      if (editing?._id) return updateRoom(editing._id, payload);
      return createRoom(payload);
    },

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Saved",
        message: editing ? "Room updated successfully" : "Room saved successfully",
      });

      setForm(getInitialForm());
      setEditing(null);

      await qc.invalidateQueries({ queryKey: ["admin-rooms"] });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Save failed",
        message: apiErrorMessage(e),
      }),
  });

  const del = useMutation({
    mutationFn: (id) => deleteRoom(id),

    onSuccess: async () => {
      push({
        variant: "success",
        title: "Deleted",
        message: "Room deleted successfully",
      });

      await qc.invalidateQueries({ queryKey: ["admin-rooms"] });
    },

    onError: (e) =>
      push({
        variant: "error",
        title: "Delete failed",
        message: apiErrorMessage(e),
      }),
  });

  function onEdit(r) {
    setEditing(r);

    setForm({
      name: r.name ?? "",
      department: r.department ?? "IT",
      type: r.type ?? "Classroom",
      capacity: r.capacity ?? 60,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditing(null);
    setForm(getInitialForm());
  }

  function onSubmit(e) {
    e.preventDefault();

    save.mutate({
      ...form,
      department: normalizeDept(form.department),
      capacity: Number(form.capacity),
    });
  }

  const rows = useMemo(() => {
    const base = q.data ?? [];
    const term = filters.search.trim().toLowerCase();

    if (!term) return base;

    return base.filter((room) => {
      const text = [
        room.name,
        room.department,
        room.type,
        String(room.capacity ?? ""),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [q.data, filters.search]);

  const roomStats = useMemo(() => {
    return {
      total: rows.length,
      classrooms: rows.filter((r) => r.type === "Classroom").length,
      labs: rows.filter((r) => r.type === "Lab").length,
    };
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Room",
        render: (r) => (
          <div className="min-w-[140px]">
            <div className="font-semibold text-slate-900">{r.name}</div>
            <div className="text-xs text-slate-500">
              {r.type === "Lab" ? "Practical / Lab Space" : "Theory Classroom"}
            </div>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (r) => (
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {r.department}
          </span>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (r) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${r.type === "Lab"
              ? "bg-violet-100 text-violet-700"
              : "bg-emerald-100 text-emerald-700"
              }`}
          >
            {r.type}
          </span>
        ),
      },
      {
        key: "capacity",
        header: "Capacity",
        render: (r) => (
          <span className="font-medium text-slate-800">{r.capacity}</span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (r) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(r)}
              type="button"
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => del.mutate(r._id)}
              disabled={del.isPending}
              type="button"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [del.isPending]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Room Management</h1>
            <p className="mt-1 text-sm text-slate-200">
              Create, update, filter, and manage classrooms and labs for timetable allocation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
              Total Rooms: <span className="font-semibold">{roomStats.total}</span>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
              Classrooms: <span className="font-semibold">{roomStats.classrooms}</span>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 text-sm">
              Labs: <span className="font-semibold">{roomStats.labs}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-slate-200 lg:col-span-1">
          <CardHeader className="border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {editing ? "Edit Room" : "Create Room"}
                </div>
              </div>

              {editing ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Editing Mode
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  New Entry
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Room Name *
                </label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. R-101"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Department *
                </label>
                <Select
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Type *
                  </label>
                  <Select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Lab">Lab</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Capacity *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacity: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                    {form.name || "Unnamed Room"}
                  </span>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                    {form.department || "No Dept"}
                  </span>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                    {form.type}
                  </span>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                    Capacity {form.capacity || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button disabled={save.isPending} type="submit">
                  {save.isPending ? "Saving..." : editing ? "Update Room" : "Save Room"}
                </Button>

                {editing ? (
                  <Button variant="secondary" type="button" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>

              {save.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {apiErrorMessage(save.error)}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3 lg:col-span-2">
          <Card className="border-slate-200">
            <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Filter Department
                </label>
                <Select
                  value={filters.department}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, department: e.target.value }))
                  }
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Filter Type
                </label>
                <Select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  <option value="">All Types</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Search
                </label>
                <Input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  placeholder="Search rooms..."
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    qc.invalidateQueries({ queryKey: ["admin-rooms"] })
                  }
                >
                  Refresh
                </Button>

                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    setFilters({
                      department: "",
                      type: "",
                      search: "",
                    })
                  }
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {q.isError ? (
            <Card>
              <CardContent className="text-sm text-red-600">
                {apiErrorMessage(q.error)}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-slate-900">
                  Rooms List
                </div>
                <div className="text-sm text-slate-500">
                  Showing {rows.length} item{rows.length === 1 ? "" : "s"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table columns={columns} rows={rows} rowKey={(r) => r._id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}