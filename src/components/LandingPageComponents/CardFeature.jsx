import React from 'react';
import './LandingPageStyles.css';

const CardFeature = ({ icon, title, content }) => {
    return (
        <div className="card-feature">
            <div className="card-feature-icon">
                {icon}
            </div>
            <div className="card-feature-content">
                <div className="card-feature-text">
                    {content}
                </div>
                <div className="card-feature-title">
                    {title}
                </div>
            </div>
        </div>
    );
};

export default CardFeature;