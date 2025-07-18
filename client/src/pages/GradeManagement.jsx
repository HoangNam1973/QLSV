import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getGrades, insertGrade, updateGrade, deleteGrade, loadDataLop, getCourses, getStudents } from '../services/api';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import Modal from 'react-modal';
import './GradeManagement.css';

Modal.setAppElement('#root');

export default function GradeManagement() {
  const [grades, setGrades] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [newGrade, setNewGrade] = useState({ maSV: '', maLop: '', maMonHoc: '', semester: '', diemA: '', diemB: '', diemC: '', tenSV: '', tenLop: '' });
  const [editGrade, setEditGrade] = useState(null);
  const [initialEditGrade, setInitialEditGrade] = useState(null);
  const [search, setSearch] = useState({ maSV: '', tenSV: '', maLop: '', maMonHoc: '', semester: '' });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isValidMaSV, setIsValidMaSV] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchGrades();
  }, [pagination.page, pagination.limit]);

  const fetchClasses = async () => {
    try {
      const response = await loadDataLop();
      setClasses(response.data);
    } catch {
      toast.error('Không thể tải danh sách lớp');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await getCourses({ limit: 1000 });
      setSubjects(response.data.courses);
    } catch {
      toast.error('Không thể tải danh sách môn học');
    }
  };

  const fetchGrades = async (params = {}) => {
    try {
      const searchParams = {
        maSV: params.maSV?.trim() || search.maSV,
        tenSV: params.tenSV?.trim() || search.tenSV,
        maLop: params.maLop || search.maLop,
        maMonHoc: params.maMonHoc || search.maMonHoc,
        semester: params.semester || search.semester,
        page: pagination.page,
        limit: pagination.limit,
      };
      const response = await getGrades(searchParams);
      setGrades(response.data.grades);
      setPagination(prev => ({ ...prev, total: response.data.total }));
    } catch {
      toast.error('Không thể tải danh sách điểm');
    }
  };

  const validateStudent = async (maSV) => {
    try {
      const response = await getStudents({ maSV, limit: 1 });
      if (response.data.students.length === 0) {
        setIsValidMaSV(false);
        toast.error('Mã sinh viên không tồn tại');
        return null;
      }
      const student = response.data.students[0];
      const classResponse = await loadDataLop();
      const classData = classResponse.data.find(cls => cls.tenLop === student.lop);
      if (!classData) {
        setIsValidMaSV(false);
        toast.error('Lớp của sinh viên không tìm thấy');
        return null;
      }
      setIsValidMaSV(true);
      setNewGrade(prev => ({ ...prev, maLop: classData.maLop, tenSV: student.tenSV, tenLop: classData.tenLop }));
      return student;
    } catch {
      setIsValidMaSV(false);
      toast.error('Lỗi khi kiểm tra mã sinh viên');
      return null;
    }
  };

  const validateGradeInput = (value) => {
    if (value === '') return true;
    const num = Number(value.replace(',', '.'));
    return !isNaN(num) && num >= 0 && num <= 10;
  };

  const handleAdd = async () => {
    try {
      if (!isValidMaSV) throw new Error('Mã sinh viên không hợp lệ');
      if (!newGrade.maSV || !newGrade.maLop || !newGrade.maMonHoc || !newGrade.semester) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }
      if (!validateGradeInput(newGrade.diemA) || !validateGradeInput(newGrade.diemB) || !validateGradeInput(newGrade.diemC)) {
        throw new Error('Điểm phải từ 0 đến 10');
      }

      const formattedGrade = {
        maSV: newGrade.maSV,
        maLop: newGrade.maLop,
        maMonHoc: newGrade.maMonHoc,
        semester: newGrade.semester,
        diemA: newGrade.diemA ? Number(newGrade.diemA.replace(',', '.')) : null,
        diemB: newGrade.diemB ? Number(newGrade.diemB.replace(',', '.')) : null,
        diemC: newGrade.diemC ? Number(newGrade.diemC.replace(',', '.')) : null,
      };
      await insertGrade(formattedGrade);
      setNewGrade({ maSV: '', maLop: '', maMonHoc: '', semester: '', diemA: '', diemB: '', diemC: '', tenSV: '', tenLop: '' });
      setIsValidMaSV(true);
      setShowAddModal(false);
      fetchGrades();
      toast.success('Thêm điểm thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Không thể thêm điểm');
    }
  };

  const handleReset = () => {
    setNewGrade({ maSV: '', maLop: '', maMonHoc: '', semester: '', diemA: '', diemB: '', diemC: '', tenSV: '', tenLop: '' });
    setIsValidMaSV(true);
  };

  const handleEdit = async () => {
    try {
      const updatedFields = {};
      ['diemA', 'diemB', 'diemC'].forEach(field => {
        if (editGrade[field] !== initialEditGrade[field]) {
          updatedFields[field] = editGrade[field] ? Number(editGrade[field].replace(',', '.')) : null;
        }
      });
      if (Object.keys(updatedFields).length === 0) {
        setShowEditModal(false);
        return;
      }
      if ([updatedFields.diemA, updatedFields.diemB, updatedFields.diemC].some(d => d != null && (isNaN(d) || d < 0 || d > 10))) {
        throw new Error('Điểm phải nằm trong khoảng từ 0 đến 10');
      }
      await updateGrade([{ id: editGrade.id, ...updatedFields }]);
      setShowEditModal(false);
      fetchGrades();
      toast.success('Cập nhật điểm thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật điểm');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteGrade({ id });
      fetchGrades();
      toast.success('Xóa điểm thành công');
    } catch {
      toast.error('Không thể xóa điểm');
    }
  };

  return (
    <div className="grade-management-container">
      <h1 className="grade-management-title">Quản Lý Điểm</h1>
      <div className="grade-management-content">
        <div className="grade-management-actions">
          <button onClick={() => setShowAddModal(true)} className="grade-management-add-button">
            <Plus size={18} /> Thêm
          </button>
          <div className="grade-management-action-group">
            <button onClick={() => setShowSearchModal(true)} className="grade-management-search-button">
              <Search size={18} /> Tìm kiếm
            </button>
          </div>
        </div>
        <div className="grade-management-table-container">
          <table className="grade-management-table">
            <thead>
              <tr className="grade-management-table-header">
                <th className="grade-management-table-cell">STT</th>
                <th className="grade-management-table-cell">Mã SV</th>
                <th className="grade-management-table-cell">Tên SV</th>
                <th className="grade-management-table-cell">Lớp</th>
                <th className="grade-management-table-cell">Môn học</th>
                <th className="grade-management-table-cell">Học kỳ</th>
                <th className="grade-management-table-cell">Điểm A</th>
                <th className="grade-management-table-cell">Điểm B</th>
                <th className="grade-management-table-cell">Điểm C</th>
                <th className="grade-management-table-cell">Điểm TB</th>
                <th className="grade-management-table-cell">Xếp Loại</th>
                <th className="grade-management-table-cell">Xếp Loại Bằng Lời</th>
                <th className="grade-management-table-cell">Điểm Hệ 4</th>
                <th className="grade-management-table-cell">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan="14" className="grade-management-empty-cell">
                    Không có điểm nào
                  </td>
                </tr>
              ) : (
                grades.map((grade, index) => (
                  <tr key={grade.id} className="grade-management-table-row">
                    <td className="grade-management-table-cell">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="grade-management-table-cell">{grade.maSV}</td>
                    <td className="grade-management-table-cell">{grade.tenSV}</td>
                    <td className="grade-management-table-cell">{grade.tenLop}</td>
                    <td className="grade-management-table-cell">{grade.tenMonHoc}</td>
                    <td className="grade-management-table-cell">{grade.semester}</td>
                    <td className="grade-management-table-cell">{grade.diemA}</td>
                    <td className="grade-management-table-cell">{grade.diemB}</td>
                    <td className="grade-management-table-cell">{grade.diemC}</td>
                    <td className="grade-management-table-cell">{grade.finalGrade}</td>
                    <td className="grade-management-table-cell">{grade.letterGrade}</td>
                    <td className="grade-management-table-cell">{grade.verbalGrade}</td>
                    <td className="grade-management-table-cell">{grade.gradePoint}</td>
                    <td className="grade-management-table-cell grade-management-actions-cell">
                      <button
                        onClick={() => {
                          setEditGrade({ ...grade });
                          setInitialEditGrade({ ...grade });
                          setShowEditModal(true);
                        }}
                        className="grade-management-edit-button"
                      >
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(grade.id)} className="grade-management-delete-button">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="grade-management-pagination">
          <div className="grade-management-pagination-controls">
            <span className="grade-management-pagination-label">Hiển thị:</span>
            <select
              value={pagination.limit}
              onChange={e => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="grade-management-pagination-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="grade-management-pagination-label">bản ghi/trang</span>
          </div>
          <div className="grade-management-pagination-buttons">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="grade-management-pagination-button"
            >
              Previous
            </button>
            <span className="grade-management-pagination-info">
              Trang {pagination.page} / {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
              className="grade-management-pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        className="grade-management-modal"
        overlayClassName="grade-management-modal-overlay"
      >
        <h2 className="grade-management-modal-title">Thêm Điểm</h2>
        <div className="grade-management-form">
          <div className="grade-management-form-row">
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Mã SV <span className="grade-management-required">*</span></label>
              <input
                type="text"
                value={newGrade.maSV}
                onChange={e => setNewGrade({ ...newGrade, maSV: e.target.value.toUpperCase() })}
                onBlur={() => newGrade.maSV && validateStudent(newGrade.maSV)}
                className={`grade-management-form-input ${isValidMaSV ? '' : 'grade-management-form-input-error'}`}
                required
              />
              {!isValidMaSV && <p className="grade-management-error-text">Mã sinh viên không hợp lệ</p>}
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Tên SV</label>
              <input
                type="text"
                value={newGrade.tenSV}
                disabled
                className="grade-management-form-input-disabled"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Lớp <span className="grade-management-required">*</span></label>
              <input
                type="text"
                value={newGrade.tenLop}
                disabled
                className="grade-management-form-input-disabled"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Môn học <span className="grade-management-required">*</span></label>
              <select
                value={newGrade.maMonHoc}
                onChange={e => setNewGrade({ ...newGrade, maMonHoc: e.target.value })}
                className="grade-management-form-input"
                required
              >
                <option value="">Chọn môn học</option>
                {subjects.map(subject => (
                  <option key={subject.maMonHoc} value={subject.maMonHoc}>{subject.tenMonHoc}</option>
                ))}
              </select>
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Học kỳ <span className="grade-management-required">*</span></label>
              <select
                value={newGrade.semester}
                onChange={e => setNewGrade({ ...newGrade, semester: e.target.value })}
                className="grade-management-form-input"
                required
              >
                <option value="">Chọn học kỳ</option>
                {Array.from({ length: 5 }, (_, i) => 2021 + i).flatMap(year =>
                  ['HK1', 'HK2', 'HK3'].map(sem => (
                    <option key={`${sem}-${year}`} value={`${sem}-${year}`}>{`${sem} ${year}`}</option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="grade-management-form-row">
            <div className="grade-management-form-group">
              <label className="grade-management-form-label" title="Điểm chuyên cần (60%)">Điểm A</label>
              <input
                type="text"
                value={newGrade.diemA}
                onChange={e => setNewGrade({ ...newGrade, diemA: e.target.value })}
                className={`grade-management-form-input ${validateGradeInput(newGrade.diemA) ? '' : 'grade-management-form-input-error'}`}
                placeholder="Nhập điểm (ví dụ: 8.5 hoặc 8,5)"
              />
              {!validateGradeInput(newGrade.diemA) && <p className="grade-management-error-text">Điểm từ 0-10</p>}
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label" title="Điểm giữa kỳ (30%)">Điểm B</label>
              <input
                type="text"
                value={newGrade.diemB}
                onChange={e => setNewGrade({ ...newGrade, diemB: e.target.value })}
                className={`grade-management-form-input ${validateGradeInput(newGrade.diemB) ? '' : 'grade-management-form-input-error'}`}
                placeholder="Nhập điểm (ví dụ: 8.5 hoặc 8,5)"
              />
              {!validateGradeInput(newGrade.diemB) && <p className="grade-management-error-text">Điểm từ 0-10</p>}
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label" title="Điểm cuối kỳ (10%)">Điểm C</label>
              <input
                type="text"
                value={newGrade.diemC}
                onChange={e => setNewGrade({ ...newGrade, diemC: e.target.value })}
                className={`grade-management-form-input ${validateGradeInput(newGrade.diemC) ? '' : 'grade-management-form-input-error'}`}
                placeholder="Nhập điểm (ví dụ: 8.5 hoặc 8,5)"
              />
              {!validateGradeInput(newGrade.diemC) && <p className="grade-management-error-text">Điểm từ 0-10</p>}
            </div>
          </div>
        </div>
        <div className="grade-management-form-actions">
          <button
            onClick={handleAdd}
            className="grade-management-submit-button"
            disabled={!isValidMaSV}
          >
            Thêm
          </button>
          <button
            onClick={handleReset}
            className="grade-management-reset-button"
          >
            Reset
          </button>
          <button
            onClick={() => setShowAddModal(false)}
            className="grade-management-cancel-button"
          >
            Hủy
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
        className="grade-management-modal"
        overlayClassName="grade-management-modal-overlay"
      >
        <h2 className="grade-management-modal-title">Sửa Điểm</h2>
        <div className="grade-management-form">
          <div className="grade-management-form-row">
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Mã SV</label>
              <input
                type="text"
                value={editGrade?.maSV || ''}
                disabled
                className="grade-management-form-input-disabled"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Lớp</label>
              <input
                type="text"
                value={editGrade?.tenLop || ''}
                disabled
                className="grade-management-form-input-disabled"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Môn học</label>
              <select
                value={editGrade?.maMonHoc || ''}
                disabled
                className="grade-management-form-input-disabled"
              >
                <option value={editGrade?.maMonHoc}>{editGrade?.tenMonHoc}</option>
              </select>
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Học kỳ</label>
              <select
                value={editGrade?.semester || ''}
                disabled
                className="grade-management-form-input-disabled"
              >
                <option value={editGrade?.semester}>{editGrade?.semester}</option>
              </select>
            </div>
          </div>
          <div className="grade-management-form-row">
            <div className="grade-management-form-group">
              <label className="grade-management-form-label" title="Điểm chuyên cần (60%)">Điểm A</label>
              <input
                type="text"
                value={editGrade?.diemA || ''}
                onChange={e => setEditGrade({ ...editGrade, diemA: e.target.value })}
                className="grade-management-form-input"
                placeholder="Nhập điểm (ví dụ: 8.5 hoặc 8,5)"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label" title="Điểm giữa kỳ (30%)">Điểm B</label>
              <input
                type="text"
                value={editGrade?.diemB || ''}
                onChange={e => setEditGrade({ ...editGrade, diemB: e.target.value })}
                className="grade-management-form-input"
                placeholder="Nhập điểm (ví dụ: 8.5 hoặc 8,5)"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label" title="Điểm cuối kỳ (10%)">Điểm C</label>
              <input
                type="text"
                value={editGrade?.diemC || ''}
                onChange={e => setEditGrade({ ...editGrade, diemC: e.target.value })}
                className="grade-management-form-input"
                placeholder="Nhập điểm (ví dụ: 8.5 hoặc 8,5)"
              />
            </div>
          </div>
          <div className="grade-management-form-row">
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Xếp Loại Bằng Lời</label>
              <input
                type="text"
                value={editGrade?.verbalGrade || ''}
                disabled
                className="grade-management-form-input-disabled"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Điểm Hệ 4</label>
              <input
                type="number"
                value={editGrade?.gradePoint || ''}
                disabled
                className="grade-management-form-input-disabled"
              />
            </div>
          </div>
        </div>
        <div className="grade-management-form-actions">
          <button
            onClick={handleEdit}
            className="grade-management-submit-button"
          >
            Cập nhật
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="grade-management-cancel-button"
          >
            Hủy
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showSearchModal}
        onRequestClose={() => setShowSearchModal(false)}
        className="grade-management-modal"
        overlayClassName="grade-management-modal-overlay"
      >
        <h2 className="grade-management-modal-title">Tìm Kiếm Điểm</h2>
        <div className="grade-management-form">
          <div className="grade-management-form-row">
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Mã SV</label>
              <input
                type="text"
                value={search.maSV}
                onChange={e => setSearch({ ...search, maSV: e.target.value })}
                className="grade-management-form-input"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Tên SV</label>
              <input
                type="text"
                value={search.tenSV}
                onChange={e => setSearch({ ...search, tenSV: e.target.value })}
                className="grade-management-form-input"
              />
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Lớp</label>
              <select
                value={search.maLop}
                onChange={e => setSearch({ ...search, maLop: e.target.value })}
                className="grade-management-form-input"
              >
                <option value="">Tất cả lớp</option>
                {classes.map(cls => (
                  <option key={cls.maLop} value={cls.maLop}>{cls.tenLop}</option>
                ))}
              </select>
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Môn học</label>
              <select
                value={search.maMonHoc}
                onChange={e => setSearch({ ...search, maMonHoc: e.target.value })}
                className="grade-management-form-input"
              >
                <option value="">Tất cả môn học</option>
                {subjects.map(subject => (
                  <option key={subject.maMonHoc} value={subject.maMonHoc}>{subject.tenMonHoc}</option>
                ))}
              </select>
            </div>
            <div className="grade-management-form-group">
              <label className="grade-management-form-label">Học kỳ</label>
              <select
                value={search.semester}
                onChange={e => setSearch({ ...search, semester: e.target.value })}
                className="grade-management-form-input"
              >
                <option value="">Tất cả học kỳ</option>
                {Array.from({ length: 5 }, (_, i) => 2021 + i).flatMap(year =>
                  ['HK1', 'HK2', 'HK3'].map(sem => (
                    <option key={`${sem}-${year}`} value={`${sem}-${year}`}>{`${sem} ${year}`}</option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
        <div className="grade-management-form-actions">
          <button
            onClick={() => {
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchGrades();
              setShowSearchModal(false);
            }}
            className="grade-management-submit-button"
          >
            Tìm kiếm
          </button>
          <button
            onClick={() => setShowSearchModal(false)}
            className="grade-management-cancel-button"
          >
            Hủy
          </button>
        </div>
      </Modal>
    </div>
  );
}