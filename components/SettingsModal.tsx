'use client';

import { useState } from 'react';
import { X, User, FileText, CreditCard, Check } from 'lucide-react';
import { Session } from 'next-auth';

interface SettingsModalProps {
  session: Session;
  onClose: () => void;
}

export default function SettingsModal({ session, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'billing'>('info');
  const [plan] = useState('free'); // Mock plan status

  const tabs = [
    { id: 'info', label: 'Basic Info', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '100 messages per month',
        'Basic Google Workspace integration',
        'Email support',
      ],
      current: plan === 'free',
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      features: [
        'Unlimited messages',
        'Advanced AI capabilities',
        'Priority support',
        'Custom workflows',
        'Team collaboration',
      ],
      current: plan === 'pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Advanced security',
      ],
      current: plan === 'enterprise',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{session.user?.name}</h3>
                  <p className="text-gray-600">{session.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={session.user?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={session.user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Connected Services</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Google Workspace</p>
                        <p className="text-sm text-gray-600">Full access granted</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Account Created</h4>
                <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents Coming Soon</h3>
              <p className="text-gray-600 text-center max-w-md">
                Soon you'll be able to manage and organize all your Google Workspace documents,
                create templates, and set up automated workflows right from here.
              </p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
                <div className="grid grid-cols-3 gap-4">
                  {plans.map((planItem) => (
                    <div
                      key={planItem.name}
                      className={`relative rounded-lg border-2 p-6 ${
                        planItem.current
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {planItem.popular && (
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      )}
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{planItem.name}</h4>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">{planItem.price}</span>
                          <span className="text-gray-600 text-sm">/{planItem.period}</span>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {planItem.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          planItem.current
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {planItem.current ? 'Current Plan' : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h4>
                <p className="text-gray-600 text-sm">
                  No payment method on file. Add a payment method to upgrade your plan.
                </p>
                <button className="mt-3 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
                  Add Payment Method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}