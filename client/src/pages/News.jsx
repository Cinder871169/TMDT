import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import SEO from "../components/SEO";
import {
  Search,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Tag,
  Share2,
  Heart,
  MessageCircle,
  TrendingUp,
  Star,
  BookOpen,
} from "lucide-react";

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

  // Extract categories from posts
  const categories = useMemo(() => {
    const cats = new Set();
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.split(",").forEach((tag) => cats.add(tag.trim()));
      }
    });
    return Array.from(cats);
  }, [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        (post.tags &&
          post.tags.toLowerCase().includes(selectedCategory.toLowerCase()));
      return matchesSearch && matchesCategory;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "popular":
          // For now, sort by title length as a proxy for "popularity"
          return b.title.length - a.title.length;
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy]);

  // Calculate reading time
  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  // Get featured post (first published post)
  const featuredPost =
    filteredPosts.find((post) => post.status === "published") ||
    filteredPosts[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="animate-pulse space-y-16">
            {/* Header skeleton */}
            <div className="text-center">
              <div className="h-16 bg-gradient-to-r from-orange-200 to-orange-100 rounded-2xl mx-auto max-w-md mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mx-auto max-w-sm"></div>
            </div>

            {/* Featured post skeleton */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gray-100 h-[400px] shadow-sm"></div>

            {/* Grid skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="h-48 bg-gray-100"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <BookOpen size={80} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Sneaker Blog
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {searchTerm || selectedCategory !== "all"
              ? "Không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn."
              : "Chưa có bài viết nào được xuất bản."}
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/20 transform hover:scale-105 transition-all duration-200"
            >
              Xem tất cả bài viết
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Tin Tức Sneaker Blog"
        description="Khám phá những câu chuyện, xu hướng và bí quyết về thế giới sneaker. Tin tức giày sneaker mới nhất, đánh giá sản phẩm, xu hướng thời trang."
        type="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-slate-100/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 bg-clip-text text-transparent mb-6 animate-fade-in">
            Sneaker Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những câu chuyện, xu hướng và bí quyết về thế giới sneaker
          </p>

          {/* Search and Filter Bar */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="all">Tất cả chuyên mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="popular">Phổ biến</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <Link to={`/blog/${featuredPost._id}`}>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col lg:flex-row items-stretch">
                {/* Image side */}
                <div className="w-full lg:w-1/2 relative min-h-[250px] lg:min-h-[360px] overflow-hidden bg-slate-50">
                  <img
                    src={featuredPost.image || "/images/default-news.jpg"}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-orange-600 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                      <Star size={11} className="fill-white" /> Nổi bật
                    </span>
                  </div>
                </div>
                {/* Content side */}
                <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-between bg-white">
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(featuredPost.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {getReadingTime(featuredPost.content)} phút đọc
                      </span>
                    </div>

                    <h2 className="text-xl lg:text-2xl font-black text-gray-900 leading-snug group-hover:text-orange-600 transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {featuredPost.content
                        .replace(/<[^>]*>/g, "")
                        .substring(0, 200)}
                      ...
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-orange-500/10">
                        {(featuredPost.author || "A").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-gray-700">
                        {featuredPost.author || "Ban biên tập"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-orange-600 font-extrabold text-[11px] uppercase tracking-wider group-hover:gap-1.5 transition-all">
                      Đọc bài viết
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(featuredPost ? 1 : 0).map((post, index) => (
            <Link
              key={post._id}
              to={`/blog/${post._id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image || "/images/default-news.jpg"}
                  alt={post.title}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {post.status === "published" ? "Xuất bản" : "Nháp"}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors group">
                    <Heart
                      size={16}
                      className="text-gray-600 group-hover:text-red-500 transition-colors"
                    />
                  </button>
                  <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors group">
                    <Share2
                      size={16}
                      className="text-gray-600 group-hover:text-blue-500 transition-colors"
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {getReadingTime(post.content)} phút
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 mb-2.5 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "").substring(0, 120)}...
                </p>

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags
                      .split(",")
                      .slice(0, 3)
                      .map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                )}

                {/* Author and CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-extrabold text-[10px]">
                      {(post.author || "A").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {post.author || "Admin"}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-orange-600 font-extrabold text-xs group-hover:gap-1 transition-all">
                    Đọc tiếp
                    <ArrowRight
                      size={12}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More or Pagination could be added here */}
        {filteredPosts.length > 6 && (
          <div className="text-center mt-16">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/20 transform hover:scale-105 transition-all duration-200">
              Xem thêm bài viết
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
