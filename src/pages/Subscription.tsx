import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

export const Subscription = () => {
    // This would come from your auth context or API
    const subscription: SubscriptionPlan = {
        is_active: true,
        category: 'Premium',
        next_renewal: {
            unixtime: Date.now() / 1000 + 30 * 24 * 60 * 60, // 30 days from now
        },
        subscription: {
            sku: {
                category: 'Premium',
                variation: 'monthly'
            }
        }
    };

    const userFeatures: UserFeatures = {
        unmasking: true,
        blacklist: true,
        missed_call_alerts: true,
        cnam: true,
        transcriptions: true,
        recording: false
    };

    const getTotalSubscriptionPrice = () => {
        // This would come from your pricing logic
        return '9.99';
    };

    const formatDate = (unixtime: number) => {
        return format(new Date(unixtime * 1000), 'MMM dd, yyyy');
    };

    return (
        <div>
            <section className="header-bar call-detail-header">
                <Link className="header-back" to="/settings">
                    <i className="icon ion-ios-arrow-back"></i>
                    Back
                </Link>
                <h1>Subscription</h1>
            </section>
            
            <div className="settings-detail-content">
                <ul className="list list-sidebar">
                    <div className="form-spacer"></div>
                    <li className="item">
                        <div className="plan-info">
                            Your Plan:
                            <b className="green">Premium</b>
                            <br />
                            <div>
                                <span>Next charge: <b>$9.99</b> on Jan 1, 2024</span>
                            </div>
                            <div className="upgrade">
                                <div className="plan-column">
                                    <p>Current features:</p>
                                    <ul>
                                        <li><i className="icon icon-check"></i>Unmask Blocked Calls</li>
                                        <li><i className="icon icon-check"></i>Block harassing callers</li>
                                        <li><i className="icon icon-check"></i>Missed call alerts</li>
                                        <li><i className="icon icon-check"></i>Name & Address Caller ID</li>
                                    </ul>
                                </div>
                                <div className="plan-column">
                                    <p>Upgrade your plan to get:</p>
                                    <ul>
                                        <li className="orange">Call Recording</li>
                                        <li className="orange">Voicemail Transcriptions</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>

                <ul className="list has-hover">
                    <div className="form-spacer"></div>
                    <div className="item item-divider">
                        <i className="ion-ios-star-outline"></i>
                        Your Subscription
                    </div>

                    <li className="item item-icon-left item-icon-right">
                        <Link to="/settings/payment-methods">
                            <i className="icon ion-card"></i>
                            Update Payment Method
                            <i className="icon ion-chevron-right icon-accessory"></i>
                        </Link>
                    </li>

                    <li className="item item-icon-left item-icon-right">
                        <Link to="/settings/transactions">
                            <i className="icon ion-ios-list-outline"></i>
                            Payment History
                            <i className="icon ion-chevron-right icon-accessory"></i>
                        </Link>
                    </li>

                    <li className="item item-icon-left item-icon-right">
                        <Link to="/settings/change-plan">
                            <i className="icon ion-ios-star-outline"></i>
                            Change Your Plan
                            <i className="icon ion-chevron-right icon-accessory"></i>
                        </Link>
                    </li>

                    <li className="item item-icon-left item-icon-right">
                        <Link to="/settings/cancel">
                            <i className="icon ion-ios-list-outline"></i>
                            Cancel Your Plan
                            <i className="icon ion-chevron-right icon-accessory"></i>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}; 
