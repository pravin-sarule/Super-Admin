import React from 'react';

const SubscriptionManagement = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Management</h1>
      <p className="text-gray-600">This is the Subscription Management section. Only accessible by Super Admin and Account Admin roles.</p>
    </div>
  );
};

export default SubscriptionManagement;