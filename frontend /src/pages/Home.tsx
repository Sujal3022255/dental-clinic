import { Activity, Heart, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/image copy.png";

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img
              src={logo}
              alt="Dental Care Logo"
              className="h-16 w-auto"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-[#0b8fac] font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-[#0b8fac] text-white px-6 py-2 rounded-lg hover:bg-[#096f85] transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Your Smile, Our Priority
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience comprehensive dental care with our advanced booking system.
              Connect with experienced dentists, manage appointments, and maintain your oral health journey.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-[#0b8fac] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#096f85] transition-colors shadow-lg"
            >
              Book Your Appointment
            </button>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=600&fit=crop"
              alt="Dental Care"
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-3xl font-bold text-[#0b8fac]">10,000+</p>
              <p className="text-gray-600">Happy Patients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Dental Care?
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Feature icon={<Activity className="w-6 h-6 text-[#0b8fac]" />} title="Expert Dentists" />
          <Feature icon={<Clock className="w-6 h-6 text-green-600" />} title="Easy Scheduling" />
          <Feature icon={<Heart className="w-6 h-6 text-red-600" />} title="Comprehensive Care" />
          <Feature icon={<Shield className="w-6 h-6 text-purple-600" />} title="Emergency Support" />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0b8fac] rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Take Care of Your Smile?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied patients who trust us with their dental care.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-[#0b8fac] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Dental Care. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">
        High-quality dental services delivered with care and professionalism.
      </p>
    </div>
  );
}
