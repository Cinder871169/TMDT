import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import SEO from "../components/SEO";

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/api/news/${id}`);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-2xl mb-10"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <h1 className="text-4xl font-black mb-6">Bài viết không tồn tại</h1>
        <p className="text-gray-600">Không tìm thấy bài viết với ID: {id}</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.content?.substring(0, 160)}
        image={post.image}
        type="article"
        article={{
          title: post.title,
          content: post.content,
          image: post.image,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }}
      />
      <div className="max-w-4xl mx-auto py-20 px-6">
        <article>
          <header>
            <h1 className="text-4xl font-black mb-6">{post.title}</h1>
            <div className="text-sm text-gray-500 mb-6">
              <span>Tác giả: {post.author || 'SneakerZone'}</span>
              <span className="mx-2">•</span>
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </time>
            </div>
          </header>

          {post.image && (
            <figure>
              <img
                src={post.image}
                alt={post.title}
                className="w-full rounded-2xl mb-10"
                loading="lazy"
              />
            </figure>
          )}

          <div
            className="text-gray-600 leading-relaxed text-lg prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </>
  );
}
