import { PieChart, BarChart3, Lightbulb, TrendingUp } from "lucide-react"

const DashboardPreview = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live Dashboard Preview</h2>
          <p className="text-xl text-gray-600">
            See your financial data come to life with interactive charts and insights
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="bg-white rounded-xl p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Overview</h3>
                  <div className="h-48 bg-white rounded-lg flex items-center justify-center">
                    <PieChart className="w-24 h-24 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                  <div className="h-32 bg-white rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-green-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold text-green-600">+15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Savings Goal</span>
                      <span className="font-semibold text-blue-600">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget Left</span>
                      <span className="font-semibold text-purple-600">$1,250</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-1" />
                      <p className="text-sm text-gray-600">You can save $120 by reducing dining out</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-1" />
                      <p className="text-sm text-gray-600">Your savings rate improved by 8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
