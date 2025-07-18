import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCourses, insertCourse, updateCourse, deleteCourse} from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import './CourseManagement.css';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState({ maMonHoc: '', tenMonHoc: '' });
  const [newCourse, setNewCourse] = useState({ maMonHoc: '', tenMonHoc: '', tinChi: '' });
  const [editCourse, setEditCourse] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, pagination.limit]);

  const fetchCourses = async (params = {}) => {
    try {
      const response = await getCourses({ ...params, page: pagination.page, limit: pagination.limit });
      setCourses(response.data.courses);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch {
      toast.error('Không thể tải danh sách môn học');
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!Number.isInteger(Number(newCourse.tinChi)) || Number(newCourse.tinChi) <= 0) {
      toast.error('Tín chỉ phải là số nguyên dương');
      return;
    }
    try {
      await insertCourse(newCourse);
      toast.success('Thêm môn học thành công');
      setShowAddModal(false);
      setNewCourse({ maMonHoc: '', tenMonHoc: '', tinChi: '' });
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm môn học thất bại');
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    if (!Number.isInteger(Number(editCourse.tinChi)) || Number(editCourse.tinChi) <= 0) {
      toast.error('Tín chỉ phải là số nguyên dương');
      return;
    }
    try {
      await updateCourse(editCourse);
      toast.success('Cập nhật môn học thành công');
      setShowEditModal(false);
      setEditCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật môn học thất bại');
    }
  };

  const handleDelete = async (maMonHoc) => {
    if (window.confirm('Bạn có chắc muốn xóa môn học này?')) {
      try {
        await deleteCourse({ maMonHoc });
        toast.success('Xóa môn học thành công');
        fetchCourses();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Xóa môn học thất bại');
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
    <div className="course-container">
      <h1 className="course-title">Quản Lý Môn Học</h1>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => setShowAddModal(true)} className="btn btn-indigo">
          <Plus size={20} /> Thêm môn học
        </button>
        <button onClick={() => setShowSearchModal(true)} className="btn btn-gray">
          <Search size={20} /> Tìm kiếm
        </button>
        
      </div>

      {/* Courses Table */}
      <div className="table-container">
        <table className="course-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã Môn Học</th>
              <th>Tên Môn Học</th>
              <th>Tín Chỉ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">Không có môn học nào</td>
              </tr>
            ) : (
              courses.map((course, index) => (
                <tr key={course.maMonHoc}>
                  <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                  <td>{course.maMonHoc}</td>
                  <td>{course.tenMonHoc}</td>
                  <td>{course.tinChi}</td>
                  <td className="table-actions">
                    <button onClick={() => { setEditCourse(course); setShowEditModal(true); }} className="text-indigo-500 hover:text-indigo-700">
                      <Edit size={18} color='blue' />
                    </button>
                    <button onClick={() => handleDelete(course.maMonHoc)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} color='red'/>
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
        <div className="limit-selector">
          <span>Hiển thị:</span>
          <select value={pagination.limit} onChange={handleLimitChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>bản ghi/trang</span>
        </div>
        <div className="pagination-controls">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
            Previous
          </button>
          <span>Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}</span>
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}>
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && renderModal('Thêm Môn Học', newCourse, setNewCourse, handleAddCourse, setShowAddModal)}
      {showEditModal && editCourse && renderModal('Sửa Môn Học', editCourse, setEditCourse, handleEditCourse, setShowEditModal, true)}
      {showSearchModal && renderSearchModal()}
    </div>
  );

  function renderModal(title, data, setData, handleSubmit, setShowModal, isEdit = false) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{title}</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Mã Môn Học</label>
              <input type="text" value={data.maMonHoc} onChange={(e) => setData({ ...data, maMonHoc: e.target.value.toUpperCase() })} disabled={isEdit} required />
            </div>
            <div>
              <label>Tên Môn Học</label>
              <input type="text" value={data.tenMonHoc} onChange={(e) => setData({ ...data, tenMonHoc: e.target.value })} required />
            </div>
            <div>
              <label>Tín Chỉ</label>
              <input type="number" min="1" value={data.tinChi} onChange={(e) => setData({ ...data, tinChi: e.target.value })} required />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-indigo">Lưu</button>
              <button type="button" className="btn btn-red" onClick={() => setShowModal(false)}>Hủy</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderSearchModal() {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Tìm Kiếm Môn Học</h2>
          <div>
            <label>Mã Môn Học</label>
            <input type="text" value={search.maMonHoc} onChange={(e) => setSearch({ ...search, maMonHoc: e.target.value })} />
          </div>
          <div>
            <label>Tên Môn Học</label>
            <input type="text" value={search.tenMonHoc} onChange={(e) => setSearch({ ...search, tenMonHoc: e.target.value })} />
          </div>
          <div className="modal-actions">
            <button onClick={() => { fetchCourses(search); setShowSearchModal(false); }} className="btn btn-indigo">Tìm kiếm</button>
            <button onClick={() => setShowSearchModal(false)} className="btn btn-red">Hủy</button>
          </div>
        </div>
      </div>
    );
  }
}
