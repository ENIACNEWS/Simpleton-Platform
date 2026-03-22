import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types";

const learningPaths = [
  {
    title: "Beginner Guide",
    description: "Start your journey with fundamentals of precious metals, basic terminology, and market basics.",
    icon: "fas fa-seedling",
    color: "bg-green-500",
    topics: [
      "What are precious metals?",
      "Understanding purity and karat",
      "Basic market concepts",
      "Investment vs collectible"
    ]
  },
  {
    title: "Market Analysis",
    description: "Learn advanced techniques for market analysis, price predictions, and investment strategies.",
    icon: "fas fa-chart-line",
    color: "bg-blue-500", 
    topics: [
      "Technical analysis basics",
      "Market trends and patterns",
      "Economic indicators",
      "Portfolio diversification"
    ]
  },
  {
    title: "Authentication",
    description: "Master the art of authenticating precious metals and identifying counterfeits with expert techniques.",
    icon: "fas fa-microscope",
    color: "bg-purple-500",
    topics: [
      "Visual inspection techniques",
      "Testing methods and tools",
      "Common counterfeits",
      "Professional certification"
    ]
  }
];

export function LearningPaths() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  return (
    <section className="py-20 bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">Master Precious Metals</h2>
          <p className="text-xl text-yellow-300 max-w-3xl mx-auto">
            Comprehensive educational resources to help you become an expert in precious metals, coin grading, and market analysis.
          </p>
        </div>

        {/* Learning Paths */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {learningPaths.map((path, index) => (
            <Card key={index} className="glass-morphism border-white/20 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8">
                <div className={`w-16 h-16 ${path.color} rounded-full flex items-center justify-center mb-6`}>
                  <i className={`${path.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{path.title}</h3>
                <p className="text-yellow-300 mb-6">{path.description}</p>
                <ul className="space-y-2 mb-8 text-sm">
                  {path.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center space-x-2">
                      <i className={`fas fa-check ${path.color === 'bg-green-500' ? 'text-green-400' : path.color === 'bg-blue-500' ? 'text-blue-400' : 'text-purple-400'}`}></i>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${path.color} text-white font-semibold hover:opacity-90 transition-opacity`}>
                  {index === 0 ? 'Start Learning' : index === 1 ? 'Advanced Course' : 'Expert Training'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Articles */}
        <Card className="glass-morphism border-white/20">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold mb-8">Latest Educational Content</h3>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-lg overflow-hidden animate-pulse">
                    <div className="w-full h-32 bg-gray-600"></div>
                    <div className="p-4">
                      <div className="h-3 bg-gray-600 rounded mb-2"></div>
                      <div className="h-4 bg-gray-600 rounded mb-2"></div>
                      <div className="h-12 bg-gray-600 rounded mb-3"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-600 rounded w-16"></div>
                        <div className="h-3 bg-gray-600 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 3).map((article) => (
                  <div key={article.id} className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
                    {/* Placeholder for article image */}
                    <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <i className="fas fa-newspaper text-2xl text-yellow-500"></i>
                    </div>
                    <div className="p-4">
                      <Badge className="text-xs font-medium mb-1 bg-gold text-yellow-900">
                        {article.category.toUpperCase()}
                      </Badge>
                      <h4 className="font-semibold mt-1 mb-2 line-clamp-2">{article.title}</h4>
                      <p className="text-sm text-yellow-400 mb-3 line-clamp-3">{article.excerpt}</p>
                      <div className="flex justify-between items-center text-xs text-yellow-500">
                        <span>{article.readTime} min read</span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-book-open text-4xl text-yellow-500 mb-4"></i>
                <h3 className="text-xl font-semibold mb-2">No articles available</h3>
                <p className="text-yellow-400">Educational content will be added soon</p>
              </div>
            )}
            
            <div className="text-center mt-8">
              <Button className="px-8 py-3 glass-morphism text-white font-semibold hover:bg-white/20 transition-all duration-300">
                View All Articles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
