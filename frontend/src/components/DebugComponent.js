import React, { useState } from 'react';

const DebugComponent = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Test basic fetch to Django
      const response = await fetch('http://127.0.0.1:8000/api/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Backend connection successful!\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Backend returned status: ${response.status}`);
      }
    } catch (error) {
      setResult(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      const userData = {
        username: `test_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'TestPass123!',
        password_confirm: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User',
        role: 'student'
      };

      const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Registration successful!\n${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Registration failed (${response.status}):\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`❌ Registration error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">
        🔧 BRIGHTPATH Debug Panel
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '⏳ Testing...' : '🔗 Test Backend Connection'}
        </button>

        <button
          onClick={testRegistration}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? '⏳ Testing...' : '👤 Test Registration'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Test Result:</h3>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-100 p-3 rounded overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugComponent;
