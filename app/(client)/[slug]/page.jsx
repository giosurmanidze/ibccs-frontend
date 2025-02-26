"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPage } from "@/services/pageService";
import Head from "next/head";

export default function DynamicPage() {
  const params = useParams();
  const { slug } = params;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const data = await getPage(slug);
        setPage(data);
      } catch (error) {
        setError("Page not found");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error || !page) {
    return <div className="container mx-auto p-4">Page not found</div>;
  }

  return (
    <>
      <Head>
        <title>{page.title}</title>
        {page.meta_data?.description && (
          <meta name="description" content={page.meta_data.description} />
        )}
        {page.meta_data?.keywords && (
          <meta name="keywords" content={page.meta_data.keywords} />
        )}
      </Head>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </>
  );
}
