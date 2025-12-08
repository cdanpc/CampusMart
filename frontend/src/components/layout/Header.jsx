import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isRegisterPage = location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`header ${isRegisterPage ? 'header--transparent' : ''}`}>
      <div className="container">
        <div className="header__content">
          <Link to="/" className="header__brand">
            <div className="header__logo">
              <Logo size={28} />
            </div>
            <span className="header__title">Campus Mart</span>
          </Link>
          <nav className="header__nav">
            {isLandingPage ? (
              <>
                <button
                  onClick={() => scrollToSection('features')}
                  className="header__link header__link--btn"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="header__link header__link--btn"
                >
                  About Us
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="header__link header__link--btn"
                >
                  Contact
                </button>
              </>
            ) : null}
            <Link to="/login" className="header__link">
              Login
            </Link>
            <Link to="/register" className="header__link header__link--cta">
              Sign Up
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
