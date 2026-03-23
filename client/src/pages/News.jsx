import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await api.get(`/api/news`);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-16"></div>
          <div className="h-[700px] bg-gray-200 rounded-3xl mb-20"></div>
          <div className="grid md:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-black mb-16">Sneaker Blog</h1>
        <p className="text-gray-600">Chưa có bài viết nào.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* BLOG TITLE */}
      <h1 className="text-5xl font-black mb-16">Sneaker Blog</h1>

      {/* FEATURED POST */}
      <div className="mb-20">
        <Link to={`/blog/${posts[0]._id}`}>
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src={posts[0].image || "/images/default-news.jpg"}
              alt={posts[0].title}
              className="w-full h-[700px] object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center">
              <div className="text-white p-10">
                <p className="uppercase text-sm mb-2">Featured</p>
                <h2 className="text-4xl font-black">{posts[0].title}</h2>
                <p className="text-sm mt-2">
                  {new Date(posts[0].createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* BLOG GRID */}
      <div className="grid md:grid-cols-3 gap-10">
        {posts.slice(1).map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post._id}`}
            className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
          >
            <img
              src={post.image || "/images/default-news.jpg"}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <h3 className="font-bold text-lg mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm">
                {post.content.substring(0, 100)}...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
