import { Clock, Bell, Brain, Shield } from "lucide-react"

const BenefitsSection = () => {
  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time with Automation",
      description: "Eliminate manual data entry and let AI handle the heavy lifting",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Never Miss Payments",
      description: "Smart reminders ensure you stay on top of all your financial obligations",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smarter Financial Decisions",
      description: "AI-powered insights help you make informed choices about your money",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Encrypted Data",
      description: "Bank-level security ensures your financial information stays protected",
    },
  ]

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose FinScope?</h2>
          <p className="text-xl text-gray-600">Experience the benefits of AI-powered financial management</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
