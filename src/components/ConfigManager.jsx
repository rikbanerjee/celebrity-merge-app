import React, { useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';

const ConfigManager = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(APP_CONFIG);

  const handleConfigChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, you'd save this to a server or localStorage
    console.log('New configuration:', config);
    alert('Configuration saved! (This is a demo - in production, this would be saved to your server)');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    App Configuration
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Usage Configuration */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Usage Limits</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Free Usage Limit
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={config.USAGE.FREE_LIMIT}
                          onChange={(e) => handleConfigChange('USAGE', 'FREE_LIMIT', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Warning Threshold
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={config.USAGE.FREE_LIMIT - 1}
                          value={config.USAGE.WARNING_THRESHOLD}
                          onChange={(e) => handleConfigChange('USAGE', 'WARNING_THRESHOLD', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Amount ($)
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={config.USAGE.PAYMENT_AMOUNT}
                          onChange={(e) => handleConfigChange('USAGE', 'PAYMENT_AMOUNT', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Uses
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={config.USAGE.PAYMENT_USES}
                          onChange={(e) => handleConfigChange('USAGE', 'PAYMENT_USES', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UI Configuration */}
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">UI Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showWarning"
                          checked={config.UI.SHOW_USAGE_WARNING}
                          onChange={(e) => handleConfigChange('UI', 'SHOW_USAGE_WARNING', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showWarning" className="ml-2 text-sm text-gray-700">
                          Show usage warning
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enablePayment"
                          checked={config.UI.ENABLE_PAYMENT_MODAL}
                          onChange={(e) => handleConfigChange('UI', 'ENABLE_PAYMENT_MODAL', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enablePayment" className="ml-2 text-sm text-gray-700">
                          Enable payment modal
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showOffline"
                          checked={config.UI.SHOW_OFFLINE_MODE}
                          onChange={(e) => handleConfigChange('UI', 'SHOW_OFFLINE_MODE', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showOffline" className="ml-2 text-sm text-gray-700">
                          Show offline mode indicator
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Current Configuration Display */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Current Configuration</h3>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigManager;
