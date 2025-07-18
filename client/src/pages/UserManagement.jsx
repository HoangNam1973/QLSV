import './UserManagement.css'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getUsers, register, updateUser, deleteUser } from '../services/api'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState({ username: '', account: '' })
  const [newUser, setNewUser] = useState({ username: '', account: '', password: '', role: 'lecturer' })
  const [editUser, setEditUser] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  },)

  const fetchUsers = async (params = {}) => {
    try {
      const response = await getUsers({ ...search, ...params })
      // Đảm bảo mỗi user đều có trường id
      const usersWithId = response.data.users.map(u => ({ ...u, id: u.id || u._id }))
      setUsers(usersWithId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách người dùng')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await register(newUser)
      toast.success('Thêm người dùng thành công')
      setShowAddModal(false)
      setNewUser({ username: '', account: '', password: '', role: 'lecturer' })
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm người dùng thất bại')
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    try {
      await updateUser({ id: editUser.id, ...editUser })
      toast.success('Cập nhật người dùng thành công')
      setShowEditModal(false)
      setEditUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật người dùng thất bại')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await deleteUser({ id })
        toast.success('Xóa người dùng thành công')
        fetchUsers()
      } catch (err) {
        toast.error(err.response?.data?.message || 'Xóa người dùng thất bại')
      }
    }
  }

  const displayRole = (role) => {
    return role === 'lecturer' ? 'Giảng viên' : role === 'admin' ? 'Quản trị' : role
  }

  return (
    <div className="user-management">
      <h1 className="title">Quản Lý Người Dùng</h1>

      <div className="action-buttons">
        <button onClick={() => setShowAddModal(true)} className="add-button">
          <Plus size={20} />
          Thêm người dùng
        </button>
        <button onClick={() => setShowSearchModal(true)} className="search-button">
          <Search size={20} />
          Tìm kiếm
        </button>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Username</th>
              <th>Email/ID</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">Không có người dùng nào</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.account}</td>
                  <td>{displayRole(user.role)}</td>
                  <td className="actionsuser">
                    <button onClick={() => { setEditUser({ ...user, id: user.id || user._id }); setShowEditModal(true) }} className="edit-button">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="delete-button">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="student-management-modal-overlay">
          <div className="student-management-modal">
            <h2 className="student-management-modal-title">Thêm Người Dùng</h2>
            <form onSubmit={handleAddUser} className="student-management-form">
              <div className="student-management-form-group">
                <label className="student-management-form-label">Username</label>
                <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required className="student-management-form-input" />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Email/ID</label>
                <input type="text" placeholder="Email/ID" value={newUser.account} onChange={(e) => setNewUser({ ...newUser, account: e.target.value })} required className="student-management-form-input" />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Mật khẩu</label>
                <input type="password" placeholder="Mật khẩu" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required className="student-management-form-input" />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Vai trò</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="student-management-form-input">
                  <option value="lecturer">Giảng viên</option>
                  <option value="admin">Quản trị</option>
                </select>
              </div>
              <div className="student-management-form-actions">
                <button type="submit" className="student-management-submit-button">Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="student-management-cancel-button">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editUser && (
        <div className="student-management-modal-overlay">
          <div className="student-management-modal">
            <h2 className="student-management-modal-title">Sửa Người Dùng</h2>
            <form onSubmit={handleEditUser} className="student-management-form">
              <div className="student-management-form-group">
                <label className="student-management-form-label">Username</label>
                <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} required className="student-management-form-input" />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Email/ID</label>
                <input type="text" value={editUser.account} disabled className="student-management-form-input-disabled" />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Mật khẩu mới (nếu muốn thay đổi)</label>
                <input type="password" placeholder="Mật khẩu mới (nếu muốn thay đổi)" value={editUser.password || ''} onChange={(e) => setEditUser({ ...editUser, password: e.target.value })} className="student-management-form-input" />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Vai trò</label>
                <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="student-management-form-input">
                  <option value="lecturer">Giảng viên</option>
                  <option value="admin">Quản trị</option>
                </select>
              </div>
              <div className="student-management-form-actions">
                <button type="submit" className="student-management-submit-button">Lưu</button>
                <button type="button" onClick={() => { setShowEditModal(false); }} className="student-management-cancel-button">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSearchModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tìm Kiếm Người Dùng</h2>
            <div className="modal-form">
              <input type="text" placeholder="Username" value={search.username} onChange={(e) => setSearch({ ...search, username: e.target.value })} />
              <input type="text" placeholder="Email/ID" value={search.account} onChange={(e) => setSearch({ ...search, account: e.target.value })} />
              <div className="modal-actions">
                <button onClick={() => { fetchUsers(); setShowSearchModal(false) }} className="save-button">Tìm kiếm</button>
                <button onClick={() => setShowSearchModal(false)} className="cancel-button">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
