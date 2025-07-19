import { TrendingUp, Scan, Lightbulb, BarChart3, Bell } from "lucide-react"

const FeaturesSection = () => {
  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Track Income & Expenses",
      description: "Automatically categorize and monitor all your financial transactions in real-time.",
    },
    {
      icon: <Scan className="w-8 h-8" />,
      title: "AI-Powered Receipt Scanner",
      description: "Simply snap a photo of your receipts and let AI extract and categorize the data instantly.",
    },
 
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Investment Dashboard",
      description: "Track your portfolio performance and get AI-driven investment insights.",
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Real-time Alerts",
      description: "Never miss important payments or budget limits with smart notifications.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Smart Finance Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to take control of your finances, powered by advanced AI technology.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl w-fit mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
