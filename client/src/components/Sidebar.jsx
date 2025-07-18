import { NavLink } from 'react-router-dom';
import { Home, Users, Book, Clipboard, FileText, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/users', icon: Users, label: 'Quản lý người dùng', adminOnly: true },
    { path: '/students', icon: Users, label: 'Quản lý sinh viên' },
    { path: '/classes', icon: Clipboard, label: 'Quản lý lớp học' },
    { path: '/courses', icon: Book, label: 'Quản lý môn học' },
    { path: '/grades', icon: FileText, label: 'Quản lý điểm' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          StudentMng
        </h2>
        <p className="sidebar-desc">Quản lý sinh viên</p>
        {user && user.username && (
          <p className="sidebar-greeting">Xin chào, <b>{user.username}</b></p>
        )}
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-list">
          {navItems.map(item => (
            ((!item.adminOnly) ||
            (item.adminOnly && user?.role === 'admin') ||
            (['admin'].includes(user?.role))) && (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' sidebar-link-active' : ''}`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              </li>
            )
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={logout}
          className="sidebar-logout"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}