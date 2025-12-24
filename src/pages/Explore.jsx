import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LabourerCard from '../components/common/LabourerCard';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { professions, locations } from '../services/mockData';
import './Explore.css';

function Explore() {
    const { labourers } = useData();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [filteredLabourers, setFilteredLabourers] = useState(labourers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProfession, setSelectedProfession] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const results = labourers.filter(labourer => {
            const matchesSearch = labourer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                labourer.profession.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesProfession = selectedProfession === 'All' || labourer.profession === selectedProfession;
            const matchesLocation = selectedLocation === 'All' || labourer.location === selectedLocation;

            return matchesSearch && matchesProfession && matchesLocation;
        });
        setFilteredLabourers(results);
    }, [searchTerm, selectedProfession, selectedLocation, labourers]);

    return (
        <div className="explore-page">
            <header className="explore-header">
                {/* Top Navigation Bar */}
                <div className="explore-navbar">
                    <Link to="/" className="explore-brand">
                        <i className="fas fa-wrench"></i>
                        <span>Oga</span>
                    </Link>

                    <div className="explore-nav-actions">
                        {user && (
                            <Link to={`/dashboard/${user.type}`} className="nav-link">
                                <i className="fas fa-th-large"></i>
                                <span>Dashboard</span>
                            </Link>
                        )}
                        <button className="nav-btn-logout" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Hero Section with Search */}
                <div className="explore-hero">
                    <h1>Find Skilled Professionals</h1>
                    <p>Browse through our network of verified labourers ready to work</p>

                    <div className="search-filter-container">
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search by name, skill, or keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="filter-select">
                            <select
                                value={selectedProfession}
                                onChange={(e) => setSelectedProfession(e.target.value)}
                            >
                                {professions.map(prof => (
                                    <option key={prof} value={prof}>{prof === 'All' ? 'All Professions' : prof}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-select">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn-search-submit">
                            <i className="fas fa-search"></i>
                            Search
                        </button>
                    </div>
                </div>
            </header>

            <section className="results-section">
                <div className="container">
                    <div className="results-count">
                        Showing {filteredLabourers.length} results
                    </div>

                    {filteredLabourers.length > 0 ? (
                        <div className="labourers-grid">
                            {filteredLabourers.map(labourer => (
                                <LabourerCard key={labourer.id} labourer={labourer} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <i className="fas fa-search"></i>
                            <h3>No labourers found</h3>
                            <p>Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                className="btn-text"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedProfession('All');
                                    setSelectedLocation('All');
                                }}
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Explore;
