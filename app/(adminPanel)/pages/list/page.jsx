"use client";

import { useEffect, useState } from "react";
import { getPages, deletePage } from "@/services/pageService";
import Link from "next/link";
import { toast } from "react-toastify";
import { withProtectedRoute } from "@/components/auth/ProtectedRoute";

function PageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (error) {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await deletePage(id);
        toast.success("Page deleted successfully");
        fetchPages();
      } catch (error) {
        toast.error("Failed to delete page");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Page Manager</h1>
        <Link href="/admin/pages/create">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Page
          </button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Slug</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const hideDeleteButton =
                  page.slug !== "view-cart" && page.slug !== "login";
                return (
                  <tr key={page.id}>
                    <td className="py-2 px-4 border-b">{page.title}</td>
                    <td className="py-2 px-4 border-b">{page.slug}</td>
                    <td className="py-2 px-4 border-b">
                      {page.is_published ? (
                        <span className="text-green-500">Published</span>
                      ) : (
                        <span className="text-gray-500">Draft</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Link href={`/pages/edit/${page.slug}`}>
                          <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-xs">
                            Edit
                          </button>
                        </Link>
                        {hideDeleteButton && (
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Delete
                          </button>
                        )}
                        <Link href={`/${page.slug}`} target="_blank">
                          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs">
                            View
                          </button>
                        </Link>
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
  );
}

export default withProtectedRoute(PageManager, ["Admin"]);
