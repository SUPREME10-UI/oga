import React, { useEffect } from 'react';
import './LegalPages.css';

function TermsOfService() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page-container">
            <header className="legal-header">
                <h1>Terms of Service</h1>
                <p>Last Updated: January 5, 2026</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using the Oga platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.</p>
                </section>

                <section>
                    <h2>2. Description of Service</h2>
                    <p>Oga is a marketplace connecting skilled labourers ("Labourers") with individuals or businesses looking for services ("Hirers"). Oga provide the platform for communication and coordination but does not directly employ Labourers.</p>
                </section>

                <section>
                    <h2>3. User Responsibilities</h2>
                    <p>Users are responsible for:</p>
                    <ul>
                        <li>Providing accurate information during registration.</li>
                        <li>Maintaining the security of their account credentials.</li>
                        <li>Conducting themselves professionally during interactions on the platform.</li>
                        <li>Ensuring they have the right to perform or hire for the services requested.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Payments and Fees</h2>
                    <p>Payments for services are negotiated between Hirers and Labourers. Oga may facilitate payments through third-party processors. Fees for using the platform, if any, will be clearly communicated before transactions.</p>
                </section>

                <section>
                    <h2>5. Prohibited Activities</h2>
                    <p>Users may not:</p>
                    <ul>
                        <li>Use the platform for any illegal purpose.</li>
                        <li>Harass or abuse other users.</li>
                        <li>Provide false or misleading information.</li>
                        <li>Attempt to interfere with the security or integrity of the platform.</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Limitation of Liability</h2>
                    <p>Oga shall not be liable for any direct, indirect, incidental, or consequential damages arising out of your use of the Service or interactions with other users.</p>
                </section>

                <section>
                    <h2>7. Termination</h2>
                    <p>We reserve the right to suspend or terminate your account at our sole discretion if we believe you have violated these Terms.</p>
                </section>

                <section>
                    <h2>8. Changes to Terms</h2>
                    <p>We may update these Terms from time to time. Your continued use of the Service after changes are posted constitutes acceptance of the new Terms.</p>
                </section>
            </div>

            <footer className="legal-footer">
                <p>&copy; 2026 Oga Platform. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default TermsOfService;
