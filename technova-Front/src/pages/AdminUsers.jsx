import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function AdminUsers({ setPage }) {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // =========================================================
  // EDIT USER
  // =========================================================

  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // ADD USER / ADMIN
  // =========================================================

  const [addingUser, setAddingUser] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    role: "USER",
  });

  const [adding, setAdding] = useState(false);

  // =========================================================
  // DELETE / RESTORE
  // =========================================================

  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  // =========================================================
  // LOAD USERS
  // =========================================================

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const [activeData, deletedData] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/users/deleted"),
      ]);

      setUsers(
        Array.isArray(activeData)
          ? activeData.filter((user) => !user.isDeleted)
          : []
      );

      setDeletedUsers(
        Array.isArray(deletedData)
          ? deletedData
          : []
      );
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // MODAL SCROLL LOCK
  // =========================================================

  useEffect(() => {
    if (!editingUser && !addingUser) {
      return;
    }

    const scrollY = window.scrollY;

    const originalBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position =
        originalBodyStyle.position;

      document.body.style.top =
        originalBodyStyle.top;

      document.body.style.width =
        originalBodyStyle.width;

      document.body.style.overflow =
        originalBodyStyle.overflow;

      window.scrollTo(0, scrollY);
    };
  }, [editingUser, addingUser]);

  // =========================================================
  // SEARCH ACTIVE USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.id || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.username || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.role || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [users, search]);

  // =========================================================
  // SEARCH DELETED USERS
  // =========================================================

  const filteredDeletedUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return deletedUsers;
    }

    return deletedUsers.filter((user) => {
      return (
        String(user.id || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.username || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.role || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [deletedUsers, search]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const allUsers = [
      ...users,
      ...deletedUsers,
    ];

    const total = allUsers.length;
    const active = users.length;
    const deleted = deletedUsers.length;

    const admins = allUsers.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const regularUsers = allUsers.filter(
      (user) => user.role !== "ADMIN"
    ).length;

    return {
      total,
      active,
      deleted,
      admins,
      regularUsers,
    };
  }, [users, deletedUsers]);

  // =========================================================
  // EDIT USER
  // =========================================================

  function handleEdit(user) {
    if (!user || user.isDeleted) {
      return;
    }

    setEditingUser({
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role === "ADMIN" ? "ADMIN" : "USER",
    });
  }

  // =========================================================
  // SAVE USER
  // =========================================================

  async function handleSave() {
    if (!editingUser) {
      return;
    }

    if (!editingUser.username.trim()) {
      alert("Username is required.");
      return;
    }

    try {
      setSaving(true);

      await api.put(
        `/admin/users/${editingUser.id}`,
        {
          username: editingUser.username.trim(),
          email: editingUser.email.trim() || null,
          phone: editingUser.phone.trim() || null,
          role:
            editingUser.role === "ADMIN"
              ? "ADMIN"
              : "USER",
        }
      );

      setEditingUser(null);

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to update user:",
        err
      );

      alert(
        err?.message ||
          "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // ADD USER / ADMIN
  // =========================================================

  function openAddUserModal() {
    setNewUser({
      username: "",
      password: "",
      email: "",
      phone: "",
      role: "USER",
    });

    setAddingUser(true);
  }

  // IMPORTANT:
  // Keep every Add User field controlled by newUser.
  function handleNewUserChange(field, value) {
    setNewUser((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleAddUser(e) {
    if (e) {
      e.preventDefault();
    }

    if (adding) {
      return;
    }

    const username =
      newUser.username.trim();

    const password =
      newUser.password;

    const email =
      newUser.email.trim();

    const phone =
      newUser.phone.trim();

    const role =
      newUser.role === "ADMIN"
        ? "ADMIN"
        : "USER";

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!username) {
      alert("Username is required.");
      return;
    }

    if (!password || password.length === 0) {
      alert("Password is required.");
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    try {
      setAdding(true);

      const payload = {
        username: username,
        password: password,
        email: email || null,
        phone: phone || null,
        role: role,
      };

      console.log(
        "Creating user with:",
        {
          username: payload.username,
          hasPassword: Boolean(payload.password),
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
        }
      );

      await api.post(
        "/admin/users",
        payload
      );

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      setAddingUser(false);

      setNewUser({
        username: "",
        password: "",
        email: "",
        phone: "",
        role: "USER",
      });

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to add user:",
        err
      );

      alert(
        err?.message ||
          "Failed to create user"
      );
    } finally {
      setAdding(false);
    }
  }

  function closeAddUserModal() {
    if (adding) {
      return;
    }

    setAddingUser(false);
  }

  // =========================================================
  // DELETE USER
  // =========================================================

  async function handleDelete(user) {
    if (!user || user.isDeleted) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete user "${user.username}"?\n\nThe user will be moved to Deleted Users and can be restored later.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);

      await api.del(
        `/admin/users/${user.id}`
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      alert(
        err?.message ||
          "Failed to delete user"
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // RESTORE USER
  // =========================================================

  async function handleRestore(user) {
    if (!user || !user.isDeleted) {
      return;
    }

    const confirmed =
      window.confirm(
        `Restore user "${user.username}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRestoringId(user.id);

      await api.put(
        `/admin/users/${user.id}/restore`,
        {}
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to restore user:",
        err
      );

      alert(
        err?.message ||
          "Failed to restore user"
      );
    } finally {
      setRestoringId(null);
    }
  }

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  function closeEditModal() {
    if (saving) {
      return;
    }

    setEditingUser(null);
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  // =========================================================
  // ROLE CLASS
  // =========================================================

  function getRoleClass(role) {
    if (role === "ADMIN") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-blue-100 text-blue-700";
  }

  // =========================================================
  // CONTAINER HOVER
  // =========================================================

  const containerHover =
    "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-6 py-5">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                User Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage registered users and their account information
              </p>

            </div>

            <div className="flex items-center gap-3">

              {/* DASHBOARD */}

              <button
                type="button"
                onClick={() =>
                  setPage("admin")
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md active:bg-gray-200"
              >
                ← Dashboard
              </button>

              {/* ADD USER */}

              <button
                type="button"
                onClick={openAddUserModal}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:bg-blue-800"
              >
                + Add User
              </button>

              {/* REFRESH */}

              <button
                type="button"
                onClick={loadUsers}
                disabled={loading}
                className="rounded-lg bg-gray-900 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

          {/* TOTAL */}

          <div
            className={`rounded-xl border bg-white p-5 shadow-sm ${containerHover}`}
          >
            <p className="text-sm text-gray-500">
              Total Users
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {statistics.total}
            </p>
          </div>

          {/* ACTIVE */}

          <div
            className={`rounded-xl border bg-white p-5 shadow-sm ${containerHover}`}
          >
            <p className="text-sm text-gray-500">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {statistics.active}
            </p>
          </div>

          {/* DELETED */}

          <div
            className={`rounded-xl border bg-white p-5 shadow-sm ${containerHover}`}
          >
            <p className="text-sm text-gray-500">
              Deleted
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-500">
              {statistics.deleted}
            </p>
          </div>

          {/* ADMINS */}

          <div
            className={`rounded-xl border bg-white p-5 shadow-sm ${containerHover}`}
          >
            <p className="text-sm text-gray-500">
              Admins
            </p>

            <p className="mt-1 text-2xl font-bold text-purple-600">
              {statistics.admins}
            </p>
          </div>

          {/* REGULAR USERS */}

          <div
            className={`rounded-xl border bg-white p-5 shadow-sm ${containerHover}`}
          >
            <p className="text-sm text-gray-500">
              Regular Users
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-600">
              {statistics.regularUsers}
            </p>
          </div>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div
          className={`mb-6 rounded-xl border bg-white p-5 shadow-sm ${containerHover}`}
        >

          <div className="flex flex-col gap-4 md:flex-row md:items-end">

            <div className="flex-1">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Search users
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by username, email, phone, ID, or role..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900"
              />

            </div>

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
              >
                Clear
              </button>

            )}

          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">

            <span>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {users.length}
              </span>{" "}
              active users
            </span>

            {deletedUsers.length > 0 && (

              <span>
                <span className="font-semibold text-gray-900">
                  {filteredDeletedUsers.length}
                </span>{" "}
                deleted users
              </span>

            )}

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className={`mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-sm ${containerHover}`}
          >

            <p className="font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={loadUsers}
              className="mt-2 text-sm underline transition hover:text-red-900"
            >
              Try again
            </button>

          </div>

        )}

        {/* =================================================
            ACTIVE USERS
        ================================================= */}

        {loading ? (

          <div
            className={`rounded-xl border bg-white p-12 text-center shadow-sm ${containerHover}`}
          >

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <p className="mt-4 text-gray-500">
              Loading users...
            </p>

          </div>

        ) : filteredUsers.length === 0 ? (

          <div
            className={`rounded-xl border bg-white p-12 text-center shadow-sm ${containerHover}`}
          >

            <div className="mb-4 text-5xl">
              👤
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              No active users found
            </h2>

            <p className="mt-1 text-gray-500">
              Try changing your search.
            </p>

          </div>

        ) : (

          <div
            className={`overflow-hidden rounded-xl border bg-white shadow-sm ${containerHover}`}
          >

            {/* SECTION HEADER */}

            <div className="flex flex-col gap-3 border-b bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="font-semibold text-gray-900">
                  Active Users
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Users currently able to use their accounts
                </p>

              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {users.length}
              </span>

            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-sm">

                <thead className="border-b bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      ID
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Username
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-center font-semibold text-gray-700">
                      Role
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-700">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredUsers.map((user) => {

                    const isDeleting =
                      deletingId === user.id;

                    return (

                      <tr
                        key={user.id}
                        className="transition-all duration-200 hover:bg-gray-50"
                      >

                        {/* ID */}

                        <td className="px-5 py-4">
                          <span className="font-medium text-gray-700">
                            #{user.id}
                          </span>
                        </td>

                        {/* USERNAME */}

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {user.username || "-"}
                          </p>
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4">
                          <span className="text-gray-600">
                            {user.email || "-"}
                          </span>
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4">
                          <span className="text-gray-600">
                            {user.phone || "-"}
                          </span>
                        </td>

                        {/* ROLE */}

                        <td className="px-5 py-4 text-center">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {user.role || "USER"}
                          </span>

                        </td>

                        {/* JOINED */}

                        <td className="whitespace-nowrap px-5 py-4">

                          <span className="text-gray-500">
                            {formatDate(
                              user.createTime
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(user)
                              }
                              disabled={isDeleting}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-md active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(user)
                              }
                              disabled={isDeleting}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* =================================================
            DELETED USERS
        ================================================= */}

        <div
          className={`mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${containerHover}`}
        >

          {/* HEADER */}

          <div className="flex flex-col gap-3 border-b bg-gray-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <h2 className="font-semibold text-gray-900">
                  Deleted Users
                </h2>

                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                  {deletedUsers.length}
                </span>

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Deleted users are archived and can be restored later.
              </p>

            </div>

          </div>

          {/* EMPTY */}

          {filteredDeletedUsers.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mb-3 text-4xl">
                🗑️
              </div>

              <h3 className="font-semibold text-gray-900">
                No deleted users
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Deleted users will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-sm">

                <thead className="border-b bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      ID
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Username
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-center font-semibold text-gray-700">
                      Role
                    </th>

                    <th className="px-5 py-4 text-center font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-gray-700">
                      Joined
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-700">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredDeletedUsers.map((user) => {

                    const isRestoring =
                      restoringId === user.id;

                    return (

                      <tr
                        key={user.id}
                        className="transition-all duration-200 hover:bg-gray-50"
                      >

                        {/* ID */}

                        <td className="px-5 py-4">
                          <span className="font-medium text-gray-600">
                            #{user.id}
                          </span>
                        </td>

                        {/* USERNAME */}

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-700">
                            {user.username || "-"}
                          </p>
                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4">
                          <span className="text-gray-500">
                            {user.email || "-"}
                          </span>
                        </td>

                        {/* PHONE */}

                        <td className="px-5 py-4">
                          <span className="text-gray-500">
                            {user.phone || "-"}
                          </span>
                        </td>

                        {/* ROLE */}

                        <td className="px-5 py-4 text-center">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(
                              user.role
                            )}`}
                          >
                            {user.role || "USER"}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4 text-center">

                          <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">
                            Deleted
                          </span>

                        </td>

                        {/* JOINED */}

                        <td className="whitespace-nowrap px-5 py-4">

                          <span className="text-gray-500">
                            {formatDate(
                              user.createTime
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end">

                            <button
                              type="button"
                              onClick={() =>
                                handleRestore(user)
                              }
                              disabled={isRestoring}
                              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isRestoring
                                ? "Restoring..."
                                : "Restore"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* =====================================================
          ADD USER MODAL
      ===================================================== */}

      {addingUser && (

        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeAddUserModal();
            }
          }}
        >

          <div className="flex min-h-full items-center justify-center">

            <form
              onSubmit={handleAddUser}
              className={`my-4 flex max-h-[calc(100vh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-8 sm:max-h-[calc(100vh-64px)] ${containerHover}`}
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="flex shrink-0 items-start justify-between border-b bg-white px-6 py-5">

                <div className="min-w-0">

                  <h2 className="text-xl font-bold text-gray-900">
                    Add User
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create a new user or administrator account.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeAddUserModal}
                  disabled={adding}
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ×
                </button>

              </div>

              {/* CONTENT */}

              <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="space-y-5 p-6">

                  {/* USERNAME */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Username
                    </label>

                    <input
                      type="text"
                      name="username"
                      value={newUser.username}
                      onChange={(e) =>
                        handleNewUserChange(
                          "username",
                          e.target.value
                        )
                      }
                      disabled={adding}
                      autoFocus
                      autoComplete="username"
                      placeholder="Enter username"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                  </div>

                  {/* PASSWORD */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={(e) =>
                        handleNewUserChange(
                          "password",
                          e.target.value
                        )
                      }
                      disabled={adding}
                      autoComplete="new-password"
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Password must be at least 6 characters.
                    </p>

                    {newUser.password.length > 0 &&
                      newUser.password.length < 6 && (
                        <p className="mt-1 text-xs text-red-500">
                          {6 - newUser.password.length} more character
                          {6 - newUser.password.length === 1
                            ? ""
                            : "s"}{" "}
                          required.
                        </p>
                      )}

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={(e) =>
                        handleNewUserChange(
                          "email",
                          e.target.value
                        )
                      }
                      disabled={adding}
                      autoComplete="email"
                      placeholder="Enter email"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={newUser.phone}
                      onChange={(e) =>
                        handleNewUserChange(
                          "phone",
                          e.target.value
                        )
                      }
                      disabled={adding}
                      autoComplete="tel"
                      placeholder="Enter phone number"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                  </div>

                  {/* ROLE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Account Role
                    </label>

                    <select
                      name="role"
                      value={newUser.role}
                      onChange={(e) =>
                        handleNewUserChange(
                          "role",
                          e.target.value
                        )
                      }
                      disabled={adding}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >

                      <option value="USER">
                        User
                      </option>

                      <option value="ADMIN">
                        Administrator
                      </option>

                    </select>

                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">

                      <p className="text-xs text-blue-700">

                        {newUser.role === "ADMIN"
                          ? "This account will have administrator access to the admin panel."
                          : "This account will have normal customer access."}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-6 py-4">

                <button
                  type="button"
                  onClick={closeAddUserModal}
                  disabled={adding}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding
                    ? "Creating..."
                    : "Create Account"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}

      {editingUser && (

        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal();
            }
          }}
        >

          <div className="flex min-h-full items-center justify-center">

            <div
              className={`my-4 flex max-h-[calc(100vh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-8 sm:max-h-[calc(100vh-64px)] ${containerHover}`}
              onMouseDown={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="flex shrink-0 items-start justify-between border-b bg-white px-6 py-5">

                <div className="min-w-0">

                  <h2 className="text-xl font-bold text-gray-900">
                    Edit User
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update account information for user #
                    {editingUser.id}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ×
                </button>

              </div>

              {/* MODAL CONTENT */}

              <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="space-y-5 p-6">

                  {/* USERNAME */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Username
                    </label>

                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          username:
                            e.target.value,
                        })
                      }
                      disabled={saving}
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email:
                            e.target.value,
                        })
                      }
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone
                    </label>

                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone:
                            e.target.value,
                        })
                      }
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                  </div>

                  {/* ROLE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Role
                    </label>

                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value,
                        })
                      }
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 outline-none transition focus:border-transparent focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >

                      <option value="USER">
                        User
                      </option>

                      <option value="ADMIN">
                        Administrator
                      </option>

                    </select>

                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm">

                      <div className="flex items-center justify-between">

                        <span className="text-sm text-gray-500">
                          Selected role
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleClass(
                            editingUser.role
                          )}`}
                        >
                          {editingUser.role === "ADMIN"
                            ? "ADMIN"
                            : "USER"}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="flex shrink-0 justify-end gap-3 border-t bg-white px-6 py-4">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}