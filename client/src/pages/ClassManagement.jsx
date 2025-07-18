import './ClassManagement.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClasses, insertClass, updateClass, deleteClass } from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState({ maLop: '', tenLop: '' });
  const [newClass, setNewClass] = useState({ maLop: '', tenLop: '' });
  const [editClass, setEditClass] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchClasses();
  }, [pagination.page, pagination.limit]);

  const fetchClasses = async () => {
    try {
      const params = { ...search, page: pagination.page, limit: pagination.limit };
      const response = await getClasses(params);
      setClasses(response.data.classes);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch {
      toast.error('Không thể tải danh sách lớp học');
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await insertClass({ ...newClass, tenLop: newClass.tenLop.toUpperCase() });
      toast.success('Thêm lớp học thành công');
      setShowAddModal(false);
      setNewClass({ maLop: '', tenLop: '' });
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm lớp học thất bại');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      await updateClass({ ...editClass, tenLop: editClass.tenLop.toUpperCase() });
      toast.success('Cập nhật lớp học thành công');
      setShowEditModal(false);
      setEditClass(null);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật lớp học thất bại');
    }
  };

  const handleDelete = async (maLop) => {
    if (window.confirm('Bạn có chắc muốn xóa lớp học này?')) {
      try {
        await deleteClass({ maLop });
        toast.success('Xóa lớp học thành công');
        fetchClasses();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Xóa lớp học thất bại');
      }
    }
  };


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pagination.total / pagination.limit)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  return (
    <div className="class-management-container">
      <h1 className="title">Quản Lý Lớp Học</h1>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => setShowAddModal(true)} className="btn btn-add">
          <Plus size={20} /> Thêm lớp học
        </button>
        <button onClick={() => setShowSearchModal(true)} className="btn btn-search">
          <Search size={20} /> Tìm kiếm
        </button>
      </div>

      {/* Classes Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã Lớp</th>
              <th>Tên Lớp</th>
              <th>Số Sinh Viên</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">Không có lớp học nào</td>
              </tr>
            ) : (
              classes.map((cls, index) => (
                <tr key={cls.maLop}>
                  <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                  <td>{cls.maLop}</td>
                  <td>{cls.tenLop}</td>
                  <td>{cls.soSinhVien}</td>
                  <td className="actions">
                    {/* <Link to={`/classes/${cls.maLop}`} className="btn-link">Chi tiết</Link> */}
                    <button onClick={() => { setEditClass(cls); setShowEditModal(true); }} className="btn-icon">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(cls.maLop)} className="btn-icon delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-control">
          <span>Hiển thị:</span>
          <select value={pagination.limit} onChange={handleLimitChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>bản ghi/trang</span>
        </div>
        <div className="pagination-buttons">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>Previous</button>
          <span>Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}</span>
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}>Next</button>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && renderAddModal()}
      {showEditModal && editClass && renderEditModal()}
      {showSearchModal && renderSearchModal()}
    </div>
  );

  function renderAddModal() {
    return (
      <div className="student-management-modal-overlay">
        <div className="student-management-modal">
          <h2 className="student-management-modal-title">Thêm Lớp Học</h2>
          <form onSubmit={handleAddClass} className="student-management-form">
            <div className="student-management-form-group">
              <label className="student-management-form-label">Mã lớp</label>
              <input type="text" value={newClass.maLop} onChange={(e) => setNewClass({ ...newClass, maLop: e.target.value.toUpperCase() })} placeholder="Nhập mã lớp" required className="student-management-form-input" />
            </div>
            <div className="student-management-form-group">
              <label className="student-management-form-label">Tên lớp</label>
              <input type="text" value={newClass.tenLop} onChange={(e) => setNewClass({ ...newClass, tenLop: e.target.value })} placeholder="Nhập tên lớp" required className="student-management-form-input" />
            </div>
            <div className="student-management-form-actions">
              <button type="submit" className="student-management-submit-button">Lưu</button>
              <button type="button" onClick={() => setShowAddModal(false)} className="student-management-cancel-button">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderEditModal() {
    return (
      <div className="student-management-modal-overlay">
        <div className="student-management-modal">
          <h2 className="student-management-modal-title">Sửa Lớp Học</h2>
          <form onSubmit={handleEditClass} className="student-management-form">
            <div className="student-management-form-group">
              <label className="student-management-form-label">Mã lớp</label>
              <input type="text" value={editClass.maLop} disabled className="student-management-form-input-disabled" />
            </div>
            <div className="student-management-form-group">
              <label className="student-management-form-label">Tên lớp</label>
              <input type="text" value={editClass.tenLop} onChange={(e) => setEditClass({ ...editClass, tenLop: e.target.value })} placeholder="Nhập tên lớp" required className="student-management-form-input" />
            </div>
            <div className="student-management-form-actions">
              <button type="submit" className="student-management-submit-button">Lưu</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="student-management-cancel-button">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderSearchModal() {
    return (
      <div className="student-management-modal-overlay">
        <div className="student-management-modal">
          <h2 className="student-management-modal-title">Tìm Kiếm Lớp Học</h2>
          <div className="student-management-form">
            <div className="student-management-form-group">
              <label className="student-management-form-label">Mã lớp</label>
              <input type="text" value={search.maLop} onChange={(e) => setSearch({ ...search, maLop: e.target.value })} placeholder="Nhập mã lớp" className="student-management-form-input" />
            </div>
            <div className="student-management-form-group">
              <label className="student-management-form-label">Tên lớp</label>
              <input type="text" value={search.tenLop} onChange={(e) => setSearch({ ...search, tenLop: e.target.value })} placeholder="Nhập tên lớp" className="student-management-form-input" />
            </div>
            <div className="student-management-form-actions">
              <button onClick={() => { setPagination(prev => ({ ...prev, page: 1 })); fetchClasses(); setShowSearchModal(false); }} className="student-management-submit-button">Tìm kiếm</button>
              <button onClick={() => setShowSearchModal(false)} className="student-management-cancel-button">Hủy</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
