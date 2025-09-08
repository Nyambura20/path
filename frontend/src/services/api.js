import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/users/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('token', access);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Authentication endpoints
  async login(credentials) {
    const response = await apiClient.post('/api/users/login/', credentials);
    const { access, refresh, user } = response.data;
    
    // Store tokens
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  }

  async register(userData) {
    console.log('Registering user with data:', userData);
    console.log('API URL:', API_BASE_URL);
    try {
      const response = await apiClient.post('/api/users/register/', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.post('/api/users/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async getProfile() {
    const response = await apiClient.get('/api/users/profile/');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await apiClient.patch('/api/users/profile/', profileData);
    return response.data;
  }

  // Student endpoints
  async getStudents() {
    const response = await apiClient.get('/api/students/');
    return response.data;
  }

  async getStudent(id) {
    const response = await apiClient.get(`/api/students/${id}/`);
    return response.data;
  }

  async createStudent(studentData) {
    const response = await apiClient.post('/api/students/', studentData);
    return response.data;
  }

  async updateStudent(id, studentData) {
    const response = await apiClient.patch(`/api/students/${id}/`, studentData);
    return response.data;
  }

  async deleteStudent(id) {
    const response = await apiClient.delete(`/api/students/${id}/`);
    return response.data;
  }

  async getStudentDashboard(id) {
    const response = await apiClient.get(`/api/students/${id}/dashboard/`);
    return response.data;
  }

  // Course endpoints
  async getCourses() {
    const response = await apiClient.get('/api/courses/');
    return response.data;
  }

  async getCourse(id) {
    const response = await apiClient.get(`/api/courses/${id}/`);
    return response.data;
  }

  async createCourse(courseData) {
    const response = await apiClient.post('/api/courses/', courseData);
    return response.data;
  }

  async updateCourse(id, courseData) {
    const response = await apiClient.patch(`/api/courses/${id}/`, courseData);
    return response.data;
  }

  async deleteCourse(id) {
    const response = await apiClient.delete(`/api/courses/${id}/`);
    return response.data;
  }

  async enrollStudent(courseId, studentId) {
    const response = await apiClient.post(`/api/courses/${courseId}/enroll/`, {
      student_id: studentId
    });
    return response.data;
  }

  async dropCourse(courseId, studentId) {
    const response = await apiClient.post(`/api/courses/${courseId}/drop/`, {
      student_id: studentId
    });
    return response.data;
  }

  async getEnrollments() {
    const response = await apiClient.get('/api/courses/enrollments/');
    return response.data;
  }

  // Performance endpoints
  async getGrades() {
    const response = await apiClient.get('/api/performance/grades/');
    return response.data;
  }

  async getStudentGrades() {
    const response = await apiClient.get('/api/performance/grades/my-grades/');
    return response.data;
  }

  async createGrade(gradeData) {
    const response = await apiClient.post('/api/performance/grades/', gradeData);
    return response.data;
  }

  async updateGrade(id, gradeData) {
    const response = await apiClient.patch(`/api/performance/grades/${id}/`, gradeData);
    return response.data;
  }

  async getAssessments() {
    const response = await apiClient.get('/api/performance/assessments/');
    return response.data;
  }

  async createAssessment(assessmentData) {
    const response = await apiClient.post('/api/performance/assessments/', assessmentData);
    return response.data;
  }

  async getPredictions() {
    const response = await apiClient.get('/api/performance/predictions/');
    return response.data;
  }

  async generatePrediction(studentId, courseId) {
    const response = await apiClient.post('/api/performance/predictions/generate/', {
      student_id: studentId,
      course_id: courseId
    });
    return response.data;
  }

  async getPerformanceSummary() {
    const response = await apiClient.get('/api/performance/summary/');
    return response.data;
  }

  // Attendance endpoints
  async getAttendanceRecords() {
    const response = await apiClient.get('/api/attendance/records/');
    return response.data;
  }

  async markAttendance(attendanceData) {
    const response = await apiClient.post('/api/attendance/records/', attendanceData);
    return response.data;
  }

  async bulkMarkAttendance(attendanceList) {
    const response = await apiClient.post('/api/attendance/records/bulk/', {
      attendance_records: attendanceList
    });
    return response.data;
  }

  async getAttendanceSessions() {
    const response = await apiClient.get('/api/attendance/sessions/');
    return response.data;
  }

  async createAttendanceSession(sessionData) {
    const response = await apiClient.post('/api/attendance/sessions/', sessionData);
    return response.data;
  }

  async getAttendanceSummaries() {
    const response = await apiClient.get('/api/attendance/summaries/');
    return response.data;
  }

  async getAttendanceAlerts() {
    const response = await apiClient.get('/api/attendance/alerts/');
    return response.data;
  }

  async checkAttendanceAlerts() {
    const response = await apiClient.post('/api/attendance/alerts/check/');
    return response.data;
  }

  async getStudentAttendanceReport(studentId) {
    const response = await apiClient.get(`/api/attendance/reports/student/${studentId}/`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await apiClient.get('/api/dashboard/');
    return response.data;
  }

  async getApiOverview() {
    const response = await apiClient.get('/api/');
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Utility functions
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export { apiClient };
export default apiService;
