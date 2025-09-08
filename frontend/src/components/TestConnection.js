import React, { useState } from 'react';
import apiService from '../services/api';

const TestConnection = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      // Test a simple endpoint that doesn't require authentication
      const response = await fetch('http://127.0.0.1:8000/api/docs/');
      if (response.ok) {
        setTestResult({ 
          success: true, 
          message: 'API connection successful! Backend is running properly.' 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `API returned status: ${response.status}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Connection failed: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    try {
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        password_confirm: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
        role: 'student'
      };

      const response = await apiService.register(testUser);
      setTestResult({ 
        success: true, 
        message: 'Test registration successful! API endpoints are working.' 
      });
    } catch (error) {
      if (error.response?.status === 400) {
        setTestResult({ 
          success: true, 
          message: 'Registration endpoint is working (validation errors are expected).' 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `Registration test failed: ${error.message}` 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Connection Tests
      </h3>
      
      <div className="space-y-4">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>

        <button
          onClick={testRegistration}
          disabled={loading}
          className="btn btn-secondary w-full"
        >
          {loading ? 'Testing...' : 'Test Registration Endpoint'}
        </button>

        {testResult && (
          <div className={`p-3 rounded-md ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestConnection;
