import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getStudents, insertStudent, updateStudent, deleteStudent } from '../services/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import './StudentManagement.css';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState({ maSV: '', tenSV: '', lop: '', khoa: [], khoaHoc: '' });
  const [newStudent, setNewStudent] = useState({ maSV: '', tenSV: '', lop: '', khoa: '', khoaHoc: '', image: null });
  const [editStudent, setEditStudent] = useState(null);
  const [initialEditStudent, setInitialEditStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [classes, setClasses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const addImageInputRef = useRef(null);
  const editImageInputRef = useRef(null);
  
  const khoaList = ['CNTT', 'Kinh tế', 'Cơ khí', 'Điện tử', 'Xây dựng', 'Hóa học', 'Sinh học', 'Luật', 'Ngoại ngữ', 'Y dược'];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.post('/api/classes/loaddatalop', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Đảm bảo setClasses đúng kiểu dữ liệu trả về
        // Nếu response.data là mảng:
        setClasses(Array.isArray(response.data) ? response.data : (response.data.classes || []));
      } catch (error) {
        toast.error(`Không thể tải danh sách lớp: ${error.response?.data?.message || error.message}`);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
    const editMaSV = searchParams.get('edit');
    if (editMaSV) {
      fetchStudentForEdit(editMaSV);
      setSearchParams({});
    }
  }, [pagination.page, pagination.limit, searchParams]);

  const fetchStudents = async (params = {}) => {
    try {
      const searchParams = { ...params, page: pagination.page, limit: pagination.limit };
      if (searchParams.khoa && Array.isArray(searchParams.khoa) && searchParams.khoa.length > 0) {
        searchParams.khoa = JSON.stringify(searchParams.khoa);
      }
      const response = await getStudents(searchParams);
      setStudents(response.data.students);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch (error) {
      toast.error(`Không thể tải danh sách sinh viên: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchStudentForEdit = async (maSV) => {
    try {
      const response = await getStudents({ maSV });
      if (response.data.students.length > 0) {
        const studentData = { ...response.data.students[0], image: null };
        setEditStudent(studentData);
        setInitialEditStudent(studentData);
        setShowEditModal(true);
      } else {
        toast.error('Không tìm thấy sinh viên để sửa');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin sinh viên');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const khoaHocNum = Number(newStudent.khoaHoc);
    if (isNaN(khoaHocNum) || !Number.isInteger(khoaHocNum) || khoaHocNum < 2000 || khoaHocNum > 2100) {
      toast.error('Khóa học phải là số nguyên từ 2000 đến 2100');
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(newStudent).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });
      await insertStudent(formData);
      toast.success('Thêm sinh viên thành công');
      setShowAddModal(false);
      setNewStudent({ maSV: '', tenSV: '', lop: '', khoa: '', khoaHoc: '', image: null });
      if (addImageInputRef.current) addImageInputRef.current.value = '';
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thêm sinh viên thất bại');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    const khoaHocNum = Number(editStudent.khoaHoc);
    if (isNaN(khoaHocNum) || !Number.isInteger(khoaHocNum) || khoaHocNum < 2000 || khoaHocNum > 2100) {
      toast.error('Khóa học phải là số nguyên từ 2000 đến 2100');
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(editStudent).forEach(([key, value]) => {
        if (value !== null) {
          formData.append(key, value);
        }
      });
      await updateStudent(formData);
      toast.success('Cập nhật sinh viên thành công');
      setShowEditModal(false);
      setEditStudent(null);
      setInitialEditStudent(null);
      if (editImageInputRef.current) editImageInputRef.current.value = '';
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật sinh viên thất bại');
    }
  };

  const handleDelete = async (maSV) => {
    if (window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
      try {
        await deleteStudent({ maSV });
        toast.success('Xóa sinh viên thành công');
        fetchStudents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xóa sinh viên thất bại');
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

  const handleKhoaCheckboxChange = (khoa) => {
    setSearch(prev => {
      const newKhoa = prev.khoa.includes(khoa)
        ? prev.khoa.filter(k => k !== khoa)
        : [...prev.khoa, khoa];
      return { ...prev, khoa: newKhoa };
    });
  };

  const resetAddModal = () => {
    setNewStudent({ maSV: '', tenSV: '', lop: '', khoa: '', khoaHoc: '', image: null });
    if (addImageInputRef.current) addImageInputRef.current.value = '';
  };

  const resetEditModal = () => {
    if (initialEditStudent) {
      setEditStudent({ ...initialEditStudent, image: null });
      if (editImageInputRef.current) editImageInputRef.current.value = '';
    }
  };

  const resetSearchModal = () => {
    setSearch({ maSV: '', tenSV: '', lop: '', khoa: [], khoaHoc: '' });
  };

  return (
    <div className="student-management-container">
      <h1 className="student-management-title">Quản Lý Sinh Viên</h1>

      <div className="student-management-actions">
        <button onClick={() => setShowAddModal(true)} className="student-management-add-button">
          <Plus size={20} />
          Thêm sinh viên
        </button>
        <button onClick={() => setShowSearchModal(true)} className="student-management-search-button">
          <Search size={20} />
          Tìm kiếm
        </button>
      </div>

      <div className="student-management-table-container">
        <table className="student-management-table">
          <thead>
            <tr className="student-management-table-header">
              <th className="student-management-table-cell">STT</th>
              <th className="student-management-table-cell">Mã SV</th>
              <th className="student-management-table-cell">Tên SV</th>
              <th className="student-management-table-cell">Lớp</th>
              <th className="student-management-table-cell">Khoa</th>
              <th className="student-management-table-cell">Khóa</th>
              <th className="student-management-table-cell">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="student-management-empty-cell">
                  Không có sinh viên nào
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={student.maSV} className="student-management-table-row">
                  <td className="student-management-table-cell">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                  <td className="student-management-table-cell">{student.maSV}</td>
                  <td className="student-management-table-cell">{student.tenSV}</td>
                  <td className="student-management-table-cell">{student.lop}</td>
                  <td className="student-management-table-cell">{student.khoa}</td>
                  <td className="student-management-table-cell">{student.khoaHoc}</td>
                  <td className="student-management-table-cell student-management-actions-cell">
                    <button
                      onClick={() => {
                        setEditStudent({ ...student, image: null });
                        setInitialEditStudent({ ...student, image: null });
                        setShowEditModal(true);
                      }}
                      className="student-management-edit-button"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(student.maSV)} className="student-management-delete-button">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="student-management-pagination">
        <div className="student-management-pagination-controls">
          <span className="student-management-pagination-label">Hiển thị:</span>
          <select value={pagination.limit} onChange={handleLimitChange} className="student-management-pagination-select">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="student-management-pagination-label">bản ghi/trang</span>
        </div>
        <div className="student-management-pagination-buttons">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="student-management-pagination-button"
          >
            Previous
          </button>
          <span className="student-management-pagination-info">
            Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
            className="student-management-pagination-button"
          >
            Next
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="student-management-modal-overlay">
          <div className="student-management-modal">
            <h2 className="student-management-modal-title">Thêm Sinh Viên</h2>
            <form onSubmit={handleAddStudent} className="student-management-form">
              <div className="student-management-form-group">
                <label className="student-management-form-label">Mã SV</label>
                <input
                  type="text"
                  value={newStudent.maSV}
                  onChange={(e) => setNewStudent({ ...newStudent, maSV: e.target.value.toUpperCase() })}
                  className="student-management-form-input"
                  placeholder="Nhập mã SV (5-10 ký tự chữ hoa/số)"
                  required
                />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Tên SV</label>
                <input
                  type="text"
                  value={newStudent.tenSV}
                  onChange={(e) => setNewStudent({ ...newStudent, tenSV: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập tên sinh viên"
                  required
                />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Lớp</label>
                <select
                  value={newStudent.lop}
                  onChange={(e) => setNewStudent({ ...newStudent, lop: e.target.value })}
                  className="student-management-form-input"
                  required
                >
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.maLop} value={cls.tenLop.toUpperCase()}>{cls.tenLop.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Khoa</label>
                <select
                  value={newStudent.khoa}
                  onChange={(e) => setNewStudent({ ...newStudent, khoa: e.target.value })}
                  className="student-management-form-input"
                  required
                >
                  <option value="">Chọn khoa</option>
                  {khoaList.map(khoa => (
                    <option key={khoa} value={khoa}>{khoa}</option>
                  ))}
                </select>
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Khóa học</label>
                <input
                  type="number"
                  value={newStudent.khoaHoc}
                  onChange={(e) => setNewStudent({ ...newStudent, khoaHoc: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập khóa học (VD: 2022)"
                  min="2000"
                  max="2100"
                  required
                />
              </div>
              
              <div className="student-management-form-actions">
                <button type="submit" className="student-management-submit-button">
                  Lưu
                </button>
                <button type="button" onClick={resetAddModal} className="student-management-reset-button">
                  Reset
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="student-management-cancel-button">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editStudent && (
        <div className="student-management-modal-overlay">
          <div className="student-management-modal">
            <h2 className="student-management-modal-title">Sửa Sinh Viên</h2>
            <form onSubmit={handleEditStudent} className="student-management-form">
              <div className="student-management-form-group">
                <label className="student-management-form-label">Mã SV</label>
                <input
                  type="text"
                  value={editStudent.maSV}
                  disabled
                  className="student-management-form-input-disabled"
                />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Tên SV</label>
                <input
                  type="text"
                  value={editStudent.tenSV}
                  onChange={(e) => setEditStudent({ ...editStudent, tenSV: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập tên sinh viên"
                  required
                />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Lớp</label>
                <select
                  value={editStudent.lop}
                  onChange={(e) => setEditStudent({ ...editStudent, lop: e.target.value })}
                  className="student-management-form-input"
                  required
                >
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.maLop} value={cls.tenLop.toUpperCase()}>{cls.tenLop.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Khoa</label>
                <select
                  value={editStudent.khoa}
                  onChange={(e) => setEditStudent({ ...editStudent, khoa: e.target.value })}
                  className="student-management-form-input"
                  required
                >
                  <option value="">Chọn khoa</option>
                  {khoaList.map(khoa => (
                    <option key={khoa} value={khoa}>{khoa}</option>
                  ))}
                </select>
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Khóa học</label>
                <input
                  type="number"
                  value={editStudent.khoaHoc}
                  onChange={(e) => setEditStudent({ ...editStudent, khoaHoc: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập khóa học (VD: 2022)"
                  min="2000"
                  max="2100"
                  required
                />
              </div>

              <div className="student-management-form-actions">
                <button type="submit" className="student-management-submit-button">
                  Lưu
                </button>
                <button type="button" onClick={resetEditModal} className="student-management-reset-button">
                  Reset
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="student-management-cancel-button">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSearchModal && (
        <div className="student-management-modal-overlay">
          <div className="student-management-modal">
            <h2 className="student-management-modal-title">Tìm Kiếm Sinh Viên</h2>
            <div className="student-management-form">
              <div className="student-management-form-group">
                <label className="student-management-form-label">Mã SV</label>
                <input
                  type="text"
                  value={search.maSV}
                  onChange={(e) => setSearch({ ...search, maSV: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập mã SV"
                />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Tên SV</label>
                <input
                  type="text"
                  value={search.tenSV}
                  onChange={(e) => setSearch({ ...search, tenSV: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập tên SV"
                />
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Lớp</label>
                <select
                  value={search.lop}
                  onChange={(e) => setSearch({ ...search, lop: e.target.value })}
                  className="student-management-form-input"
                >
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.maLop} value={cls.tenLop}>{cls.tenLop}</option>
                  ))}
                </select>
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Khoa</label>
                <div className="student-management-khoa-checkboxes">
                  {khoaList.map(khoa => (
                    <label key={khoa} className="student-management-checkbox-label">
                      <input
                        type="checkbox"
                        checked={search.khoa.includes(khoa)}
                        onChange={() => handleKhoaCheckboxChange(khoa)}
                        className="student-management-checkbox"
                      />
                      <span className="student-management-checkbox-text">{khoa}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="student-management-form-group">
                <label className="student-management-form-label">Khóa học</label>
                <input
                  type="number"
                  value={search.khoaHoc}
                  onChange={(e) => setSearch({ ...search, khoaHoc: e.target.value })}
                  className="student-management-form-input"
                  placeholder="Nhập khóa học"
                />
              </div>
              <div className="student-management-form-actions">
                <button
                  onClick={() => {
                    fetchStudents(search);
                    setShowSearchModal(false);
                  }}
                  className="student-management-submit-button"
                >
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={resetSearchModal}
                  className="student-management-reset-button"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="student-management-cancel-button"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}