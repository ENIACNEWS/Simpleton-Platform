import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Discussion } from "@/types";

const mockExperts = [
  {
    initials: "JD",
    name: "Dr. John Davidson",
    specialty: "Certified Precious Metals Appraiser",
    rating: 4.9,
    answers: 234,
    gradient: "from-gold to-yellow-500"
  },
  {
    initials: "SM",
    name: "Sarah Martinez", 
    specialty: "Numismatic Specialist & Coin Grader",
    rating: 4.8,
    answers: 187,
    gradient: "from-silver to-gray-400"
  }
];

const mockDiscussions = [
  {
    id: 1,
    title: "How to identify fake 1oz American Gold Eagles?",
    preview: "I recently purchased some gold eagles and want to verify their authenticity. What are the key things to look for...",
    author: "Mike K.",
    time: "2 hours ago",
    replies: 8,
    likes: 15,
    initials: "MK",
    gradient: "from-blue-500 to-purple-500"
  },
  {
    id: 2,
    title: "Best strategies for silver stacking in 2024",
    preview: "Looking for advice on building a silver stack. Should I focus on government coins or go with generic rounds...",
    author: "Anna L.",
    time: "5 hours ago", 
    replies: 23,
    likes: 42,
    initials: "AL",
    gradient: "from-green-500 to-blue-500"
  },
  {
    id: 3,
    title: "Grading vs Raw coins - which is better for investment?",
    preview: "Debating whether to send my Morgan dollars for grading or keep them raw. What are your thoughts...",
    author: "Robert C.",
    time: "1 day ago",
    replies: 16,
    likes: 28,
    initials: "RC", 
    gradient: "from-purple-500 to-pink-500"
  }
];

export function CommunityStats() {
  const { data: discussions } = useQuery<Discussion[]>({
    queryKey: ['/api/discussions'],
  });

  const communityStats = {
    experts: 127,
    discussions: discussions?.length || 8500,
    members: 45000,
    questions: 2300
  };

  return (
    <section className="py-20 bg-gradient-to-b from-primary-900 to-primary-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-yellow-300 max-w-3xl mx-auto">
            Connect with experts, collectors, and investors. Share knowledge, get advice, and stay updated on market trends.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Community Stats */}
          <div className="space-y-8">
            <Card className="glass-morphism border-white/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Community Stats</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold mb-2">{communityStats.experts}</div>
                    <div className="text-sm text-yellow-400">Verified Experts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-silver mb-2">{(communityStats.discussions || 0).toLocaleString()}+</div>
                    <div className="text-sm text-yellow-400">Discussions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{(communityStats.members || 0).toLocaleString()}+</div>
                    <div className="text-sm text-yellow-400">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{(communityStats.questions || 0).toLocaleString()}+</div>
                    <div className="text-sm text-yellow-400">Questions Solved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-white/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Featured Experts</h3>
                <div className="space-y-4">
                  {mockExperts.map((expert, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${expert.gradient} rounded-full flex items-center justify-center`}>
                        <span className="text-yellow-900 font-bold text-sm">{expert.initials}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{expert.name}</h4>
                        <p className="text-sm text-yellow-400">{expert.specialty}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gold">{expert.rating}★</div>
                        <div className="text-xs text-yellow-400">{expert.answers} answers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Discussions */}
          <Card className="glass-morphism border-white/20">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Recent Discussions</h3>
                <button className="text-gold hover:text-yellow-400 text-sm font-medium">View All</button>
              </div>
              
              <div className="space-y-6">
                {mockDiscussions.map((discussion) => (
                  <div key={discussion.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${discussion.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">{discussion.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1">{discussion.title}</h4>
                        <p className="text-sm text-yellow-400 mb-2 line-clamp-2">{discussion.preview}</p>
                        <div className="flex items-center space-x-4 text-xs text-yellow-500">
                          <span>{discussion.author}</span>
                          <span>{discussion.time}</span>
                          <span className="flex items-center">
                            <i className="fas fa-comment mr-1"></i>
                            <span>{discussion.replies} replies</span>
                          </span>
                          <span className="flex items-center">
                            <i className="fas fa-heart mr-1"></i>
                            <span>{discussion.likes}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Button className="w-full px-6 py-3 bg-gradient-to-r from-gold to-yellow-500 text-yellow-900 font-semibold hover:from-yellow-500 hover:to-gold transition-all duration-300">
                  Join the Discussion
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
