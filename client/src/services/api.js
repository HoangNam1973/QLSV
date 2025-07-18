import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = data => api.post('/users/login', data);
export const register = data => api.post('/users/register', data);
export const getProfile = () => api.get('/users/profile');
export const updateUser = data => api.post('/users/update', data);
export const deleteUser = data => api.post('/users/delete', data);
export const getUsers = data => api.post('/users/getlist', data);

export const getStudents = params => api.get('/students/getlist', { params });
export const insertStudent = data => api.post('/students/insert', data);
export const updateStudent = data => api.post('/students/update', data);
export const deleteStudent = data => api.post('/students/delete', data);
export const deleteManyStudents = data => api.post('/students/delete-many', data);

export const getCourses = data => api.post('/courses/getlist', data);
export const insertCourse = data => api.post('/courses/insert', data);
export const updateCourse = data => api.post('/courses/update', data);
export const deleteCourse = data => api.post('/courses/delete', data);
export const deleteManyCourses = data => api.post('/courses/delete-many', data);

export const getClasses = data => api.post('/classes/getlist', data);
export const insertClass = data => api.post('/classes/insert', data);
export const updateClass = data => api.post('/classes/update', data);
export const deleteClass = data => api.post('/classes/delete', data);
export const deleteManyClasses = data => api.post('/classes/delete-many', data);
export const loadDataLop = () => api.post('/classes/loaddatalop');

export const getGrades = data => api.post('/grades/getlist', data);
export const getGradesByMaSV = data => api.post('/grades/getlistbymasv', data);
export const insertGrade = data => api.post('/grades/insert', data);
export const updateGrade = data => api.post('/grades/update', data);
export const deleteGrade = data => api.post('/grades/delete', data);
export const getAverageByCourse = () => api.get('/grades/average-by-course');
export const getGPABySemester = data => api.post('/grades/gpa-by-semester', data);
export const getTopStudentsByGPA = () => api.get('/stats/top-students-by-gpa');
export const getStats = () => api.get('/stats');
export const getStudentsByKhoa = () => api.get('/stats/students-by-khoa');
