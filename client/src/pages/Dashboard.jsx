import { useState, useEffect } from 'react';
import { getStats, getStudentsByKhoa } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalClasses: 0,
    totalLecturers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse] = await Promise.all([
          getStats(),
          getStudentsByKhoa(),
        ]);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Thống kê</h1>

      {loading ? (
        <div className="dashboard-loading">
          <div className="dashboard-spinner"></div>
        </div>
      ) : (
        <>
          {/* Thống kê */}
          <div className="dashboard-stats">
            {[
              { label: 'Sinh viên', value: stats.totalStudents, icon: '🎓', color: 'stat-icon-blue' },
              { label: 'Môn học', value: stats.totalCourses, icon: '📚', color: 'stat-icon-blue' },
              { label: 'Lớp học', value: stats.totalClasses, icon: '🏫', color: 'stat-icon-blue' },
              { label: 'Giảng viên', value: stats.totalLecturers, icon: '👨‍🏫', color: 'stat-icon-blue' },
            ].map((item, index) => (
              <div
                key={index}
                className="dashboard-stat-card"
              >
                <div className={`dashboard-stat-icon ${item.color}`}>
                  <span className="dashboard-stat-emoji">{item.icon}</span>
                </div>
                <div>
                  <h2 className="dashboard-stat-label">{item.label}</h2>
                  <p className="dashboard-stat-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          
        </>
      )}
    </div>
  );
}