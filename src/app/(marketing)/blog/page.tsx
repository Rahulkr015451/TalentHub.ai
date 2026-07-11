"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "Engineering" | "Recruiting" | "Company";
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorInitials: string;
  featured?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Maximizing Semantic ATS Alignment: How Resume Matchers Function in 2026",
    excerpt: "Discover the inner workings of modern vector-space resume matches. Learn how tech candidates optimize credentials matrices to score above the 90% compatibility threshold.",
    category: "Recruiting",
    date: "July 10, 2026",
    readTime: "6 min read",
    author: "Sarah Jenkins",
    authorRole: "VP of People Operations",
    authorInitials: "SJ",
    featured: true,
  },
  {
    id: "post-2",
    title: "Moving to Next.js 16 Server Actions: Technical Architecture Lessons",
    excerpt: "Deep dive into our implementation migration to Next.js 16. We review server actions constraints, data security, hydration, and routing layouts optimizers.",
    category: "Engineering",
    date: "July 08, 2026",
    readTime: "8 min read",
    author: "Dr. Rivera Chen",
    authorRole: "Lead AI Architect",
    authorInitials: "RC",
  },
  {
    id: "post-3",
    title: "Unbiased Tech Screening: Eliminating Candidate Bias from Resume Loops",
    excerpt: "How TalentHub enforces fair-chance candidate pipelines by programmatically removing biographical metrics during initial recruiter evaluations.",
    category: "Company",
    date: "July 04, 2026",
    readTime: "4 min read",
    author: "Marcus Aurelius",
    authorRole: "Co-Founder & CEO",
    authorInitials: "MA",
  },
  {
    id: "post-4",
    title: "Optimizing Tech Budgets During Engineering Hiring Downcycles",
    excerpt: "Staffing operations strategies for scaling tech hubs efficiently without sacrificing quality. We check average timeline reductions and ATS funnels benchmarks.",
    category: "Recruiting",
    date: "June 28, 2026",
    readTime: "5 min read",
    author: "Sarah Jenkins",
    authorRole: "VP of People Operations",
    authorInitials: "SJ",
  },
  {
    id: "post-5",
    title: "Inside Aether Matcher: How Vector-Space Models Evaluate Technical Fit",
    excerpt: "A high-level guide to cosine similarity, skill embedding dimensions, and semantic matching techniques driving candidate rankings.",
    category: "Engineering",
    date: "June 20, 2026",
    readTime: "10 min read",
    author: "Dr. Rivera Chen",
    authorRole: "Lead AI Architect",
    authorInitials: "RC",
  },
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Engineering", "Recruiting", "Company"];

  // Filter logic
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((post) => post.featured);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background glowing gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[8%] left-[5%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/5" />
        <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[90px] dark:bg-indigo-500/5" />
      </div>

      {/* Page Header */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-16">
        <Container>
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border bg-muted/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold"
            >
              <BookOpen className="size-3 text-primary" />
              <span className="text-muted-foreground">The TalentHub Research & Resource Feed</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading"
            >
              Recruitment <span className="text-gradient">Insights</span> & Tech
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed"
            >
              Read our latest papers on AI matching vectors, technical loop setups, and optimization metrics for modern engineering teams.
            </motion.p>
          </div>
        </Container>
      </section>

      {/* Featured Spotlight Section */}
      {featuredPost && selectedCategory === "All" && !searchQuery && (
        <section className="pb-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border overflow-hidden bg-card/65 backdrop-blur-md hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-0 grid lg:grid-cols-12 items-center">
                  <div className="p-6 sm:p-8 lg:p-12 lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-2.5">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold uppercase tracking-wider py-0.5 px-2">
                        {featuredPost.category}
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">FEATURED SPOTLIGHT</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight tracking-tight font-heading">
                      {featuredPost.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/80">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {featuredPost.authorInitials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{featuredPost.author}</p>
                          <p className="text-[9px] text-muted-foreground">{featuredPost.authorRole}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> {featuredPost.date}</span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> {featuredPost.readTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic sidebar graphics box */}
                  <div className="lg:col-span-5 h-64 lg:h-full bg-muted/40 relative flex items-center justify-center border-t lg:border-t-0 lg:border-l p-8 overflow-hidden min-h-[250px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,var(--primary)_0%,transparent_60%)] opacity-10" />
                    <div className="relative text-center space-y-2 border border-dashed rounded-2xl p-6 bg-card/80 max-w-[280px] shadow-sm animate-pulse">
                      <BookOpen className="size-8 text-primary mx-auto" />
                      <h4 className="font-heading font-semibold text-xs text-foreground">Featured Analysis</h4>
                      <p className="text-[10px] text-muted-foreground">Vector alignment algorithms and ATS scores tracking reports.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Container>
        </section>
      )}

      {/* Main Filter Feed & Search Grid */}
      <section className="pb-24">
        <Container className="space-y-8">
          {/* Controls Panel */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-y py-4">
            {/* Tabs */}
            <div className="flex bg-muted p-1 rounded-lg text-xs font-semibold overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-card text-foreground shadow-2xs border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles & authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9.5 border bg-card pl-9 pr-4 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background"
              />
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-full flex flex-col justify-between border hover:border-primary/30 transition-all hover:-translate-y-0.5 duration-200 bg-card/40">
                      <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider py-0.5 bg-primary/5 text-primary border-primary/10">
                              {post.category}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                              <Clock className="size-3" /> {post.readTime}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug tracking-tight font-heading group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="pt-4 border-t flex items-center justify-between gap-3 mt-4">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                              {post.authorInitials}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-foreground">{post.author}</p>
                              <p className="text-[8px] text-muted-foreground">{post.authorRole}</p>
                            </div>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                            <Calendar className="size-3" /> {post.date}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-muted-foreground space-y-2">
                  <Search className="size-8 text-muted-foreground/40 mx-auto" />
                  <h4 className="font-heading font-bold text-sm text-foreground">No articles match your filters</h4>
                  <p className="text-xs text-muted-foreground">Adjust keyword criteria search or switch category selection options.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </section>
    </div>
  );
}
