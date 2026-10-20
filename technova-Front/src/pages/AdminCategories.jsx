import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function AdminCategories({ setPage }) {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    parentId: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);

      const data = await api.get("/admin/categories");

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setMessage(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function resetForm() {
    setForm({
      name: "",
      parentId: "",
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  function handleAddCategory() {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  }

  function handleEditCategory(category) {
    if (category.isDeleted) {
      return;
    }

    setEditingId(category.id);

    setForm({
      name: category.name || "",
      parentId:
        category.parentId !== null &&
        category.parentId !== undefined &&
        category.parentId !== 0
          ? String(category.parentId)
          : "",
    });

    setShowForm(true);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      showMessage("Category name is required.");
      return;
    }

    const categoryData = {
      name: form.name.trim(),
      parentId: form.parentId
        ? Number(form.parentId)
        : null,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/admin/categories/${editingId}`,
          categoryData
        );

        closeForm();

        await loadCategories();

        showMessage("Category updated successfully.");
      } else {
        await api.post(
          "/admin/categories",
          categoryData
        );

        closeForm();

        await loadCategories();

        showMessage("Category created successfully.");
      }
    } catch (error) {
      console.error("Failed to save category:", error);

      showMessage(
        error.message || "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.del(
        `/admin/categories/${category.id}`
      );

      if (editingId === category.id) {
        closeForm();
      }

      await loadCategories();

      showMessage("Category deleted successfully.");
    } catch (error) {
      console.error(
        "Failed to delete category:",
        error
      );

      showMessage(
        error.message || "Failed to delete category"
      );
    }
  }

  async function handleRestoreCategory(category) {
    const confirmed = window.confirm(
      `Restore "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(
        `/admin/categories/${category.id}/restore`,
        {}
      );

      await loadCategories();

      showMessage("Category restored successfully.");
    } catch (error) {
      console.error(
        "Failed to restore category:",
        error
      );

      showMessage(
        error.message || "Failed to restore category"
      );
    }
  }

  // =========================================================
  // CATEGORY HELPERS
  // =========================================================

  const parentCategories = categories.filter(
    (category) =>
      !category.isDeleted &&
      (category.parentId === null ||
        category.parentId === undefined ||
        category.parentId === 0)
  );

  function getSubcategories(parentId) {
    return categories.filter(
      (category) =>
        category.parentId !== null &&
        category.parentId !== undefined &&
        category.parentId !== 0 &&
        Number(category.parentId) === Number(parentId)
    );
  }

  const deletedCategories = categories.filter(
    (category) => category.isDeleted
  );

  const activeCategories = categories.filter(
    (category) => !category.isDeleted
  );

  const mainCategories = activeCategories.filter(
    (category) =>
      category.parentId === null ||
      category.parentId === undefined ||
      category.parentId === 0
  );

  const filteredParents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return parentCategories;
    }

    return parentCategories.filter((parent) => {
      const parentMatches = parent.name
        ?.toLowerCase()
        .includes(keyword);

      const childMatches = getSubcategories(
        parent.id
      ).some((child) =>
        child.name?.toLowerCase().includes(keyword)
      );

      return parentMatches || childMatches;
    });
  }, [categories, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-sm">
                📂
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Category Management
                </h1>

                <p className="text-slate-500 text-sm mt-1">
                  Organize your products with categories and subcategories.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => setPage("admin")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition shadow-sm"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={handleAddCategory}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              + Add Category
            </button>

          </div>
        </div>

        {/* ================================================= */}
        {/* SUCCESS / ERROR MESSAGE */}
        {/* ================================================= */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Categories
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {categories.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                📁
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active
                </p>

                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {activeCategories.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                ✓
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Deleted
                </p>

                <p className="text-3xl font-bold text-red-500 mt-1">
                  {deletedCategories.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                🗑️
              </div>
            </div>
          </div>

        </div>

        {/* ================================================= */}
        {/* CATEGORY LIST */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* List Header */}

          <div className="px-5 sm:px-6 py-5 border-b border-slate-200">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Categories
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage your store category structure.
                </p>
              </div>

              <div className="relative w-full md:w-72">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center gap-3 text-slate-500">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                Loading categories...
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">

              <div className="text-5xl mb-4">
                📂
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                No categories yet
              </h3>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                Create your first category to organize your products.
              </p>

              <button
                type="button"
                onClick={handleAddCategory}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                + Create Category
              </button>

            </div>
          ) : (
            <div className="p-5 sm:p-6 space-y-5">

              {/* ================================================= */}
              {/* ACTIVE MAIN CATEGORIES */}
              {/* ================================================= */}

              {filteredParents.length > 0 ? (
                filteredParents.map((parent) => {

                  const subcategories =
                    getSubcategories(parent.id);

                  const visibleSubcategories =
                    search.trim()
                      ? subcategories.filter((subcategory) =>
                          subcategory.name
                            ?.toLowerCase()
                            .includes(search.trim().toLowerCase())
                        )
                      : subcategories;

                  return (
                    <div
                      key={parent.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden"
                    >

                      {/* Main Category */}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 bg-slate-50 border-b border-slate-200">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
                            📁
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">

                              <span className="font-semibold text-slate-900">
                                {parent.name}
                              </span>

                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                                ACTIVE
                              </span>

                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                              Main Category
                              {subcategories.length > 0 &&
                                ` · ${subcategories.length} ${
                                  subcategories.length === 1
                                    ? "subcategory"
                                    : "subcategories"
                                }`}
                            </div>
                          </div>

                        </div>

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditCategory(parent)
                            }
                            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCategory(parent)
                            }
                            className="px-3.5 py-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                      {/* Subcategories */}

                      {visibleSubcategories.length > 0 ? (
                        <div className="divide-y divide-slate-100">

                          {visibleSubcategories.map(
                            (subcategory) => (

                              <div
                                key={subcategory.id}
                                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 transition ${
                                  subcategory.isDeleted
                                    ? "bg-red-50/40"
                                    : "hover:bg-slate-50"
                                }`}
                              >

                                <div className="flex items-center gap-3 pl-5">

                                  <div className="text-slate-300 text-xl">
                                    ↳
                                  </div>

                                  <div>

                                    <div className="flex items-center gap-2 flex-wrap">

                                      <span
                                        className={`text-sm font-medium ${
                                          subcategory.isDeleted
                                            ? "text-slate-500 line-through"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {subcategory.name}
                                      </span>

                                      {subcategory.isDeleted ? (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-semibold">
                                          DELETED
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                                          ACTIVE
                                        </span>
                                      )}

                                    </div>

                                    <div className="text-xs text-slate-400 mt-1">
                                      Subcategory of {parent.name}
                                    </div>

                                  </div>

                                </div>

                                <div className="flex gap-2 pl-8 sm:pl-0">

                                  {subcategory.isDeleted ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRestoreCategory(
                                          subcategory
                                        )
                                      }
                                      className="px-3.5 py-2 rounded-lg border border-emerald-200 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition"
                                    >
                                      Restore
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEditCategory(
                                            subcategory
                                          )
                                        }
                                        className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteCategory(
                                            subcategory
                                          )
                                        }
                                        className="px-3.5 py-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>
                      ) : (
                        <div className="px-5 py-4 text-sm text-slate-400 italic">
                          No subcategories yet.
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center">

                  <div className="text-4xl mb-3">
                    🔍
                  </div>

                  <p className="font-medium text-slate-700">
                    No matching categories
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Try a different search term.
                  </p>

                </div>
              )}

              {/* ================================================= */}
              {/* DELETED MAIN CATEGORIES */}
              {/* ================================================= */}

              {deletedCategories.some(
                (category) =>
                  category.parentId === null ||
                  category.parentId === undefined ||
                  category.parentId === 0
              ) && (
                <div className="pt-4">

                  <div className="flex items-center gap-3 mb-4">

                    <div className="h-px flex-1 bg-slate-200" />

                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Deleted Categories
                    </span>

                    <div className="h-px flex-1 bg-slate-200" />

                  </div>

                  <div className="space-y-3">

                    {deletedCategories
                      .filter(
                        (category) =>
                          category.parentId === null ||
                          category.parentId === undefined ||
                          category.parentId === 0
                      )
                      .filter((category) =>
                        category.name
                          ?.toLowerCase()
                          .includes(search.trim().toLowerCase())
                      )
                      .map((category) => {

                        const deletedChildren =
                          getSubcategories(category.id);

                        return (
                          <div
                            key={category.id}
                            className="border border-red-100 bg-red-50/40 rounded-2xl overflow-hidden"
                          >

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-xl">
                                  🗑️
                                </div>

                                <div>

                                  <div className="flex items-center gap-2">

                                    <span className="font-semibold text-slate-600 line-through">
                                      {category.name}
                                    </span>

                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-semibold">
                                      DELETED
                                    </span>

                                  </div>

                                  <div className="text-xs text-slate-400 mt-1">
                                    Main Category
                                    {deletedChildren.length > 0 &&
                                      ` · ${deletedChildren.length} subcategories`}
                                  </div>

                                </div>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRestoreCategory(
                                    category
                                  )
                                }
                                className="px-4 py-2 rounded-lg border border-emerald-200 bg-white text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition"
                              >
                                Restore
                              </button>

                            </div>

                          </div>
                        );
                      })}

                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* ADD / EDIT MODAL */}
      {/* ===================================================== */}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeForm();
            }
          }}
        >

          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Modal Header */}

            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
                  {editingId ? "✏️" : "📁"}
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {editingId
                      ? "Edit Category"
                      : "Add Category"}
                  </h2>

                  <p className="text-sm text-slate-500 mt-0.5">
                    {editingId
                      ? "Update the category information."
                      : "Create a new store category."}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition text-xl disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* Modal Body */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {/* Category Name */}

              <div className="mb-5">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Smartphones"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                />

              </div>

              {/* Parent Category */}

              <div className="mb-6">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Parent Category
                </label>

                <select
                  name="parentId"
                  value={form.parentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                >

                  <option value="">
                    None — Main Category
                  </option>

                  {parentCategories
                    .filter(
                      (category) =>
                        Number(category.id) !==
                        Number(editingId)
                    )
                    .map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}

                </select>

                <p className="text-xs text-slate-400 mt-2">
                  Leave this empty if this should be a main category.
                </p>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="min-w-36 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >

                  {saving && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Create Category"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}