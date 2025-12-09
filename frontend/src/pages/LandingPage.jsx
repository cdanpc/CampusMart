import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ContactInfo from '../components/common/ContactInfo';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero__content">
            <p className="hero__tagline">Welcome to CampusMart</p>
            <h1 className="hero__title">
              Buy, Sell, &<br />
              Trade <span className="hero__title--highlight">On Campus</span>
            </h1>
            <p className="hero__subtitle">
              Ditch the hassle. Trade your textbooks, sell that sweet bassinet, and find awesome deals from other students right at your university.
            </p>
            <div className="hero__actions">
              <Link to="/register">
                <Button variant="accent" size="large">
                  Get Started For Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="hero__image">
            <img 
              src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop" 
              alt="Student selling items" 
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="text-center">Why Choose Campus Mart?</h2>
          <div className="features__grid">
            <Card className="feature">
              <div className="feature__icon">🔒</div>
              <h3 className="feature__title">Safe & Secure</h3>
              <p className="feature__text">
                Trade with verified students from your campus community
              </p>
            </Card>
            <Card className="feature">
              <div className="feature__icon">💰</div>
              <h3 className="feature__title">Save Money</h3>
              <p className="feature__text">
                Find great deals on textbooks and student essentials
              </p>
            </Card>
            <Card className="feature">
              <div className="feature__icon">🌱</div>
              <h3 className="feature__title">Sustainable</h3>
              <p className="feature__text">
                Reduce waste by giving items a second life
              </p>
            </Card>
            <Card className="feature">
              <div className="feature__icon">⚡</div>
              <h3 className="feature__title">Quick Deals</h3>
              <p className="feature__text">
                Meet on campus for fast, convenient transactions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="about__content">
            <div className="about__text">
              <h2>About Campus Mart</h2>
              <p>
                Campus Mart was created by students, for students. We understand the challenges of finding affordable textbooks, selling used items, and connecting with classmates for trades.
              </p>
              <p>
                Our platform makes it easy to buy, sell, and trade items within your campus community. Every transaction helps build a more sustainable and connected campus environment.
              </p>
              <div className="about__stats">
                <div className="stat">
                  <div className="stat__number">500+</div>
                  <div className="stat__label">Active Users</div>
                </div>
                <div className="stat">
                  <div className="stat__number">2,000+</div>
                  <div className="stat__label">Items Listed</div>
                </div>
                <div className="stat">
                  <div className="stat__number">1,500+</div>
                  <div className="stat__label">Successful Trades</div>
                </div>
              </div>
            </div>
            <div className="about__image">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                alt="Students collaborating" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <div className="contact__content">
            <br />
            <h2>Get In Touch</h2>
            <p>Have questions? We'd love to hear from you.</p>
            <div className="contact__info">
              <ContactInfo 
                icon="email"
                title="Email"
                description="support@campusmart.com"
              />
              <ContactInfo 
                icon="phone"
                title="Phone"
                description="+63 912 345 6789"
              />
              <ContactInfo 
                icon="location"
                title="Location"
                description="Campus Center, Main Building"
              />
            </div>
            <Link to="/register">
              <Button variant="accent" size="large">
                Join Campus Mart Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
