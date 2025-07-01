import Header from "./Header"
import HeroSection from "./HeroSection"
import FeaturesSection from "./FeaturesSection"
import HowItWorksSection from "./HowItWorksSection"
import DashboardPreview from "./DashboardPreview"
import BenefitsSection from "./BenefitsSection"
import TestimonialsSection from "./TestimonialsSection"
import CTASection from "./CTASection"
import Footer from "./Footer"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DashboardPreview />
      <BenefitsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
