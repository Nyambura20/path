import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = localStorage.getItem('access_token');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
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
          const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const newToken = response.data.access;
          localStorage.setItem('access_token', newToken);
          authToken = newToken;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API client wrapper
class ApiClient {
  // Authentication
  async login(credentials) {
    try {
      const response = await api.post('/users/login/', credentials);
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        authToken = response.data.access_token;
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/users/register/', userData);
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        authToken = response.data.access_token;
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/users/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      authToken = null;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/users/profile/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(formData) {
    try {
      // Check if formData contains a file (profile picture)
      const isFormData = formData instanceof FormData;
      
      const config = {
        headers: {
          'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        }
      };

      const response = await api.patch('/users/profile/', formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Students
  async getStudents() {
    try {
      const response = await api.get('/students/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudentProfile() {
    try {
      const response = await api.get('/students/profile/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStudentDashboard() {
    try {
      const response = await api.get('/students/dashboard/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Courses
  async getCourses(params = {}) {
    try {
      const response = await api.get('/courses/', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCourse(id) {
    try {
      const response = await api.get(`/courses/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCourse(courseData) {
    try {
      const response = await api.post('/courses/', courseData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCourse(id, courseData) {
    try {
      const response = await api.put(`/courses/${id}/`, courseData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCourse(id) {
    try {
      const response = await api.delete(`/courses/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async enrollInCourse(courseId) {
    try {
      const response = await api.post(`/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async dropCourse(courseId) {
    try {
      const response = await api.delete(`/courses/${courseId}/drop/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Teachers
  async getTeachers() {
    try {
      const response = await api.get('/users/teachers/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacher(id) {
    try {
      const response = await api.get(`/users/teachers/${id}/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Performance
  async getGrades() {
    try {
      const response = await api.get('/performance/grades/my-grades/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPerformanceSummary() {
    try {
      const response = await api.get('/performance/summary/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAssessments() {
    try {
      const response = await api.get('/performance/assessments/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Attendance
  async getAttendanceRecords() {
    try {
      const response = await api.get('/attendance/records/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAttendanceSummary() {
    try {
      const response = await api.get('/attendance/summaries/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Alias functions for compatibility
  async getStudentPerformance() {
    return this.getPerformanceSummary();
  }

  async getStudentAttendance() {
    return this.getAttendanceRecords();
  }

  async getTeacherPerformanceData() {
    return this.getTeacherPerformanceDashboard();
  }

  async getAllPerformanceData() {
    try {
      const response = await api.get('/performance/grades/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Teacher-specific endpoints
  async getTeacherCourses() {
    try {
      const response = await api.get('/users/teachers/my-courses/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherAttendanceDashboard() {
    try {
      const response = await api.get('/attendance/teacher/dashboard/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherPerformanceDashboard() {
    try {
      const response = await api.get('/performance/teacher/dashboard/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markClassAttendance(attendanceData) {
    try {
      const response = await api.post('/attendance/teacher/mark-class/', attendanceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recordStudentGrades(gradesData) {
    try {
      const response = await api.post('/performance/teacher/record-grades/', gradesData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherAttendanceRecords(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/attendance/teacher/records/?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTeacherPerformanceRecords(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/performance/teacher/records/?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // New methods for teacher workflow
  async getCourseAttendance(courseId, dateRange = {}) {
    try {
      const params = new URLSearchParams({
        course_id: courseId,
        ...dateRange
      });
      const response = await api.get(`/attendance/course/${courseId}/?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async recordPerformance(performanceData) {
    try {
      const response = await api.post('/performance/teacher/record/', performanceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCoursePerformance(courseId, filters = {}) {
    try {
      const params = new URLSearchParams({
        course_id: courseId,
        ...filters
      });
      const response = await api.get(`/performance/course/${courseId}/?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getEnrolledStudents(courseId) {
    try {
      const response = await api.get(`/courses/${courseId}/enrolled-students/`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotifications() {
    try {
      const response = await api.get('/notifications/');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/`, { is_read: true });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.detail || 
                     `Error: ${error.response.status}`;
      return new Error(message);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  // Get stored user data
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

const apiClient = new ApiClient();
export default apiClient;
