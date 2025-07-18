import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClasses, getStudents, updateStudent, deleteStudent } from '../services/api';
import { Edit, Trash2 } from 'lucide-react';
import './ClassDetail.css';

export default function ClassDetail() {
  const { maLop } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [editStudent, setEditStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const editImageInputRef = useRef(null);
  const [classes, setClasses] = useState([]);
  const khoaList = ['CNTT', 'Kinh tế', 'Cơ khí', 'Điện tử', 'Xây dựng', 'Hóa học', 'Sinh học', 'Luật', 'Ngoại ngữ', 'Y dược'];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await getClasses({});
        setClasses(response.data.classes);
      } catch (error) {
        toast.error(`Không thể tải danh sách lớp: ${error.response?.data?.message || error.message}`);
      }
    };
    fetchClasses();
    fetchClass();
  }, [maLop]);

  const fetchClass = async () => {
    try {
      const response = await getClasses({ maLop });
      if (response.data.classes.length > 0) {
        const cls = response.data.classes[0];
        setClassData(cls);
        fetchStudents(cls.tenLop);
      } else {
        toast.error('Không tìm thấy lớp học');
        navigate('/classes');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin lớp học');
      navigate('/classes');
    }
  };

  const fetchStudents = async (tenLop) => {
    try {
      const response = await getStudents({ lop: tenLop });
      setStudents(response.data.students);
    } catch (error) {
      toast.error(`Không thể tải danh sách sinh viên: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    const khoaHocNum = Number(editStudent.khoaHoc);
    if (isNaN(khoaHocNum) || !Number.isInteger(khoaHocNum) || khoaHocNum < 2000 || khoaHocNum > 2100) {
      toast.error('Khóa học phải là số nguyên từ 2000 đến 2100');
      return;
    }
    if (editStudent.image && !['image/jpeg', 'image/png'].includes(editStudent.image.type)) {
      toast.error('Vui lòng chọn file ảnh JPG hoặc PNG');
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
      if (editImageInputRef.current) editImageInputRef.current.value = '';
      fetchStudents(classData.tenLop);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật sinh viên thất bại');
    }
  };

  const handleDelete = async (maSV) => {
    if (window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
      try {
        await deleteStudent({ maSV });
        toast.success('Xóa sinh viên thành công');
        fetchStudents(classData.tenLop);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xóa sinh viên thất bại');
      }
    }
  };

  if (!classData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="class-detail-container">
      <h1 className="class-title">Chi Tiết Lớp Học</h1>
      <div className="class-card">
        <div className="class-info">
          <div><span className="label">Mã Lớp:</span> {classData.maLop}</div>
          <div><span className="label">Tên Lớp:</span> {classData.tenLop}</div>
          <div><span className="label">Số Sinh Viên:</span> {classData.soSinhVien}</div>
        </div>
        <div className="button-group">
          <button onClick={() => navigate('/classes', { state: { editClass: classData } })} className="btn edit-btn">Chỉnh sửa</button>
          <button onClick={() => navigate('/classes')} className="btn back-btn">Quay lại</button>
        </div>
      </div>

      <h2 className="student-list-title">Danh Sách Sinh Viên</h2>
      <div className="student-table-container">
        <table className="student-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã SV</th>
              <th>Tên SV</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-message">Không có sinh viên nào trong lớp này</td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={student.maSV}>
                  <td>{index + 1}</td>
                  <td>{student.maSV}</td>
                  <td>{student.tenSV}</td>
                  <td className="action-buttons">
                    <Link to={`/students/${student.maSV}`} className="action-link">Chi tiết</Link>
                    <button onClick={() => { setEditStudent({ ...student, image: null }); setShowEditModal(true); }} className="action-button"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(student.maSV)} className="action-button delete-button"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && editStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Sửa Sinh Viên</h2>
            <form onSubmit={handleEditStudent} className="modal-form">
              <div className="form-group">
                <label>Mã SV</label>
                <input type="text" value={editStudent.maSV} disabled />
              </div>
              <div className="form-group">
                <label>Tên SV</label>
                <input type="text" value={editStudent.tenSV} onChange={(e) => setEditStudent({ ...editStudent, tenSV: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Lớp</label>
                <select value={editStudent.lop} onChange={(e) => setEditStudent({ ...editStudent, lop: e.target.value })} required>
                  <option value="">Chọn lớp</option>
                  {classes.map(cls => (
                    <option key={cls.maLop} value={cls.tenLop}>{cls.tenLop}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Khoa</label>
                <select value={editStudent.khoa} onChange={(e) => setEditStudent({ ...editStudent, khoa: e.target.value })} required>
                  <option value="">Chọn khoa</option>
                  {khoaList.map(khoa => (
                    <option key={khoa} value={khoa}>{khoa}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Khóa học</label>
                <input type="number" value={editStudent.khoaHoc} onChange={(e) => setEditStudent({ ...editStudent, khoaHoc: e.target.value })} min="2000" max="2100" required />
              </div>
              <div className="form-group">
                <label>Ảnh mới (JPG/PNG)</label>
                <input type="file" accept="image/jpeg,image/png" ref={editImageInputRef} onChange={(e) => setEditStudent({ ...editStudent, image: e.target.files[0] })} />
              </div>
              <div className="button-group">
                <button type="submit" className="btn save-btn">Lưu</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn cancel-btn">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
