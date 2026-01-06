import React, { useEffect } from 'react';
import './LegalPages.css';

function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page-container">
            <header className="legal-header">
                <h1>Privacy Policy</h1>
                <p>Last Updated: January 5, 2026</p>
            </header>

            <div className="legal-content">
                <section>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us when you create an account, update your profile, or communicate with other users. This includes:</p>
                    <ul>
                        <li>Name and contact information (email, phone number).</li>
                        <li>Profile data (photo, profession, experience, bio).</li>
                        <li>Location information for matching services.</li>
                        <li>Messaging history within the platform.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our Service.</li>
                        <li>Match Labourers with suitable job opportunities.</li>
                        <li>Facilitate communication between users.</li>
                        <li>Verify user identity and maintain a safe community.</li>
                        <li>Send technical notices, updates, and support messages.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Sharing of Information</h2>
                    <p>We do not sell your personal information. We may share information:</p>
                    <ul>
                        <li>Between Hirers and Labourers to facilitate work engagements.</li>
                        <li>With third-party service providers who perform services on our behalf.</li>
                        <li>If required by law or to protect the rights and safety of our community.</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Data Security</h2>
                    <p>We take reasonable measures to protect your personal information from loss, theft, and unauthorized access. However, no internet transmission is ever fully secure.</p>
                </section>

                <section>
                    <h2>5. Your Choices</h2>
                    <p>You may update your account information at any time through your settings. You can also request to delete your account by contacting our support team.</p>
                </section>

                <section>
                    <h2>6. Cookies</h2>
                    <p>We use cookies and similar tracking technologies to track activity on our Service and hold certain information to improve user experience.</p>
                </section>

                <section>
                    <h2>7. Changes to This Policy</h2>
                    <p>We may change this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                </section>

                <section>
                    <h2>8. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@oga.com.</p>
                </section>
            </div>

            <footer className="legal-footer">
                <p>&copy; 2026 Oga Platform. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default PrivacyPolicy;
