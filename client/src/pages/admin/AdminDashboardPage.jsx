import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

const tabs = ["overview", "messages", "students", "teachers", "parents", "classes", "admissions", "assignments", "attendance", "results", "materials", "fees", "downloads", "notifications", "gallery", "notices", "events", "content"];

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [gallery, setGallery] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [content, setContent] = useState({});
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [classRooms, setClassRooms] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [results, setResults] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  const [feeReports, setFeeReports] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploadTitle, setUploadTitle] = useState("School Moment");
  const [admissionTemplateFile, setAdmissionTemplateFile] = useState(null);
  const [contentImageFiles, setContentImageFiles] = useState({});
  const [contentImagePreviews, setContentImagePreviews] = useState({});
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("all");
  const [studentSort, setStudentSort] = useState("newest");
  const [feeSubTab, setFeeSubTab] = useState("structure");
  const [feeStudentSearch, setFeeStudentSearch] = useState("");
  const [selectedFeeStudentId, setSelectedFeeStudentId] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [feeHistoryFilters, setFeeHistoryFilters] = useState({ academicYear: "2026-27", classRoomId: "all" });
  const [feeHistoryBackup, setFeeHistoryBackup] = useState(null);
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState("active");
  const [latestCredentials, setLatestCredentials] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingAdmissionId, setEditingAdmissionId] = useState(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [editingResultId, setEditingResultId] = useState(null);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingFeeStructureId, setEditingFeeStructureId] = useState(null);
  const [editingFeePaymentId, setEditingFeePaymentId] = useState(null);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [editingDownloadIndex, setEditingDownloadIndex] = useState(null);

  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", date: "", isPinned: false });
  const [eventForm, setEventForm] = useState({ title: "", description: "", eventDate: "", location: "JMS Campus" });
  const [studentForm, setStudentForm] = useState({ name: "", email: "", password: "Portal@123", phone: "", admissionNumber: "", rollNumber: "", gender: "other", classRoomId: "", parentId: "" });
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", password: "Portal@123", phone: "", employeeId: "", department: "", qualification: "", designation: "Teacher", subjects: "" });
  const [parentForm, setParentForm] = useState({ name: "", email: "", password: "Portal@123", phone: "", occupation: "", address: "" });
  const [classForm, setClassForm] = useState({ name: "", section: "", academicYear: "2026-27", classTeacher: "", subjects: "" });
  const [admissionForm, setAdmissionForm] = useState({ studentName: "", parentName: "", email: "", phone: "", classApplyingFor: "", classRoom: "", notes: "", status: "new" });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", classRoom: "", subject: "", dueDate: "", createdBy: "" });
  const [attendanceForm, setAttendanceForm] = useState({ student: "", classRoom: "", date: "", status: "present", teacherId: "" });
  const [resultForm, setResultForm] = useState({ student: "", classRoom: "", examName: "", term: "", percentage: "", grade: "" });
  const [materialForm, setMaterialForm] = useState({ title: "", description: "", classRoom: "", subject: "", fileUrl: "", uploadedBy: "" });
  const [feeStructureForm, setFeeStructureForm] = useState({
    className: "",
    classRoom: "",
    tuitionFee: "",
    transportFee: "",
    libraryFee: "",
    examFee: "",
    otherCharges: "",
    transportEnabled: true,
    academicYear: "2026-27",
  });
  const [feePaymentForm, setFeePaymentForm] = useState({
    studentId: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMonth: new Date().toLocaleString("en-US", { month: "long" }),
    amountPaid: "",
    paymentMethod: "cash",
    receiptNumber: "",
    academicYear: "2026-27",
  });
  const [feeRevisionForm, setFeeRevisionForm] = useState({
    effectiveMonth: "",
    reason: "",
    tuitionFee: "",
    transportFee: "",
    libraryFee: "",
    examFee: "",
    otherCharges: "",
    transportEnabled: true,
  });
  const [downloadForm, setDownloadForm] = useState({ title: "", category: "", fileUrl: "" });
  const [notificationForm, setNotificationForm] = useState({ title: "", message: "", audience: ["all"] });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });

  const stats = useMemo(() => ({
    galleryCount: gallery.length,
    noticeCount: notices.length,
    eventCount: events.length,
    messageCount: messages.length,
    studentCount: summary?.students ?? students.length,
    teacherCount: summary?.teachers ?? teachers.length,
    parentCount: summary?.parents ?? parents.length,
    admissionCount: summary?.admissions ?? admissions.length,
    feeDueCount: summary?.dues ?? students.filter((student) => (student.feeSummary?.remainingBalance || 0) > 0).length,
  }), [gallery.length, notices.length, events.length, messages.length, summary, students.length, teachers.length, parents.length, admissions.length]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    const filtered = students.filter((student) => {
      const matchesQuery =
        !query ||
        student.user?.name?.toLowerCase().includes(query) ||
        student.user?.email?.toLowerCase().includes(query) ||
        student.admissionNumber?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query);

      const matchesClass =
        studentClassFilter === "all" ||
        (student.classRoom?._id || "") === studentClassFilter;

      return matchesQuery && matchesClass;
    });

    return [...filtered].sort((first, second) => {
      if (studentSort === "name") {
        return (first.user?.name || "").localeCompare(second.user?.name || "");
      }
      if (studentSort === "admission") {
        return (first.admissionNumber || "").localeCompare(second.admissionNumber || "");
      }
      return new Date(second.createdAt) - new Date(first.createdAt);
    });
  }, [students, studentSearch, studentClassFilter, studentSort]);

  const filteredAdmissions = useMemo(() => admissions.filter((admission) => {
    if (admissionStatusFilter === "all") return true;
    if (admissionStatusFilter === "active") return ["new", "reviewing"].includes(admission.status);
    return admission.status === admissionStatusFilter;
  }), [admissions, admissionStatusFilter]);

  const feeStudents = useMemo(() => {
    const query = feeStudentSearch.trim().toLowerCase();
    return students.filter((student) => {
      if (!query) return true;
      return (
        student.user?.name?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query) ||
        student.admissionNumber?.toLowerCase().includes(query)
      );
    });
  }, [students, feeStudentSearch]);

  const selectedFeeStudent = useMemo(
    () => feeStudents.find((student) => student._id === selectedFeeStudentId) || feeStudents[0] || null,
    [feeStudents, selectedFeeStudentId]
  );

  const selectedFeeStudentPayments = useMemo(
    () => feePayments.filter((payment) => (payment.studentId?._id || payment.studentId) === selectedFeeStudent?._id),
    [feePayments, selectedFeeStudent]
  );

  const feeAcademicYearOptions = useMemo(() => {
    const values = new Set(["2026-27"]);
    feeStructures.forEach((structure) => structure.academicYear && values.add(structure.academicYear));
    feePayments.forEach((payment) => payment.academicYear && values.add(payment.academicYear));
    students.forEach((student) => {
      if (student.feeSummary?.academicYear) values.add(student.feeSummary.academicYear);
      if (student.academicYear) values.add(student.academicYear);
    });
    return Array.from(values).sort((first, second) => second.localeCompare(first));
  }, [feeStructures, feePayments, students]);

  const feeHistoryFilterLabel = useMemo(() => {
    const classLabel =
      feeHistoryFilters.classRoomId === "all"
        ? "all classes"
        : classRooms.find((classRoom) => classRoom._id === feeHistoryFilters.classRoomId)
          ? `${classRooms.find((classRoom) => classRoom._id === feeHistoryFilters.classRoomId).name} - ${classRooms.find((classRoom) => classRoom._id === feeHistoryFilters.classRoomId).section}`
          : "selected class";
    return `${classLabel} / ${feeHistoryFilters.academicYear}`;
  }, [classRooms, feeHistoryFilters]);

  const getStudentLabel = (student) => {
    if (!student) return "Student";
    const name = student.user?.name || "Student";
    return student.rollNumber ? `${name} (${student.rollNumber})` : name;
  };

  const getTeacherLabel = (teacher) => {
    if (!teacher) return "Teacher";
    const name = teacher.user?.name || "Teacher";
    return teacher.employeeId ? `${name} (${teacher.employeeId})` : name;
  };

  const resetStudentForm = () => {
    setEditingStudentId(null);
    setStudentForm({ name: "", email: "", password: "Portal@123", phone: "", admissionNumber: "", rollNumber: "", gender: "other", classRoomId: "", parentId: "" });
  };

  const resetTeacherForm = () => {
    setEditingTeacherId(null);
    setTeacherForm({ name: "", email: "", password: "Portal@123", phone: "", employeeId: "", department: "", qualification: "", designation: "Teacher", subjects: "" });
  };

  const resetClassForm = () => {
    setEditingClassId(null);
    setClassForm({ name: "", section: "", academicYear: "2026-27", classTeacher: "", subjects: "" });
  };

  const resetAdmissionForm = () => {
    setEditingAdmissionId(null);
    setAdmissionForm({ studentName: "", parentName: "", email: "", phone: "", classApplyingFor: "", classRoom: "", notes: "", status: "new" });
  };

  const resetAssignmentForm = () => {
    setEditingAssignmentId(null);
    setAssignmentForm({ title: "", description: "", classRoom: "", subject: "", dueDate: "", createdBy: "" });
  };

  const resetAttendanceForm = () => {
    setEditingAttendanceId(null);
    setAttendanceForm({ student: "", classRoom: "", date: "", status: "present", teacherId: "" });
  };

  const resetResultForm = () => {
    setEditingResultId(null);
    setResultForm({ student: "", classRoom: "", examName: "", term: "", percentage: "", grade: "" });
  };

  const resetMaterialForm = () => {
    setEditingMaterialId(null);
    setMaterialForm({ title: "", description: "", classRoom: "", subject: "", fileUrl: "", uploadedBy: "" });
  };

  const resetFeeStructureForm = () => {
    setEditingFeeStructureId(null);
    setFeeStructureForm({
      className: "",
      classRoom: "",
      tuitionFee: "",
      transportFee: "",
      libraryFee: "",
      examFee: "",
      otherCharges: "",
      transportEnabled: true,
      academicYear: "2026-27",
    });
  };

  const resetFeePaymentForm = () => {
    setEditingFeePaymentId(null);
    setFeePaymentForm({
      studentId: selectedFeeStudentId || "",
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMonth: new Date().toLocaleString("en-US", { month: "long" }),
      amountPaid: "",
      paymentMethod: "cash",
      receiptNumber: "",
      academicYear: selectedFeeStudent?.feeSummary?.academicYear || "2026-27",
    });
  };

  const resetFeeRevisionForm = () => {
    setFeeRevisionForm({
      effectiveMonth: "",
      reason: "",
      tuitionFee: String(selectedFeeStudent?.feeSummary?.currentMonthlyStructure?.tuitionFee || ""),
      transportFee: String(selectedFeeStudent?.feeSummary?.currentMonthlyStructure?.transportFee || ""),
      libraryFee: String(selectedFeeStudent?.feeSummary?.currentMonthlyStructure?.libraryFee || ""),
      examFee: String(selectedFeeStudent?.feeSummary?.currentMonthlyStructure?.examFee || ""),
      otherCharges: String(selectedFeeStudent?.feeSummary?.currentMonthlyStructure?.otherCharges || ""),
      transportEnabled: selectedFeeStudent?.feeSummary?.currentMonthlyStructure?.transportEnabled !== false,
    });
  };

  const resetNoticeForm = () => {
    setEditingNoticeId(null);
    setNoticeForm({ title: "", description: "", date: "", isPinned: false });
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventForm({ title: "", description: "", eventDate: "", location: "JMS Campus" });
  };

  const resetDownloadForm = () => {
    setEditingDownloadIndex(null);
    setDownloadForm({ title: "", category: "", fileUrl: "" });
  };

  const requestConfirmation = ({ title, message, onConfirm }) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });
  };

  const runConfirmDialog = async () => {
    try {
      if (confirmDialog.onConfirm) {
        await confirmDialog.onConfirm();
      }
    } finally {
      closeConfirmDialog();
    }
  };

  // Loads all admin-managed resources in one dashboard refresh
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [gRes, nRes, eRes, cRes, mRes, summaryRes, studentsRes, teachersRes, parentsRes, classesRes, admissionsRes, assignmentsRes, attendanceRes, resultsRes, materialsRes, feeStructuresRes, feePaymentsRes, feeReportsRes, notificationsRes] = await Promise.all([
        api.get("/gallery"),
        api.get("/notices"),
        api.get("/events"),
        api.get("/content"),
        api.get("/contact/messages"),
        api.get("/management/summary"),
        api.get("/management/students"),
        api.get("/management/teachers"),
        api.get("/management/parents"),
        api.get("/management/classes"),
        api.get("/management/admissions"),
        api.get("/management/assignments"),
        api.get("/management/attendance"),
        api.get("/management/results"),
        api.get("/management/materials"),
        api.get("/management/fee-structures"),
        api.get("/management/fee-payments"),
        api.get("/management/fees/reports"),
        api.get("/management/notifications"),
      ]);

      setGallery(gRes.data || []);
      setNotices(nRes.data || []);
      setEvents(eRes.data || []);
      setContent(cRes.data || {});
      setMessages(mRes.data || []);
      setSummary(summaryRes.data || null);
      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setParents(parentsRes.data || []);
      setClassRooms(classesRes.data || []);
      setAdmissions(admissionsRes.data || []);
      setAssignments(assignmentsRes.data || []);
      setAttendanceRecords(attendanceRes.data || []);
      setResults(resultsRes.data || []);
      setMaterials(materialsRes.data || []);
      setFeeStructures(feeStructuresRes.data || []);
      setFeePayments(feePaymentsRes.data || []);
      setFeeReports(feeReportsRes.data || null);
      setNotifications(notificationsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (!messages.length) {
      setSelectedMessage(null);
      return;
    }

    setSelectedMessage((current) => {
      if (!current) return messages[0];
      return messages.find((m) => m._id === current._id) || messages[0];
    });
  }, [messages]);

  useEffect(() => {
    if (!selectedFeeStudent && selectedFeeStudentId) {
      setSelectedFeeStudentId("");
      return;
    }

    if (!selectedFeeStudentId && selectedFeeStudent?._id) {
      setSelectedFeeStudentId(selectedFeeStudent._id);
      return;
    }

    if (!editingFeePaymentId) {
      setFeePaymentForm((current) => ({
        ...current,
        studentId: selectedFeeStudent?._id || current.studentId,
        academicYear: selectedFeeStudent?.feeSummary?.academicYear || current.academicYear,
      }));
    }
  }, [selectedFeeStudent, selectedFeeStudentId, editingFeePaymentId]);

  useEffect(() => {
    if (selectedFeeStudent) {
      setFeeRevisionForm({
        effectiveMonth: "",
        reason: "",
        tuitionFee: String(selectedFeeStudent.feeSummary?.currentMonthlyStructure?.tuitionFee || ""),
        transportFee: String(selectedFeeStudent.feeSummary?.currentMonthlyStructure?.transportFee || ""),
        libraryFee: String(selectedFeeStudent.feeSummary?.currentMonthlyStructure?.libraryFee || ""),
        examFee: String(selectedFeeStudent.feeSummary?.currentMonthlyStructure?.examFee || ""),
        otherCharges: String(selectedFeeStudent.feeSummary?.currentMonthlyStructure?.otherCharges || ""),
        transportEnabled: selectedFeeStudent.feeSummary?.currentMonthlyStructure?.transportEnabled !== false,
      });
    }
  }, [selectedFeeStudent?._id]);

  useEffect(() => {
    if (!feeAcademicYearOptions.includes(feeHistoryFilters.academicYear) && feeAcademicYearOptions.length) {
      setFeeHistoryFilters((current) => ({ ...current, academicYear: feeAcademicYearOptions[0] }));
    }
  }, [feeAcademicYearOptions, feeHistoryFilters.academicYear]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreview(selected.map((file) => URL.createObjectURL(file)));
  };

  // Uploads multiple images with preview support and auto-refresh
  const handleUpload = async () => {
    if (!files.length) return toast.error("Please select images.");
    const fd = new FormData();
    fd.append("title", uploadTitle);
    files.forEach((file) => fd.append("images", file));

    try {
      await api.post("/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Photos uploaded successfully.");
      setFiles([]);
      setPreview([]);
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed.");
    }
  };

  const deleteGalleryItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success("Photo deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed.");
    }
  };

  const editGalleryItem = (item) => {
    setEditingGalleryId(item._id);
    setUploadTitle(item.title || "School Moment");
  };

  const saveGalleryTitle = async () => {
    if (!editingGalleryId) return;
    try {
      await api.put(`/gallery/${editingGalleryId}`, { title: uploadTitle });
      toast.success("Gallery item updated.");
      setEditingGalleryId(null);
      setUploadTitle("School Moment");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update gallery item.");
    }
  };

  const saveNotice = async () => {
    if (!noticeForm.title || !noticeForm.description) return toast.error("Notice title and description required.");
    try {
      if (editingNoticeId) {
        await api.put(`/notices/${editingNoticeId}`, noticeForm);
        toast.success("Notice updated.");
      } else {
        await api.post("/notices", noticeForm);
        toast.success("Notice added.");
      }
      resetNoticeForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save notice.");
    }
  };

  const editNotice = (notice) => {
    setEditingNoticeId(notice._id);
    setNoticeForm({
      title: notice.title || "",
      description: notice.description || "",
      date: notice.date ? new Date(notice.date).toISOString().slice(0, 10) : "",
      isPinned: Boolean(notice.isPinned),
    });
  };

  const deleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success("Notice deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete notice.");
    }
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.eventDate) return toast.error("Title, description and date are required.");
    try {
      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, eventForm);
        toast.success("Event updated.");
      } else {
        await api.post("/events", eventForm);
        toast.success("Event added.");
      }
      resetEventForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save event.");
    }
  };

  const editEvent = (event) => {
    setEditingEventId(event._id);
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : "",
      location: event.location || "JMS Campus",
    });
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event.");
    }
  };

  const saveContent = async () => {
    try {
      await api.put("/content", content);
      toast.success("School content updated.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save content.");
    }
  };

  const uploadAdmissionTemplate = async () => {
    if (!admissionTemplateFile) return toast.error("Please choose a template file.");

    const fd = new FormData();
    fd.append("template", admissionTemplateFile);

    try {
      await api.post("/content/admission-template", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Admission template uploaded.");
      setAdmissionTemplateFile(null);
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Template upload failed.");
    }
  };

  const handleContentImageChange = (field, file) => {
    setContentImageFiles((current) => ({ ...current, [field]: file || null }));
    setContentImagePreviews((current) => ({
      ...current,
      [field]: file ? URL.createObjectURL(file) : "",
    }));
  };

  const uploadContentImage = async (field) => {
    const file = contentImageFiles[field];
    if (!file) return toast.error("Please choose an image first.");

    const fd = new FormData();
    fd.append("field", field);
    fd.append("image", file);

    try {
      await api.post("/content/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image updated.");
      setContentImageFiles((current) => ({ ...current, [field]: null }));
      setContentImagePreviews((current) => ({ ...current, [field]: "" }));
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed.");
    }
  };

  const deleteContentImage = async (field) => {
    if (!window.confirm("Delete this image and restore the default public-site fallback?")) return;

    try {
      await api.delete(`/content/delete-image?field=${field}`);
      toast.success("Image deleted. Default image restored.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete image.");
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this contact message?")) return;

    try {
      await api.delete(`/contact/messages/${id}`);
      toast.success("Message deleted.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message.");
    }
  };

  const saveStudent = async () => {
    if (!studentForm.name || !studentForm.email || (!editingStudentId && !studentForm.password)) {
      return toast.error("Student name, email, and password are required for new records.");
    }

    try {
      if (editingStudentId) {
        await api.put(`/management/students/${editingStudentId}`, studentForm);
        toast.success("Student updated.");
      } else {
        await api.post("/management/students", studentForm);
        toast.success("Student created.");
      }
      resetStudentForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save student.");
    }
  };

  const editStudent = (student) => {
    setEditingStudentId(student._id);
    setStudentForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      password: "",
      phone: student.user?.phone || "",
      admissionNumber: student.admissionNumber || "",
      rollNumber: student.rollNumber || "",
      gender: student.gender || "other",
      classRoomId: student.classRoom?._id || "",
      parentId: student.parent?._id || "",
    });
  };

  const deleteStudentRecord = async (id) => {
    if (!window.confirm("Delete this student record? This will also remove related results, attendance, and fee records.")) return;
    try {
      await api.delete(`/management/students/${id}`);
      toast.success("Student deleted.");
      if (editingStudentId === id) resetStudentForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student.");
    }
  };

  const saveTeacher = async () => {
    if (!teacherForm.name || !teacherForm.email || (!editingTeacherId && !teacherForm.password)) {
      return toast.error("Teacher name, email, and password are required for new records.");
    }

    try {
      if (editingTeacherId) {
        await api.put(`/management/teachers/${editingTeacherId}`, teacherForm);
        toast.success("Teacher updated.");
      } else {
        await api.post("/management/teachers", teacherForm);
        toast.success("Teacher created.");
      }
      resetTeacherForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save teacher.");
    }
  };

  const editTeacher = (teacher) => {
    setEditingTeacherId(teacher._id);
    setTeacherForm({
      name: teacher.user?.name || "",
      email: teacher.user?.email || "",
      password: "",
      phone: teacher.user?.phone || "",
      employeeId: teacher.employeeId || "",
      department: teacher.department || "",
      qualification: teacher.qualification || "",
      designation: teacher.designation || "Teacher",
      subjects: (teacher.subjects || []).join(", "),
    });
  };

  const deleteTeacherRecord = async (id) => {
    if (!window.confirm("Delete this teacher record?")) return;
    try {
      await api.delete(`/management/teachers/${id}`);
      toast.success("Teacher deleted.");
      if (editingTeacherId === id) resetTeacherForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher.");
    }
  };

  const createParent = async () => {
    if (!parentForm.name || !parentForm.email || !parentForm.password) {
      return toast.error("Parent name, email, and password are required.");
    }

    try {
      await api.post("/management/parents", parentForm);
      toast.success("Parent created.");
      setParentForm({ name: "", email: "", password: "Portal@123", phone: "", occupation: "", address: "" });
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create parent.");
    }
  };

  const saveClassRoom = async () => {
    if (!classForm.name || !classForm.section) {
      return toast.error("Class name and section are required.");
    }

    try {
      const payload = {
        ...classForm,
        subjects: classForm.subjects,
      };
      if (editingClassId) {
        await api.put(`/management/classes/${editingClassId}`, payload);
        toast.success("Class updated.");
      } else {
        await api.post("/management/classes", payload);
        toast.success("Class created.");
      }
      resetClassForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save class.");
    }
  };

  const editClassRoom = (classRoom) => {
    setEditingClassId(classRoom._id);
    setClassForm({
      name: classRoom.name || "",
      section: classRoom.section || "",
      academicYear: classRoom.academicYear || "2026-27",
      classTeacher: classRoom.classTeacher?._id || "",
      subjects: (classRoom.subjects || []).map((subject) => subject.name).join(", "),
    });
  };

  const deleteClassRoomRecord = async (id) => {
    if (!window.confirm("Delete this class? Students will be unassigned and class-linked academic records will be removed.")) return;
    try {
      await api.delete(`/management/classes/${id}`);
      toast.success("Class deleted.");
      if (editingClassId === id) resetClassForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete class.");
    }
  };

  const saveAdmissionRecord = async () => {
    if (!admissionForm.studentName || !admissionForm.parentName || !admissionForm.email || !admissionForm.phone || !admissionForm.classApplyingFor) {
      return toast.error("Fill all admission fields before saving.");
    }

    try {
      if (editingAdmissionId) {
        await api.put(`/management/admissions/${editingAdmissionId}`, admissionForm);
        toast.success("Admission updated.");
      } else {
        await api.post("/management/admissions", admissionForm);
        toast.success("Admission record added.");
      }
      resetAdmissionForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save admission.");
    }
  };

  const editAdmission = (admission) => {
    setEditingAdmissionId(admission._id);
    setAdmissionForm({
      studentName: admission.studentName || "",
      parentName: admission.parentName || "",
      email: admission.email || "",
      phone: admission.phone || "",
      classApplyingFor: admission.classApplyingFor || "",
      classRoom: admission.classRoom?._id || "",
      notes: admission.notes || "",
      status: admission.status || "new",
    });
  };

  const approveAdmissionRecord = async (admission) => {
    requestConfirmation({
      title: "Approve admission",
      message: `Approve ${admission.studentName}'s admission and create or link a student portal account?`,
      onConfirm: async () => {
        try {
          const { data } = await api.post(`/management/admissions/${admission._id}/approve`, {
            classRoomId: admission.classRoom?._id || admissionForm.classRoom || "",
          });
          if (data.credentials) {
            setLatestCredentials({
              studentName: admission.studentName,
              email: data.credentials.email,
              password: data.credentials.password,
            });
          } else {
            setLatestCredentials(null);
          }
          toast.success(data.message || "Admission approved.");
          await fetchAll();
          setActiveTab("students");
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to approve admission.");
        }
      },
    });
  };

  const rejectAdmissionRecord = async (id) => {
    requestConfirmation({
      title: "Reject admission",
      message: "Reject this admission request?",
      onConfirm: async () => {
        try {
          await api.post(`/management/admissions/${id}/reject`, {});
          toast.success("Admission rejected.");
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to reject admission.");
        }
      },
    });
  };

  const deleteAdmissionRecord = async (id) => {
    requestConfirmation({
      title: "Delete admission",
      message: "Delete this admission request?",
      onConfirm: async () => {
        try {
          await api.delete(`/management/admissions/${id}`);
          toast.success("Admission deleted.");
          if (editingAdmissionId === id) resetAdmissionForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete admission.");
        }
      },
    });
  };

  const saveAssignmentRecord = async () => {
    if (!assignmentForm.title || !assignmentForm.classRoom || !assignmentForm.subject || !assignmentForm.dueDate || !assignmentForm.createdBy) {
      return toast.error("Assignment title, class, subject, due date, and teacher are required.");
    }

    try {
      if (editingAssignmentId) {
        await api.put(`/management/assignments/${editingAssignmentId}`, assignmentForm);
        toast.success("Assignment updated.");
      } else {
        await api.post("/management/assignments", assignmentForm);
        toast.success("Assignment published.");
      }
      resetAssignmentForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save assignment.");
    }
  };

  const editAssignmentRecord = (assignment) => {
    setEditingAssignmentId(assignment._id);
    setAssignmentForm({
      title: assignment.title || "",
      description: assignment.description || "",
      classRoom: assignment.classRoom?._id || "",
      subject: assignment.subject || "",
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 10) : "",
      createdBy: assignment.createdBy?._id || "",
    });
  };

  const deleteAssignmentRecord = async (id) => {
    requestConfirmation({
      title: "Delete assignment",
      message: "Delete this assignment?",
      onConfirm: async () => {
        try {
          await api.delete(`/management/assignments/${id}`);
          toast.success("Assignment deleted.");
          if (editingAssignmentId === id) resetAssignmentForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete assignment.");
        }
      },
    });
  };

  const markAttendanceRecord = async () => {
    if (!attendanceForm.student || !attendanceForm.classRoom || !attendanceForm.date) {
      return toast.error("Select a student, class, and date.");
    }

    try {
      if (editingAttendanceId) {
        await api.put(`/management/attendance/${editingAttendanceId}`, attendanceForm);
      } else {
        await api.post("/management/attendance", attendanceForm);
      }
      toast.success("Attendance updated.");
      resetAttendanceForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance.");
    }
  };

  const editAttendanceRecord = (attendance) => {
    setEditingAttendanceId(attendance._id);
    setAttendanceForm({
      student: attendance.student?._id || "",
      classRoom: attendance.classRoom?._id || "",
      date: attendance.date ? new Date(attendance.date).toISOString().slice(0, 10) : "",
      status: attendance.status || "present",
      teacherId: attendance.markedBy?._id || "",
    });
  };

  const deleteAttendanceRecord = async (id) => {
    requestConfirmation({
      title: "Delete attendance",
      message: "Delete this attendance record?",
      onConfirm: async () => {
        try {
          await api.delete(`/management/attendance/${id}`);
          toast.success("Attendance deleted.");
          if (editingAttendanceId === id) resetAttendanceForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete attendance.");
        }
      },
    });
  };

  const saveResultRecord = async () => {
    if (!resultForm.student || !resultForm.classRoom || !resultForm.examName) {
      return toast.error("Student, class, and exam name are required.");
    }

    try {
      const payload = {
        ...resultForm,
        percentage: Number(resultForm.percentage || 0),
        marks: [],
      };
      if (editingResultId) {
        await api.put(`/management/results/${editingResultId}`, payload);
      } else {
        await api.post("/management/results", payload);
      }
      toast.success("Result saved.");
      resetResultForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save result.");
    }
  };

  const editResultRecord = (result) => {
    setEditingResultId(result._id);
    setResultForm({
      student: result.student?._id || "",
      classRoom: result.classRoom?._id || "",
      examName: result.examName || "",
      term: result.term || "",
      percentage: String(result.percentage ?? ""),
      grade: result.grade || "",
    });
  };

  const deleteResultRecord = async (id) => {
    requestConfirmation({
      title: "Delete result",
      message: "Delete this exam result?",
      onConfirm: async () => {
        try {
          await api.delete(`/management/results/${id}`);
          toast.success("Result deleted.");
          if (editingResultId === id) resetResultForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete result.");
        }
      },
    });
  };

  const saveMaterialRecord = async () => {
    if (!materialForm.title || !materialForm.classRoom || !materialForm.subject || !materialForm.uploadedBy) {
      return toast.error("Material title, class, subject, and teacher are required.");
    }

    try {
      if (editingMaterialId) {
        await api.put(`/management/materials/${editingMaterialId}`, materialForm);
        toast.success("Study material updated.");
      } else {
        await api.post("/management/materials", materialForm);
        toast.success("Study material added.");
      }
      resetMaterialForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save material.");
    }
  };

  const editMaterialRecord = (material) => {
    setEditingMaterialId(material._id);
    setMaterialForm({
      title: material.title || "",
      description: material.description || "",
      classRoom: material.classRoom?._id || "",
      subject: material.subject || "",
      fileUrl: material.fileUrl || "",
      uploadedBy: material.uploadedBy?._id || "",
    });
  };

  const deleteMaterialRecord = async (id) => {
    requestConfirmation({
      title: "Delete material",
      message: "Delete this study material?",
      onConfirm: async () => {
        try {
          await api.delete(`/management/materials/${id}`);
          toast.success("Study material deleted.");
          if (editingMaterialId === id) resetMaterialForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete material.");
        }
      },
    });
  };

  const createNotificationItem = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      return toast.error("Notification title and message are required.");
    }

    try {
      await api.post("/management/notifications", notificationForm);
      toast.success("Notification published.");
      setNotificationForm({ title: "", message: "", audience: ["all"] });
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish notification.");
    }
  };

  const saveFeeStructure = async () => {
    if (!feeStructureForm.className) {
      return toast.error("Class name is required for a fee structure.");
    }

    try {
      const payload = {
        ...feeStructureForm,
        tuitionFee: Number(feeStructureForm.tuitionFee || 0),
        transportFee: Number(feeStructureForm.transportFee || 0),
        libraryFee: Number(feeStructureForm.libraryFee || 0),
        examFee: Number(feeStructureForm.examFee || 0),
        otherCharges: Number(feeStructureForm.otherCharges || 0),
        transportEnabled: feeStructureForm.transportEnabled,
      };

      if (editingFeeStructureId) {
        await api.put(`/management/fee-structures/${editingFeeStructureId}`, payload);
        toast.success("Fee structure updated.");
      } else {
        await api.post("/management/fee-structures", payload);
        toast.success("Fee structure created.");
      }
      resetFeeStructureForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save fee structure.");
    }
  };

  const editFeeStructure = (structure) => {
    setFeeSubTab("structure");
    setEditingFeeStructureId(structure._id);
    setFeeStructureForm({
      className: structure.className || "",
      classRoom: structure.classRoom?._id || "",
      tuitionFee: String(structure.tuitionFee || ""),
      transportFee: String(structure.transportFee || ""),
      libraryFee: String(structure.libraryFee || ""),
      examFee: String(structure.examFee || ""),
      otherCharges: String(structure.otherCharges || ""),
      transportEnabled: structure.transportEnabled !== false,
      academicYear: structure.academicYear || "2026-27",
    });
  };

  const removeFeeStructure = async (id) => {
    requestConfirmation({
      title: "Delete fee structure",
      message: "Delete this fee structure? Students linked to it will keep their history but lose the active assignment.",
      onConfirm: async () => {
        try {
          await api.delete(`/management/fee-structures/${id}`);
          toast.success("Fee structure deleted.");
          if (editingFeeStructureId === id) resetFeeStructureForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete fee structure.");
        }
      },
    });
  };

  const assignStudentFeeStructure = async (studentId, feeStructureId) => {
    if (!feeStructureId) return toast.error("Select a fee structure first.");
    try {
      await api.put(`/management/students/${studentId}/fee-structure`, { feeStructureId });
      toast.success("Fee structure assigned to student.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign fee structure.");
    }
  };

  const saveFeePayment = async () => {
    if (!feePaymentForm.studentId || !feePaymentForm.paymentDate || !feePaymentForm.paymentMonth || !feePaymentForm.amountPaid) {
      return toast.error("Student, payment date, month, and amount are required.");
    }

    try {
      const payload = {
        ...feePaymentForm,
        amountPaid: Number(feePaymentForm.amountPaid),
      };

      const response = editingFeePaymentId
        ? await api.put(`/management/fee-payments/${editingFeePaymentId}`, payload)
        : await api.post("/management/fee-payments", payload);

      toast.success(editingFeePaymentId ? "Fee payment updated." : "Fee payment recorded.");
      setSelectedReceipt(response.data?.payment || null);
      resetFeePaymentForm();
      setFeeSubTab("collection");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save fee payment.");
    }
  };

  const submitFeeRevision = async () => {
    if (!selectedFeeStudent?._id) return toast.error("Select a student first.");
    if (!feeRevisionForm.effectiveMonth || !feeRevisionForm.reason.trim()) {
      return toast.error("Effective month and revision reason are required.");
    }

    try {
      await api.post(`/management/students/${selectedFeeStudent._id}/fee-plan/revise`, {
        ...feeRevisionForm,
        effectiveMonth: Number(feeRevisionForm.effectiveMonth),
        tuitionFee: Number(feeRevisionForm.tuitionFee || 0),
        transportFee: Number(feeRevisionForm.transportFee || 0),
        libraryFee: Number(feeRevisionForm.libraryFee || 0),
        examFee: Number(feeRevisionForm.examFee || 0),
        otherCharges: Number(feeRevisionForm.otherCharges || 0),
      });
      toast.success("Student fee plan revised.");
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revise student fee plan.");
    }
  };

  const editFeePayment = (payment) => {
    setFeeSubTab("collection");
    setEditingFeePaymentId(payment._id);
    setSelectedFeeStudentId(payment.studentId?._id || payment.studentId || "");
    setFeePaymentForm({
      studentId: payment.studentId?._id || payment.studentId || "",
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().slice(0, 10) : "",
      paymentMonth: payment.paymentMonth || "",
      amountPaid: String(payment.amountPaid || ""),
      paymentMethod: payment.paymentMethod || "cash",
      receiptNumber: payment.receiptNumber || "",
      academicYear: payment.academicYear || "2026-27",
    });
  };

  const removeFeePayment = async (id) => {
    requestConfirmation({
      title: "Delete payment entry",
      message: "Delete this payment entry? The student balance will be recalculated.",
      onConfirm: async () => {
        try {
          await api.delete(`/management/fee-payments/${id}`);
          toast.success("Fee payment deleted.");
          if (editingFeePaymentId === id) resetFeePaymentForm();
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete fee payment.");
        }
      },
    });
  };

  const printReceipt = (payment) => {
    const paymentStudent = payment.studentId;
    const classLabel = paymentStudent?.classRoom ? `${paymentStudent.classRoom.name} - ${paymentStudent.classRoom.section}` : "Unassigned";
    const receiptWindow = window.open("", "_blank", "width=900,height=700");
    if (!receiptWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print receipts.");
      return;
    }

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Fee Receipt - ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            .receipt { max-width: 720px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 24px; }
            h1 { margin: 0 0 8px; color: #1d4ed8; }
            h2 { margin: 0 0 24px; font-size: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin-top: 24px; }
            .row { margin-bottom: 10px; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
            .value { font-size: 16px; font-weight: 600; margin-top: 4px; }
            .footer { margin-top: 32px; font-size: 13px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>JMS Public School Chaudiha</h1>
            <h2>Fee Payment Receipt</h2>
            <div class="grid">
              <div class="row"><div class="label">Student Name</div><div class="value">${paymentStudent?.user?.name || "Student"}</div></div>
              <div class="row"><div class="label">Class / Roll</div><div class="value">${classLabel} / ${paymentStudent?.rollNumber || "N/A"}</div></div>
              <div class="row"><div class="label">Receipt Number</div><div class="value">${payment.receiptNumber}</div></div>
              <div class="row"><div class="label">Payment Date</div><div class="value">${new Date(payment.paymentDate).toLocaleDateString()}</div></div>
              <div class="row"><div class="label">Amount Paid</div><div class="value">INR ${payment.amountPaid}</div></div>
              <div class="row"><div class="label">Payment Method</div><div class="value">${payment.paymentMethod}</div></div>
              <div class="row"><div class="label">Academic Year</div><div class="value">${payment.academicYear}</div></div>
              <div class="row"><div class="label">Remaining Balance</div><div class="value">INR ${payment.remainingBalance}</div></div>
            </div>
            <p class="footer">This is a system-generated receipt from the JMS Public School Chaudiha ERP fee module.</p>
          </div>
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const downloadBlobFile = (blob, fileName) => {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const exportFeeHistory = async () => {
    try {
      const response = await api.get("/management/fee-payments/export", {
        params: {
          academicYear: feeHistoryFilters.academicYear,
          ...(feeHistoryFilters.classRoomId !== "all" ? { classRoomId: feeHistoryFilters.classRoomId } : {}),
        },
        responseType: "blob",
      });

      const disposition = response.headers["content-disposition"] || "";
      const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i);
      const fileName = fileNameMatch?.[1] || `Fee_Transactions_${feeHistoryFilters.academicYear}.xlsx`;

      downloadBlobFile(response.data, fileName);
      setFeeHistoryBackup({
        academicYear: feeHistoryFilters.academicYear,
        classRoomId: feeHistoryFilters.classRoomId,
        exportedAt: new Date().toISOString(),
        fileName,
      });
      toast.success("Fee transaction history exported successfully. You may now delete the records.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export fee transaction history.");
    }
  };

  const deleteFeeHistory = async () => {
    const backupMatchesCurrentFilters =
      feeHistoryBackup?.academicYear === feeHistoryFilters.academicYear &&
      feeHistoryBackup?.classRoomId === feeHistoryFilters.classRoomId;

    if (!backupMatchesCurrentFilters) {
      return toast.error("Export the selected fee transaction history before deleting it.");
    }

    requestConfirmation({
      title: "Delete session fee history",
      message:
        "This will permanently remove fee transaction history from the database. Please ensure the Excel backup has been downloaded.",
      onConfirm: async () => {
        try {
          await api.post("/management/fee-payments/session-history/delete", {
            academicYear: feeHistoryFilters.academicYear,
            classRoomId: feeHistoryFilters.classRoomId === "all" ? undefined : feeHistoryFilters.classRoomId,
            exportConfirmed: true,
          });
          toast.success("Fee transaction history deleted successfully.");
          setFeeHistoryBackup(null);
          setSelectedReceipt(null);
          await fetchAll();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete fee transaction history.");
        }
      },
    });
  };

  const saveDownload = async () => {
    if (!downloadForm.title || !downloadForm.category || !downloadForm.fileUrl) {
      return toast.error("Download title, category, and file URL are required.");
    }

    const downloads = [...(content.downloads || [])];
    const item = { ...downloadForm };

    if (editingDownloadIndex !== null) {
      downloads[editingDownloadIndex] = item;
    } else {
      downloads.push(item);
    }

    try {
      await api.put("/content", { downloads });
      toast.success(editingDownloadIndex !== null ? "Download updated." : "Download added.");
      setContent((current) => ({ ...current, downloads }));
      resetDownloadForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save download.");
    }
  };

  const editDownload = (item, index) => {
    setEditingDownloadIndex(index);
    setDownloadForm({
      title: item.title || "",
      category: item.category || "",
      fileUrl: item.fileUrl || "",
    });
  };

  const deleteDownload = async (index) => {
    if (!window.confirm("Delete this download item?")) return;

    const downloads = [...(content.downloads || [])];
    downloads.splice(index, 1);

    try {
      await api.put("/content", { downloads });
      toast.success("Download deleted.");
      setContent((current) => ({ ...current, downloads }));
      if (editingDownloadIndex === index) resetDownloadForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete download.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-body">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
          <h1 className="font-display text-3xl text-primary-700">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg capitalize ${activeTab === tab ? "bg-primary-700 text-white" : "bg-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <section className="grid md:grid-cols-4 gap-4">
            <StatCard label="Students" value={stats.studentCount} />
            <StatCard label="Teachers" value={stats.teacherCount} />
            <StatCard label="Parents" value={stats.parentCount} />
            <StatCard label="Fee Dues" value={stats.feeDueCount} />
          </section>
        )}

        {activeTab === "messages" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <article className="bg-white p-4 rounded-xl shadow-soft">
                  <p className="text-slate-600">No contact messages yet.</p>
                </article>
              ) : (
                messages.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedMessage(item)}
                    className="w-full text-left bg-white p-4 rounded-xl shadow-soft hover:shadow-lg transition"
                  >
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.email}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-700 mt-2 truncate">{item.message}</p>
                  </button>
                ))
              )}
            </div>

            <article className="bg-white p-5 rounded-xl shadow-soft min-h-52">
              {selectedMessage ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl text-primary-700">Message Details</h3>
                    <button
                      type="button"
                      onClick={() => deleteMessage(selectedMessage._id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">From:</span> {selectedMessage.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Email:</span> {selectedMessage.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Received:</span>{" "}
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                  <div className="mt-4 border rounded-lg p-3 bg-slate-50">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </>
              ) : (
                <p className="text-slate-600">Select a message from the left list to open it.</p>
              )}
            </article>
          </section>
        )}

        {activeTab === "students" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingStudentId ? "Edit Student" : "Add Student"}</h2>
                {editingStudentId ? (
                  <button type="button" onClick={resetStudentForm} className="text-sm text-slate-600 underline">
                    Cancel Edit
                  </button>
                ) : null}
              </div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Name" value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" type="password" placeholder="Password" value={studentForm.password} onChange={(event) => setStudentForm({ ...studentForm, password: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Phone" value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} />
              <div className="grid sm:grid-cols-2 gap-2">
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Admission Number (optional)" value={studentForm.admissionNumber} onChange={(event) => setStudentForm({ ...studentForm, admissionNumber: event.target.value })} />
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Roll Number (optional)" value={studentForm.rollNumber} onChange={(event) => setStudentForm({ ...studentForm, rollNumber: event.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <select className="w-full border rounded-lg px-3 py-2" value={studentForm.classRoomId} onChange={(event) => setStudentForm({ ...studentForm, classRoomId: event.target.value })}>
                  <option value="">Assign Class (optional)</option>
                  {classRooms.map((classRoom) => (
                    <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                  ))}
                </select>
                <select className="w-full border rounded-lg px-3 py-2" value={studentForm.parentId} onChange={(event) => setStudentForm({ ...studentForm, parentId: event.target.value })}>
                  <option value="">Link Parent (optional)</option>
                  {parents.map((parent) => (
                    <option key={parent._id} value={parent._id}>{parent.user?.name || "Parent"}</option>
                  ))}
                </select>
              </div>
              <select className="w-full border rounded-lg px-3 py-2" value={studentForm.gender} onChange={(event) => setStudentForm({ ...studentForm, gender: event.target.value })}>
                <option value="other">Gender: Other</option>
                <option value="male">Gender: Male</option>
                <option value="female">Gender: Female</option>
              </select>
              <p className="text-xs text-slate-500">If admission number or roll number is left blank, the system will generate them automatically.</p>
              <button onClick={saveStudent} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingStudentId ? "Update Student" : "Create Student"}</button>
              {latestCredentials ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  <p className="font-semibold">Latest student portal credentials</p>
                  <p>{latestCredentials.studentName}</p>
                  <p>Email: {latestCredentials.email}</p>
                  <p>Password: {latestCredentials.password}</p>
                </div>
              ) : null}
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-3 overflow-x-auto">
              <div className="grid gap-2 md:grid-cols-3">
                <input className="border rounded-lg px-3 py-2" placeholder="Search students" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} />
                <select className="border rounded-lg px-3 py-2" value={studentClassFilter} onChange={(event) => setStudentClassFilter(event.target.value)}>
                  <option value="all">All Classes</option>
                  {classRooms.map((classRoom) => (
                    <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                  ))}
                </select>
                <select className="border rounded-lg px-3 py-2" value={studentSort} onChange={(event) => setStudentSort(event.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="name">Sort by Name</option>
                  <option value="admission">Sort by Admission No.</option>
                </select>
              </div>
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Admission / Roll</th>
                    <th className="py-2 pr-3">Class</th>
                    <th className="py-2 pr-3">Parent</th>
                    <th className="py-2 pr-3">Fee Snapshot</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-semibold">{item.user?.name}</p>
                        <p className="text-slate-500">{item.user?.email}</p>
                      </td>
                      <td className="py-3 pr-3">{item.admissionNumber}<br />{item.rollNumber}</td>
                      <td className="py-3 pr-3">{item.classRoom ? `${item.classRoom.name} - ${item.classRoom.section}` : "Unassigned"}</td>
                      <td className="py-3 pr-3">{item.parent?.user?.name || "Not linked"}</td>
                      <td className="py-3 pr-3">
                        <p className="font-medium capitalize">{item.feeSummary?.paymentStatus || item.feeStatus || "pending"}</p>
                        <p className="text-xs text-slate-500">
                          Paid INR {item.feeSummary?.amountPaid || 0} / {item.feeSummary?.totalFee || 0}
                        </p>
                        <p className="text-xs text-slate-500">Balance INR {item.feeSummary?.remainingBalance || 0}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <button onClick={() => editStudent(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                          <button onClick={() => deleteStudentRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "teachers" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingTeacherId ? "Edit Teacher" : "Add Teacher"}</h2>
                {editingTeacherId ? <button type="button" onClick={resetTeacherForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              {[
                ["name", "Name"],
                ["email", "Email"],
                ["password", "Password"],
                ["phone", "Phone"],
                ["employeeId", "Employee ID (optional)"],
                ["department", "Department"],
                ["qualification", "Qualification"],
                ["designation", "Designation"],
              ].map(([key, label]) => (
                <input key={key} className="w-full border rounded-lg px-3 py-2" placeholder={label} value={teacherForm[key]} onChange={(event) => setTeacherForm({ ...teacherForm, [key]: event.target.value })} />
              ))}
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Subjects (comma separated)" value={teacherForm.subjects} onChange={(event) => setTeacherForm({ ...teacherForm, subjects: event.target.value })} />
              <button onClick={saveTeacher} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingTeacherId ? "Update Teacher" : "Create Teacher"}</button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-3">Teacher</th>
                    <th className="py-2 pr-3">Department</th>
                    <th className="py-2 pr-3">Subjects</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-semibold">{item.user?.name}</p>
                        <p className="text-slate-500">{item.user?.email}</p>
                      </td>
                      <td className="py-3 pr-3">{item.department || "General"}</td>
                      <td className="py-3 pr-3">{(item.subjects || []).join(", ") || "Not set"}</td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <button onClick={() => editTeacher(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                          <button onClick={() => deleteTeacherRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "parents" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Add Parent</h2>
              {[
                ["name", "Name"],
                ["email", "Email"],
                ["password", "Password"],
                ["phone", "Phone"],
                ["occupation", "Occupation"],
                ["address", "Address"],
              ].map(([key, label]) => (
                <input key={key} className="w-full border rounded-lg px-3 py-2" placeholder={label} value={parentForm[key]} onChange={(event) => setParentForm({ ...parentForm, [key]: event.target.value })} />
              ))}
              <button onClick={createParent} className="bg-primary-700 text-white px-4 py-2 rounded-lg">Create Parent</button>
            </div>
            <div className="space-y-3">
              {parents.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft">
                  <h3 className="font-semibold">{item.user?.name}</h3>
                  <p className="text-sm text-slate-600">{item.user?.email}</p>
                  <p className="text-sm text-slate-500">{item.occupation}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "classes" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingClassId ? "Edit Class" : "Add Class"}</h2>
                {editingClassId ? <button type="button" onClick={resetClassForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Class Name" value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Section" value={classForm.section} onChange={(event) => setClassForm({ ...classForm, section: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Academic Year" value={classForm.academicYear} onChange={(event) => setClassForm({ ...classForm, academicYear: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={classForm.classTeacher} onChange={(event) => setClassForm({ ...classForm, classTeacher: event.target.value })}>
                <option value="">Select Class Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{getTeacherLabel(teacher)}</option>
                ))}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Subjects (comma separated)" value={classForm.subjects} onChange={(event) => setClassForm({ ...classForm, subjects: event.target.value })} />
              <button onClick={saveClassRoom} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingClassId ? "Update Class" : "Create Class"}</button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-3">Class</th>
                    <th className="py-2 pr-3">Academic Year</th>
                    <th className="py-2 pr-3">Subjects</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classRooms.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-semibold">{item.name} - {item.section}</p>
                        <p className="text-slate-500">{item.classTeacher?.user?.name || "No class teacher"}</p>
                      </td>
                      <td className="py-3 pr-3">{item.academicYear}</td>
                      <td className="py-3 pr-3">{(item.subjects || []).map((subject) => subject.name).join(", ") || "Not set"}</td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <button onClick={() => editClassRoom(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                          <button onClick={() => deleteClassRoomRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "admissions" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingAdmissionId ? "Edit Admission Request" : "Add Admission"}</h2>
                {editingAdmissionId ? <button type="button" onClick={resetAdmissionForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Student Name" value={admissionForm.studentName} onChange={(event) => setAdmissionForm({ ...admissionForm, studentName: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Parent Name" value={admissionForm.parentName} onChange={(event) => setAdmissionForm({ ...admissionForm, parentName: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Email" value={admissionForm.email} onChange={(event) => setAdmissionForm({ ...admissionForm, email: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Phone" value={admissionForm.phone} onChange={(event) => setAdmissionForm({ ...admissionForm, phone: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={admissionForm.classRoom} onChange={(event) => {
                const selected = classRooms.find((classRoom) => classRoom._id === event.target.value);
                setAdmissionForm({
                  ...admissionForm,
                  classRoom: event.target.value,
                  classApplyingFor: selected ? `${selected.name} - ${selected.section}` : admissionForm.classApplyingFor,
                });
              }}>
                <option value="">Select Class (optional)</option>
                {classRooms.map((classRoom) => (
                  <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                ))}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Class Applying For" value={admissionForm.classApplyingFor} onChange={(event) => setAdmissionForm({ ...admissionForm, classApplyingFor: event.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Notes" value={admissionForm.notes} onChange={(event) => setAdmissionForm({ ...admissionForm, notes: event.target.value })} />
              <button onClick={saveAdmissionRecord} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingAdmissionId ? "Update Admission" : "Create Admission"}</button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-3 overflow-x-auto">
              <div className="flex justify-end">
                <select className="border rounded-lg px-3 py-2" value={admissionStatusFilter} onChange={(event) => setAdmissionStatusFilter(event.target.value)}>
                  <option value="active">Open Requests</option>
                  <option value="all">All Applications</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="new">New</option>
                </select>
              </div>
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-3">Applicant</th>
                    <th className="py-2 pr-3">Class</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmissions.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-semibold">{item.studentName}</p>
                        <p className="text-slate-500">{item.parentName} · {item.email}</p>
                      </td>
                      <td className="py-3 pr-3">{item.classApplyingFor}</td>
                      <td className="py-3 pr-3 capitalize">{item.status}</td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => editAdmission(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                          {!item.student ? <button onClick={() => approveAdmissionRecord(item)} className="rounded-lg bg-emerald-100 px-3 py-1 text-emerald-800">Approve</button> : null}
                          {item.status !== "rejected" ? <button onClick={() => rejectAdmissionRecord(item._id)} className="rounded-lg bg-slate-200 px-3 py-1 text-slate-800">Reject</button> : null}
                          <button onClick={() => deleteAdmissionRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "assignments" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Create Assignment</h2>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={assignmentForm.title} onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Description" value={assignmentForm.description} onChange={(event) => setAssignmentForm({ ...assignmentForm, description: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={assignmentForm.classRoom} onChange={(event) => setAssignmentForm({ ...assignmentForm, classRoom: event.target.value })}>
                <option value="">Select Class</option>
                {classRooms.map((classRoom) => (
                  <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                ))}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Subject" value={assignmentForm.subject} onChange={(event) => setAssignmentForm({ ...assignmentForm, subject: event.target.value })} />
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={assignmentForm.dueDate} onChange={(event) => setAssignmentForm({ ...assignmentForm, dueDate: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={assignmentForm.createdBy} onChange={(event) => setAssignmentForm({ ...assignmentForm, createdBy: event.target.value })}>
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{getTeacherLabel(teacher)}</option>
                ))}
              </select>
              <button onClick={saveAssignmentRecord} className="bg-primary-700 text-white px-4 py-2 rounded-lg">
                {editingAssignmentId ? "Update Assignment" : "Publish Assignment"}
              </button>
            </div>
            <div className="space-y-3">
              {assignments.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.subject}</p>
                    <p className="text-sm text-slate-500">{new Date(item.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editAssignmentRecord(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                    <button onClick={() => deleteAssignmentRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "attendance" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Mark Attendance</h2>
              <select className="w-full border rounded-lg px-3 py-2" value={attendanceForm.student} onChange={(event) => setAttendanceForm({ ...attendanceForm, student: event.target.value })}>
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{getStudentLabel(student)}</option>
                ))}
              </select>
              <select className="w-full border rounded-lg px-3 py-2" value={attendanceForm.classRoom} onChange={(event) => setAttendanceForm({ ...attendanceForm, classRoom: event.target.value })}>
                <option value="">Select Class</option>
                {classRooms.map((classRoom) => (
                  <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                ))}
              </select>
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={attendanceForm.date} onChange={(event) => setAttendanceForm({ ...attendanceForm, date: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={attendanceForm.teacherId} onChange={(event) => setAttendanceForm({ ...attendanceForm, teacherId: event.target.value })}>
                <option value="">Marked By (optional)</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{getTeacherLabel(teacher)}</option>
                ))}
              </select>
              <select className="w-full border rounded-lg px-3 py-2" value={attendanceForm.status} onChange={(event) => setAttendanceForm({ ...attendanceForm, status: event.target.value })}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
              <button onClick={markAttendanceRecord} className="bg-primary-700 text-white px-4 py-2 rounded-lg">
                {editingAttendanceId ? "Update Attendance" : "Save Attendance"}
              </button>
            </div>
            <div className="space-y-3">
              {attendanceRecords.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{getStudentLabel(item.student)}</h3>
                    <p className="text-sm text-slate-600">{new Date(item.date).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-500 capitalize">{item.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editAttendanceRecord(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                    <button onClick={() => deleteAttendanceRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "results" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Add Result Summary</h2>
              <select className="w-full border rounded-lg px-3 py-2" value={resultForm.student} onChange={(event) => setResultForm({ ...resultForm, student: event.target.value })}>
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{getStudentLabel(student)}</option>
                ))}
              </select>
              <select className="w-full border rounded-lg px-3 py-2" value={resultForm.classRoom} onChange={(event) => setResultForm({ ...resultForm, classRoom: event.target.value })}>
                <option value="">Select Class</option>
                {classRooms.map((classRoom) => (
                  <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                ))}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Exam Name" value={resultForm.examName} onChange={(event) => setResultForm({ ...resultForm, examName: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Term" value={resultForm.term} onChange={(event) => setResultForm({ ...resultForm, term: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Percentage" value={resultForm.percentage} onChange={(event) => setResultForm({ ...resultForm, percentage: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Grade" value={resultForm.grade} onChange={(event) => setResultForm({ ...resultForm, grade: event.target.value })} />
              <button onClick={saveResultRecord} className="bg-primary-700 text-white px-4 py-2 rounded-lg">
                {editingResultId ? "Update Result" : "Save Result"}
              </button>
            </div>
            <div className="space-y-3">
              {results.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.examName}</h3>
                    <p className="text-sm text-slate-600">{item.term}</p>
                    <p className="text-sm text-slate-500">{item.percentage}% | {item.grade}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editResultRecord(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                    <button onClick={() => deleteResultRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "materials" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Add Study Material</h2>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={materialForm.title} onChange={(event) => setMaterialForm({ ...materialForm, title: event.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Description" value={materialForm.description} onChange={(event) => setMaterialForm({ ...materialForm, description: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={materialForm.classRoom} onChange={(event) => setMaterialForm({ ...materialForm, classRoom: event.target.value })}>
                <option value="">Select Class</option>
                {classRooms.map((classRoom) => (
                  <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                ))}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Subject" value={materialForm.subject} onChange={(event) => setMaterialForm({ ...materialForm, subject: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="File URL" value={materialForm.fileUrl} onChange={(event) => setMaterialForm({ ...materialForm, fileUrl: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={materialForm.uploadedBy} onChange={(event) => setMaterialForm({ ...materialForm, uploadedBy: event.target.value })}>
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>{getTeacherLabel(teacher)}</option>
                ))}
              </select>
              <button onClick={saveMaterialRecord} className="bg-primary-700 text-white px-4 py-2 rounded-lg">
                {editingMaterialId ? "Update Material" : "Add Material"}
              </button>
            </div>
            <div className="space-y-3">
              {materials.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.subject}</p>
                    <p className="text-sm text-slate-500">{item.fileUrl || "No file URL"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editMaterialRecord(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                    <button onClick={() => deleteMaterialRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "fees" && (
          <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                ["structure", "Fee Structure"],
                ["collection", "Fee Collection"],
                ["reports", "Fee Reports"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFeeSubTab(value)}
                  className={`rounded-full px-4 py-2 text-sm ${feeSubTab === value ? "bg-primary-700 text-white" : "bg-white text-slate-700 shadow-soft"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {feeSubTab === "structure" && (
              <div className="grid xl:grid-cols-[420px_1fr] gap-4">
                <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl">{editingFeeStructureId ? "Edit Fee Structure" : "Create Fee Structure"}</h2>
                    {editingFeeStructureId ? <button type="button" onClick={resetFeeStructureForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
                  </div>
                  <select className="w-full border rounded-lg px-3 py-2" value={feeStructureForm.classRoom} onChange={(event) => {
                    const selectedClass = classRooms.find((classRoom) => classRoom._id === event.target.value);
                    setFeeStructureForm((current) => ({
                      ...current,
                      classRoom: event.target.value,
                      className: selectedClass ? `${selectedClass.name} - ${selectedClass.section}` : current.className,
                      academicYear: selectedClass?.academicYear || current.academicYear,
                    }));
                  }}>
                    <option value="">Select Class (optional)</option>
                    {classRooms.map((classRoom) => (
                      <option key={classRoom._id} value={classRoom._id}>{classRoom.name} - {classRoom.section}</option>
                    ))}
                  </select>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="Class Name" value={feeStructureForm.className} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, className: event.target.value })} />
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="Academic Year" value={feeStructureForm.academicYear} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, academicYear: event.target.value })} />
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input type="checkbox" checked={feeStructureForm.transportEnabled} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, transportEnabled: event.target.checked })} />
                    Transport Enabled
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Tuition Fee (per month)" value={feeStructureForm.tuitionFee} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, tuitionFee: event.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Transport Fee (per month)" value={feeStructureForm.transportFee} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, transportFee: event.target.value })} disabled={!feeStructureForm.transportEnabled} />
                    <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Library Fee (per month)" value={feeStructureForm.libraryFee} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, libraryFee: event.target.value })} />
                    <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Exam Fee (per month)" value={feeStructureForm.examFee} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, examFee: event.target.value })} />
                  </div>
                  <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Other Charges (per month)" value={feeStructureForm.otherCharges} onChange={(event) => setFeeStructureForm({ ...feeStructureForm, otherCharges: event.target.value })} />
                  <div className="grid sm:grid-cols-2 gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-900">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-primary-700">Total Monthly Fee</p>
                      <p className="mt-1 text-lg font-semibold">INR {[
                      feeStructureForm.tuitionFee,
                      feeStructureForm.transportEnabled ? feeStructureForm.transportFee : 0,
                      feeStructureForm.libraryFee,
                      feeStructureForm.examFee,
                      feeStructureForm.otherCharges,
                    ].reduce((sum, item) => sum + Number(item || 0), 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-primary-700">Total Yearly Fee</p>
                      <p className="mt-1 text-lg font-semibold">INR {([
                        feeStructureForm.tuitionFee,
                        feeStructureForm.transportEnabled ? feeStructureForm.transportFee : 0,
                        feeStructureForm.libraryFee,
                        feeStructureForm.examFee,
                        feeStructureForm.otherCharges,
                      ].reduce((sum, item) => sum + Number(item || 0), 0) * 12)}
                      </p>
                    </div>
                  </div>
                  <button onClick={saveFeeStructure} className="bg-primary-700 text-white px-4 py-2 rounded-lg">
                    {editingFeeStructureId ? "Update Fee Structure" : "Save Fee Structure"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-soft overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead>
                        <tr className="border-b text-left text-slate-500">
                          <th className="py-2 pr-3">Class</th>
                          <th className="py-2 pr-3">Academic Year</th>
                          <th className="py-2 pr-3">Monthly Breakdown</th>
                          <th className="py-2 pr-3">Monthly / Yearly</th>
                          <th className="py-2 pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeStructures.map((structure) => (
                          <tr key={structure._id} className="border-b last:border-b-0">
                            <td className="py-3 pr-3">{structure.className}</td>
                            <td className="py-3 pr-3">{structure.academicYear}</td>
                            <td className="py-3 pr-3 text-xs text-slate-500">
                              Tuition {structure.tuitionFee} · Transport {structure.transportEnabled ? structure.transportFee : 0} · Library {structure.libraryFee} · Exam {structure.examFee} · Other {structure.otherCharges}
                            </td>
                            <td className="py-3 pr-3 font-semibold">
                              <p>INR {structure.totalMonthlyFee}</p>
                              <p className="text-xs text-slate-500">Yearly INR {structure.totalYearlyFee}</p>
                            </td>
                            <td className="py-3 pr-3">
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => editFeeStructure(structure)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                                <button onClick={() => removeFeeStructure(structure._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl">Assign Fee Structure to Student</h3>
                      <span className="text-xs text-slate-500">Use this to map yearly fees student-by-student.</span>
                    </div>
                    <div className="grid lg:grid-cols-[1fr_220px_150px] gap-3 items-start">
                      <div className="space-y-2 max-h-72 overflow-auto pr-1">
                        {feeStudents.map((student) => (
                          <article key={student._id} className="rounded-xl border border-slate-100 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{student.user?.name}</p>
                                <p className="text-sm text-slate-500">{student.rollNumber || student.admissionNumber}</p>
                                <p className="text-xs text-slate-500">{student.classRoom ? `${student.classRoom.name} - ${student.classRoom.section}` : "No class assigned"}</p>
                              </div>
                              <div className="text-right text-xs">
                                <p className="font-medium capitalize">{student.feeSummary?.paymentStatus || "pending"}</p>
                                <p>Balance INR {student.feeSummary?.remainingBalance || 0}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <select
                                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                value={student.assignedFeeStructure?._id || ""}
                                onChange={(event) => assignStudentFeeStructure(student._id, event.target.value)}
                              >
                                <option value="">Assign structure</option>
                                {feeStructures.map((structure) => (
                                  <option key={structure._id} value={structure._id}>
                                    {structure.className} · INR {structure.totalFee}
                                  </option>
                                ))}
                              </select>
                              <button type="button" onClick={() => {
                                setFeeSubTab("collection");
                                setSelectedFeeStudentId(student._id);
                              }} className="rounded-lg bg-primary-50 px-3 py-2 text-primary-700 text-sm">
                                Collect Fee
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {feeSubTab === "collection" && (
              <div className="grid xl:grid-cols-[360px_1fr] gap-4">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
                    <h2 className="font-display text-xl">Student Lookup</h2>
                    <input
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Search by name, roll or admission number"
                      value={feeStudentSearch}
                      onChange={(event) => setFeeStudentSearch(event.target.value)}
                    />
                    <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                      {feeStudents.map((student) => (
                        <button
                          key={student._id}
                          type="button"
                          onClick={() => {
                            setSelectedFeeStudentId(student._id);
                            setSelectedReceipt(null);
                          }}
                          className={`w-full rounded-xl border px-3 py-3 text-left ${selectedFeeStudent?._id === student._id ? "border-primary-600 bg-primary-50" : "border-slate-100 bg-slate-50"}`}
                        >
                          <p className="font-semibold">{student.user?.name}</p>
                          <p className="text-sm text-slate-500">{student.rollNumber || student.admissionNumber}</p>
                          <p className="text-xs text-slate-500">{student.classRoom ? `${student.classRoom.name} - ${student.classRoom.section}` : "No class assigned"}</p>
                          <p className="mt-2 text-xs font-medium text-slate-600">
                            Balance INR {student.feeSummary?.remainingBalance || 0}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-soft">
                    {selectedFeeStudent ? (
                      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
                        <div className="space-y-4">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <h2 className="font-display text-2xl text-primary-700">{selectedFeeStudent.user?.name}</h2>
                                <p className="text-sm text-slate-500">
                                  {selectedFeeStudent.classRoom ? `${selectedFeeStudent.classRoom.name} - ${selectedFeeStudent.classRoom.section}` : "No class assigned"} · Roll {selectedFeeStudent.rollNumber || "N/A"}
                                </p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${selectedFeeStudent.feeSummary?.remainingBalance > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                                {selectedFeeStudent.feeSummary?.paymentStatus || "pending"}
                              </span>
                            </div>
                            <div className="mt-4 grid sm:grid-cols-3 gap-3">
                              <FeeMetricCard label="Monthly Fee" value={`INR ${selectedFeeStudent.feeSummary?.totalMonthlyFee || 0}`} />
                              <FeeMetricCard label="Total Yearly Fee" value={`INR ${selectedFeeStudent.feeSummary?.totalYearlyFee || 0}`} />
                              <FeeMetricCard label="Total Due" value={`INR ${selectedFeeStudent.feeSummary?.remainingBalance || 0}`} />
                            </div>
                            <div className="mt-3 grid sm:grid-cols-2 gap-3">
                              <FeeMetricCard label="Amount Paid" value={`INR ${selectedFeeStudent.feeSummary?.amountPaid || 0}`} />
                              <FeeMetricCard label={`Expected Till ${selectedFeeStudent.feeSummary?.currentMonth || "Current Month"}`} value={`INR ${selectedFeeStudent.feeSummary?.expectedFeeUntilCurrentMonth || 0}`} />
                            </div>
                            {selectedFeeStudent.feeSummary?.currentMonthlyStructure ? (
                              <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                                <p className="font-semibold text-slate-800">Assigned Structure: {selectedFeeStudent.feeSummary.structure.className}</p>
                                <p className="mt-1">
                                  Tuition {selectedFeeStudent.feeSummary.currentMonthlyStructure.tuitionFee} · Transport {selectedFeeStudent.feeSummary.currentMonthlyStructure.transportEnabled ? selectedFeeStudent.feeSummary.currentMonthlyStructure.transportFee : 0} · Library {selectedFeeStudent.feeSummary.currentMonthlyStructure.libraryFee} · Exam {selectedFeeStudent.feeSummary.currentMonthlyStructure.examFee} · Other {selectedFeeStudent.feeSummary.currentMonthlyStructure.otherCharges}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Transport {selectedFeeStudent.feeSummary.currentMonthlyStructure.transportEnabled ? "Enabled" : "Disabled"} · Academic Year {selectedFeeStudent.feeSummary.academicYear}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                Assign a fee structure before recording any payment.
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl border border-slate-100 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-display text-xl">{editingFeePaymentId ? "Edit Payment Entry" : "Record New Payment"}</h3>
                              {editingFeePaymentId ? <button type="button" onClick={resetFeePaymentForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
                            </div>
                            <div className="mt-4 grid sm:grid-cols-2 gap-3">
                              <input className="w-full border rounded-lg px-3 py-2" type="date" value={feePaymentForm.paymentDate} onChange={(event) => setFeePaymentForm({ ...feePaymentForm, paymentDate: event.target.value })} />
                              <input className="w-full border rounded-lg px-3 py-2" placeholder="Payment Month" value={feePaymentForm.paymentMonth} onChange={(event) => setFeePaymentForm({ ...feePaymentForm, paymentMonth: event.target.value })} />
                              <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Amount Paid" value={feePaymentForm.amountPaid} onChange={(event) => setFeePaymentForm({ ...feePaymentForm, amountPaid: event.target.value })} />
                              <select className="w-full border rounded-lg px-3 py-2" value={feePaymentForm.paymentMethod} onChange={(event) => setFeePaymentForm({ ...feePaymentForm, paymentMethod: event.target.value })}>
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                                <option value="bank">Bank</option>
                              </select>
                              <div className="rounded-lg border bg-slate-50 px-3 py-2">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Receipt Number</p>
                                <p className="mt-1 text-sm font-medium text-slate-700">
                                  {editingFeePaymentId ? feePaymentForm.receiptNumber || "Unavailable" : "Auto-generated when payment is saved"}
                                </p>
                              </div>
                              <input className="w-full border rounded-lg px-3 py-2" placeholder="Academic Year" value={feePaymentForm.academicYear} onChange={(event) => setFeePaymentForm({ ...feePaymentForm, academicYear: event.target.value })} />
                            </div>
                            <p className="mt-3 text-sm text-slate-500">
                              Remaining balance after this payment: INR {Math.max((selectedFeeStudent.feeSummary?.remainingBalance || 0) - Number(feePaymentForm.amountPaid || 0), 0)}
                            </p>
                            <button onClick={saveFeePayment} className="mt-4 rounded-lg bg-primary-700 px-4 py-2 text-white">
                              {editingFeePaymentId ? "Update Payment Entry" : "Save Payment & Generate Receipt"}
                            </button>
                          </div>

                          <div className="rounded-xl border border-slate-100 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-display text-xl">Revise Student Fee Plan</h3>
                              <button type="button" onClick={resetFeeRevisionForm} className="text-sm text-slate-600 underline">Reset</button>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                              Use this for mid-session changes like removing transport, updating charges, or adding activity fees. Revisions apply only from the selected future month.
                            </p>
                            <div className="mt-4 grid sm:grid-cols-2 gap-3">
                              <select className="w-full border rounded-lg px-3 py-2" value={feeRevisionForm.effectiveMonth} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, effectiveMonth: event.target.value })}>
                                <option value="">Effective Month</option>
                                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((month, index) => (
                                  <option key={month} value={index + 1}>{month}</option>
                                ))}
                              </select>
                              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                                <input type="checkbox" checked={feeRevisionForm.transportEnabled} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, transportEnabled: event.target.checked })} />
                                Transport Enabled
                              </label>
                              <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Tuition Fee / month" value={feeRevisionForm.tuitionFee} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, tuitionFee: event.target.value })} />
                              <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Transport Fee / month" value={feeRevisionForm.transportFee} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, transportFee: event.target.value })} disabled={!feeRevisionForm.transportEnabled} />
                              <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Library Fee / month" value={feeRevisionForm.libraryFee} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, libraryFee: event.target.value })} />
                              <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Exam Fee / month" value={feeRevisionForm.examFee} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, examFee: event.target.value })} />
                              <input className="sm:col-span-2 w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Other Charges / month" value={feeRevisionForm.otherCharges} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, otherCharges: event.target.value })} />
                            </div>
                            <textarea className="mt-3 w-full border rounded-lg px-3 py-2" rows="3" placeholder="Reason for revision" value={feeRevisionForm.reason} onChange={(event) => setFeeRevisionForm({ ...feeRevisionForm, reason: event.target.value })} />
                            <div className="mt-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-900">
                              Revised Monthly Fee: INR {[
                                feeRevisionForm.tuitionFee,
                                feeRevisionForm.transportEnabled ? feeRevisionForm.transportFee : 0,
                                feeRevisionForm.libraryFee,
                                feeRevisionForm.examFee,
                                feeRevisionForm.otherCharges,
                              ].reduce((sum, item) => sum + Number(item || 0), 0)}
                            </div>
                            <button onClick={submitFeeRevision} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white">
                              Save Revision
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {selectedReceipt ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Latest Receipt</p>
                                  <h3 className="mt-2 font-display text-xl text-emerald-900">{selectedReceipt.receiptNumber}</h3>
                                  <p className="text-sm text-emerald-900">Amount Paid INR {selectedReceipt.amountPaid}</p>
                                  <p className="text-sm text-emerald-900">Remaining Balance INR {selectedReceipt.remainingBalance}</p>
                                </div>
                                <button type="button" onClick={() => printReceipt(selectedReceipt)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white">
                                  Print Receipt
                                </button>
                              </div>
                            </div>
                          ) : null}

                          <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-display text-xl">Revision History</h3>
                              <span className="text-xs text-slate-500">{selectedFeeStudent.feeSummary?.revisionHistory?.length || 0} revisions</span>
                            </div>
                            <div className="space-y-3">
                              {(selectedFeeStudent.feeSummary?.revisionHistory || []).length === 0 ? (
                                <p className="text-sm text-slate-500">No revisions recorded yet.</p>
                              ) : (
                                (selectedFeeStudent.feeSummary?.revisionHistory || []).map((revision) => (
                                  <article key={revision._id} className="rounded-xl border border-slate-100 p-4 text-sm">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold">Effective from month {revision.effectiveMonth}</p>
                                        <p className="text-slate-500">{new Date(revision.revisionDate).toLocaleDateString()}</p>
                                      </div>
                                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{revision.reason}</span>
                                    </div>
                                    <p className="mt-3 text-slate-600">
                                      Previous INR {revision.previousStructure.totalMonthlyFee} → Updated INR {revision.updatedStructure.totalMonthlyFee}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Transport {revision.updatedStructure.transportEnabled ? "Enabled" : "Disabled"} · Other Charges {revision.updatedStructure.otherCharges}
                                    </p>
                                  </article>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="font-display text-xl">Payment History</h3>
                              <span className="text-xs text-slate-500">{selectedFeeStudentPayments.length} entries</span>
                            </div>
                            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                              {selectedFeeStudentPayments.length === 0 ? (
                                <p className="text-sm text-slate-500">No payments recorded yet.</p>
                              ) : (
                                selectedFeeStudentPayments.map((payment) => (
                                  <article key={payment._id} className="rounded-xl border border-slate-100 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold">{payment.receiptNumber}</p>
                                        <p className="text-sm text-slate-500">{new Date(payment.paymentDate).toLocaleDateString()} · {payment.paymentMonth} · {payment.paymentMethod}</p>
                                      </div>
                                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${payment.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                                        {payment.paymentStatus}
                                      </span>
                                    </div>
                                    <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                                      <p>Amount Paid: INR {payment.amountPaid}</p>
                                      <p>Remaining: INR {payment.remainingBalance}</p>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <button type="button" onClick={() => editFeePayment(payment)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                                      <button type="button" onClick={() => removeFeePayment(payment._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                                      <button type="button" onClick={() => printReceipt(payment)} className="rounded-lg bg-primary-50 px-3 py-1 text-primary-700">Receipt</button>
                                    </div>
                                  </article>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500">Select a student to manage fee collection.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {feeSubTab === "reports" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-soft space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl">Session Backup and History Cleanup</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Export fee transactions to Excel before deleting old session history. Deletion stays locked until the selected backup is generated.
                      </p>
                    </div>
                    {feeHistoryBackup ? (
                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <p className="font-semibold">Backup ready</p>
                        <p>{feeHistoryBackup.fileName}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-[220px_1fr_auto_auto] md:items-end">
                    <div>
                      <label className="mb-1 block text-sm text-slate-600">Academic Session</label>
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={feeHistoryFilters.academicYear}
                        onChange={(event) => setFeeHistoryFilters((current) => ({ ...current, academicYear: event.target.value }))}
                      >
                        {feeAcademicYearOptions.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-600">Class</label>
                      <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={feeHistoryFilters.classRoomId}
                        onChange={(event) => setFeeHistoryFilters((current) => ({ ...current, classRoomId: event.target.value }))}
                      >
                        <option value="all">All Classes</option>
                        {classRooms.map((classRoom) => (
                          <option key={classRoom._id} value={classRoom._id}>
                            {classRoom.name} - {classRoom.section}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={exportFeeHistory}
                      className="rounded-lg bg-primary-700 px-4 py-2 text-white"
                    >
                      Export to Excel
                    </button>
                    <button
                      type="button"
                      onClick={deleteFeeHistory}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white"
                    >
                      Delete Session History
                    </button>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-semibold">Selected archive scope</p>
                    <p className="mt-1 capitalize">{feeHistoryFilterLabel}</p>
                    <p className="mt-2">
                      This will permanently remove fee transaction history from the database. Please ensure the Excel backup has been downloaded.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <StatCard label="Total Collected" value={`INR ${feeReports?.totals?.totalCollected || 0}`} />
                  <StatCard label="Payments Logged" value={feeReports?.totals?.totalPayments || 0} />
                  <StatCard label="Pending Students" value={feeReports?.totals?.pendingStudents || 0} />
                </div>

                <div className="grid xl:grid-cols-2 gap-4">
                  <ReportPanel title="Daily Collection" rows={feeReports?.dailyCollections || []} />
                  <ReportPanel title="Monthly Collection" rows={feeReports?.monthlyCollections || []} />
                  <ReportPanel title="Yearly Collection" rows={feeReports?.yearlyCollections || []} />
                  <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
                    <h3 className="font-display text-xl">Class-wise Fee Report</h3>
                    <div className="space-y-2">
                      {(feeReports?.classWiseCollections || []).map((row) => (
                        <article key={row.className} className="rounded-xl bg-slate-50 p-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{row.className}</p>
                            <span>{row.studentCount} students</span>
                          </div>
                          <p className="mt-2 text-slate-600">Collected INR {row.amountPaid} · Pending INR {row.remainingBalance} · Total INR {row.totalFee}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-soft overflow-x-auto">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl">Pending Fee Report</h3>
                    <span className="text-sm text-slate-500">{feeReports?.pendingStudents?.length || 0} pending students</span>
                  </div>
                  <table className="mt-4 w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-slate-500">
                        <th className="py-2 pr-3">Student</th>
                        <th className="py-2 pr-3">Class</th>
                        <th className="py-2 pr-3">Academic Year</th>
                        <th className="py-2 pr-3">Paid</th>
                        <th className="py-2 pr-3">Balance</th>
                        <th className="py-2 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(feeReports?.pendingStudents || []).map((student) => (
                        <tr key={student._id} className="border-b last:border-b-0">
                          <td className="py-3 pr-3">
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.rollNumber || student.admissionNumber}</p>
                          </td>
                          <td className="py-3 pr-3">{student.className}</td>
                          <td className="py-3 pr-3">{student.academicYear}</td>
                          <td className="py-3 pr-3">INR {student.amountPaid}</td>
                          <td className="py-3 pr-3 font-semibold text-amber-700">INR {student.remainingBalance}</td>
                          <td className="py-3 pr-3">
                            <button
                              type="button"
                              onClick={() => {
                                setFeeSubTab("collection");
                                setSelectedFeeStudentId(student._id);
                              }}
                              className="rounded-lg bg-primary-50 px-3 py-1 text-primary-700"
                            >
                              Collect Fee
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "notifications" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <h2 className="font-display text-xl">Post Notification</h2>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={notificationForm.title} onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Message" value={notificationForm.message} onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })} />
              <button onClick={createNotificationItem} className="bg-primary-700 text-white px-4 py-2 rounded-lg">Publish Notification</button>
            </div>
            <div className="space-y-3">
              {notifications.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.message}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "downloads" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingDownloadIndex !== null ? "Edit Download" : "Add Download"}</h2>
                {editingDownloadIndex !== null ? <button type="button" onClick={resetDownloadForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={downloadForm.title} onChange={(event) => setDownloadForm({ ...downloadForm, title: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Category" value={downloadForm.category} onChange={(event) => setDownloadForm({ ...downloadForm, category: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="File URL" value={downloadForm.fileUrl} onChange={(event) => setDownloadForm({ ...downloadForm, fileUrl: event.target.value })} />
              <button onClick={saveDownload} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingDownloadIndex !== null ? "Update Download" : "Save Download"}</button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-3">
              {(content.downloads || []).map((item, index) => (
                <article key={`${item.title}-${index}`} className="rounded-xl border border-slate-100 p-4 flex justify-between items-start gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-primary-700">{item.category}</p>
                    <h3 className="mt-1 font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 break-all">{item.fileUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editDownload(item, index)} className="text-amber-700 text-sm">Edit</button>
                    <button onClick={() => deleteDownload(index)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "gallery" && (
          <section className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <h2 className="font-display text-xl">Upload Photos</h2>
              <input className="mt-3 border rounded-lg px-3 py-2 w-full md:w-auto" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Title" />
              <input className="mt-3 block" type="file" multiple accept="image/*" onChange={handleFileChange} />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                {preview.map((src) => <img key={src} src={src} alt="preview" className="h-24 w-full object-cover rounded" />)}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={handleUpload} className="bg-primary-700 text-white px-4 py-2 rounded-lg">Upload</button>
                {editingGalleryId ? <button onClick={saveGalleryTitle} className="bg-amber-500 text-white px-4 py-2 rounded-lg">Update Title</button> : null}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <article key={item._id} className="bg-white rounded-xl overflow-hidden shadow-soft">
                  <img src={item.imageUrl} alt={item.title} className="h-44 w-full object-cover" />
                  <div className="p-3 flex justify-between items-center">
                    <p className="text-sm">{item.title}</p>
                    <div className="flex gap-2">
                      <button onClick={() => editGalleryItem(item)} className="text-amber-700 text-sm">Edit</button>
                      <button onClick={() => deleteGalleryItem(item._id)} className="text-red-600 text-sm">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "notices" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingNoticeId ? "Edit Announcement" : "Add Announcement"}</h2>
                {editingNoticeId ? <button type="button" onClick={resetNoticeForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Description" value={noticeForm.description} onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={noticeForm.isPinned} onChange={(e) => setNoticeForm({ ...noticeForm, isPinned: e.target.checked })} />
                Pin notice
              </label>
              <button onClick={saveNotice} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingNoticeId ? "Update Announcement" : "Save Announcement"}</button>
            </div>
            <div className="space-y-3">
              {notices.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editNotice(item)} className="text-amber-700 text-sm">Edit</button>
                    <button onClick={() => deleteNotice(item._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "events" && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingEventId ? "Edit Event" : "Add Event"}</h2>
                {editingEventId ? <button type="button" onClick={resetEventForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              <textarea className="w-full border rounded-lg px-3 py-2" rows="4" placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              <input type="date" className="w-full border rounded-lg px-3 py-2" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
              <button onClick={saveEvent} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingEventId ? "Update Event" : "Save Event"}</button>
            </div>
            <div className="space-y-3">
              {events.map((item) => (
                <article key={item._id} className="bg-white p-4 rounded-xl shadow-soft flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-slate-500">{new Date(item.eventDate).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editEvent(item)} className="text-amber-700 text-sm">Edit</button>
                    <button onClick={() => deleteEvent(item._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "content" && (
          <section className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-soft">
              <h2 className="font-display text-2xl">Website Content CMS</h2>
              <p className="mt-2 text-sm text-slate-600">Control homepage text, statistics, and section images from one place.</p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="bg-white p-5 rounded-xl shadow-soft space-y-3">
                <h3 className="font-display text-xl text-primary-700">Hero Section</h3>
                <label className="text-sm text-slate-600">Tagline</label>
                <input className="w-full border rounded-lg px-3 py-2" value={content.tagline || ""} onChange={(e) => setContent({ ...content, tagline: e.target.value })} />
                <div className="grid md:grid-cols-3 gap-3">
                  {["Students", "Faculty", "Board Results"].map((label, index) => (
                    <div key={label}>
                      <label className="text-sm text-slate-600">{label} Statistic</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2"
                        value={content.highlights?.[index]?.value || ""}
                        onChange={(e) => {
                          const highlights = [...(content.highlights || [])];
                          highlights[index] = { title: label, value: e.target.value };
                          setContent({ ...content, highlights });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <ImageManagerCard
                  title="Hero Image"
                  imageUrl={content.heroImageUrl}
                  previewUrl={contentImagePreviews.heroImage}
                  onFileChange={(file) => handleContentImageChange("heroImage", file)}
                  onUpload={() => uploadContentImage("heroImage")}
                  onDelete={() => deleteContentImage("heroImage")}
                />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-3">
                <h3 className="font-display text-xl text-primary-700">About Section</h3>
                <label className="text-sm text-slate-600">School History Title</label>
                <input className="w-full border rounded-lg px-3 py-2" value={content.schoolHistoryTitle || ""} onChange={(e) => setContent({ ...content, schoolHistoryTitle: e.target.value })} />
                <label className="text-sm text-slate-600">About History Text</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows="6" value={content.aboutHistory || ""} onChange={(e) => setContent({ ...content, aboutHistory: e.target.value })} />
                <ImageManagerCard
                  title="About Section Image"
                  imageUrl={content.aboutImageUrl}
                  previewUrl={contentImagePreviews.aboutImage}
                  onFileChange={(file) => handleContentImageChange("aboutImage", file)}
                  onUpload={() => uploadContentImage("aboutImage")}
                  onDelete={() => deleteContentImage("aboutImage")}
                />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-3">
                <h3 className="font-display text-xl text-primary-700">Mission and Vision</h3>
                <label className="text-sm text-slate-600">Mission</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows="4" value={content.mission || ""} onChange={(e) => setContent({ ...content, mission: e.target.value })} />
                <label className="text-sm text-slate-600">Vision</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows="4" value={content.vision || ""} onChange={(e) => setContent({ ...content, vision: e.target.value })} />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-3">
                <h3 className="font-display text-xl text-primary-700">Principal Section</h3>
                <label className="text-sm text-slate-600">Principal Name</label>
                <input className="w-full border rounded-lg px-3 py-2" value={content.principalName || ""} onChange={(e) => setContent({ ...content, principalName: e.target.value })} />
                <label className="text-sm text-slate-600">Principal Message</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows="5" value={content.principalMessage || ""} onChange={(e) => setContent({ ...content, principalMessage: e.target.value })} />
                <ImageManagerCard
                  title="Principal Photo"
                  imageUrl={content.principalPhotoUrl}
                  previewUrl={contentImagePreviews.principalPhoto}
                  onFileChange={(file) => handleContentImageChange("principalPhoto", file)}
                  onUpload={() => uploadContentImage("principalPhoto")}
                  onDelete={() => deleteContentImage("principalPhoto")}
                />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-3 xl:col-span-2">
                <h3 className="font-display text-xl text-primary-700">Contact Section</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600">Email</label>
                    <input className="w-full border rounded-lg px-3 py-2" value={content.contactEmail || ""} onChange={(e) => setContent({ ...content, contactEmail: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Phone</label>
                    <input className="w-full border rounded-lg px-3 py-2" value={content.contactPhone || ""} onChange={(e) => setContent({ ...content, contactPhone: e.target.value })} />
                  </div>
                </div>
                <label className="text-sm text-slate-600">Address</label>
                <input className="w-full border rounded-lg px-3 py-2" value={content.address || ""} onChange={(e) => setContent({ ...content, address: e.target.value })} />
                <label className="text-sm text-slate-600">Google Map Embed URL</label>
                <input className="w-full border rounded-lg px-3 py-2" value={content.googleMapEmbedUrl || ""} onChange={(e) => setContent({ ...content, googleMapEmbedUrl: e.target.value })} />
                <ImageManagerCard
                  title="Contact Section Image"
                  imageUrl={content.contactImageUrl}
                  previewUrl={contentImagePreviews.contactImage}
                  onFileChange={(file) => handleContentImageChange("contactImage", file)}
                  onUpload={() => uploadContentImage("contactImage")}
                  onDelete={() => deleteContentImage("contactImage")}
                />
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-3 xl:col-span-2">
                <h3 className="font-display text-xl text-primary-700">Admission Template</h3>
                <p className="text-sm text-slate-600">Manage the public download template used on the admissions page.</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="block"
                  onChange={(e) => setAdmissionTemplateFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={uploadAdmissionTemplate}
                    className="bg-primary-700 text-white px-4 py-2 rounded-lg"
                  >
                    Upload Template
                  </button>
                  {content.admissionTemplateUrl ? (
                    <a
                      href={content.admissionTemplateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-700 underline text-sm self-center"
                    >
                      View current template
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-4 xl:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-primary-700">Facilities Section</h3>
                    <p className="text-sm text-slate-600">Manage the "Why Choose Our School" cards shown on the homepage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContent((current) => ({ ...current, facilities: [...(current.facilities || []), { title: "", body: "" }] }))}
                    className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Facility
                  </button>
                </div>
                <div className="space-y-4">
                  {(content.facilities || []).map((item, index) => (
                    <ContentListCard
                      key={`facility-${index}`}
                      title={`Facility ${index + 1}`}
                      onRemove={() =>
                        setContent((current) => ({
                          ...current,
                          facilities: (current.facilities || []).filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <label className="text-sm text-slate-600">Title</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2"
                        value={item.title || ""}
                        onChange={(e) =>
                          setContent((current) => ({
                            ...current,
                            facilities: (current.facilities || []).map((facility, itemIndex) =>
                              itemIndex === index ? { ...facility, title: e.target.value } : facility
                            ),
                          }))
                        }
                      />
                      <label className="text-sm text-slate-600">Description</label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2"
                        rows="3"
                        value={item.body || ""}
                        onChange={(e) =>
                          setContent((current) => ({
                            ...current,
                            facilities: (current.facilities || []).map((facility, itemIndex) =>
                              itemIndex === index ? { ...facility, body: e.target.value } : facility
                            ),
                          }))
                        }
                      />
                    </ContentListCard>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-4 xl:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-primary-700">Testimonials Section</h3>
                    <p className="text-sm text-slate-600">Manage testimonials shown on the homepage.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContent((current) => ({ ...current, testimonials: [...(current.testimonials || []), { quote: "", author: "", role: "" }] }))}
                    className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Testimonial
                  </button>
                </div>
                <div className="space-y-4">
                  {(content.testimonials || []).map((item, index) => (
                    <ContentListCard
                      key={`testimonial-${index}`}
                      title={`Testimonial ${index + 1}`}
                      onRemove={() =>
                        setContent((current) => ({
                          ...current,
                          testimonials: (current.testimonials || []).filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <label className="text-sm text-slate-600">Quote</label>
                      <textarea
                        className="w-full border rounded-lg px-3 py-2"
                        rows="4"
                        value={item.quote || ""}
                        onChange={(e) =>
                          setContent((current) => ({
                            ...current,
                            testimonials: (current.testimonials || []).map((testimonial, itemIndex) =>
                              itemIndex === index ? { ...testimonial, quote: e.target.value } : testimonial
                            ),
                          }))
                        }
                      />
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-slate-600">Author</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={item.author || ""}
                            onChange={(e) =>
                              setContent((current) => ({
                                ...current,
                                testimonials: (current.testimonials || []).map((testimonial, itemIndex) =>
                                  itemIndex === index ? { ...testimonial, author: e.target.value } : testimonial
                                ),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-600">Role</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={item.role || ""}
                            onChange={(e) =>
                              setContent((current) => ({
                                ...current,
                                testimonials: (current.testimonials || []).map((testimonial, itemIndex) =>
                                  itemIndex === index ? { ...testimonial, role: e.target.value } : testimonial
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </ContentListCard>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-soft space-y-4 xl:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl text-primary-700">Public Fee Structure</h3>
                    <p className="text-sm text-slate-600">Manage the fee overview cards shown on the public fees page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContent((current) => ({ ...current, feeStructure: [...(current.feeStructure || []), { label: "", amount: "", note: "" }] }))}
                    className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Fee Item
                  </button>
                </div>
                <div className="space-y-4">
                  {(content.feeStructure || []).map((item, index) => (
                    <ContentListCard
                      key={`fee-structure-${index}`}
                      title={`Fee Card ${index + 1}`}
                      onRemove={() =>
                        setContent((current) => ({
                          ...current,
                          feeStructure: (current.feeStructure || []).filter((_, itemIndex) => itemIndex !== index),
                        }))
                      }
                    >
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm text-slate-600">Label</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={item.label || ""}
                            onChange={(e) =>
                              setContent((current) => ({
                                ...current,
                                feeStructure: (current.feeStructure || []).map((feeItem, itemIndex) =>
                                  itemIndex === index ? { ...feeItem, label: e.target.value } : feeItem
                                ),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-600">Amount</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={item.amount || ""}
                            onChange={(e) =>
                              setContent((current) => ({
                                ...current,
                                feeStructure: (current.feeStructure || []).map((feeItem, itemIndex) =>
                                  itemIndex === index ? { ...feeItem, amount: e.target.value } : feeItem
                                ),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-600">Note</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={item.note || ""}
                            onChange={(e) =>
                              setContent((current) => ({
                                ...current,
                                feeStructure: (current.feeStructure || []).map((feeItem, itemIndex) =>
                                  itemIndex === index ? { ...feeItem, note: e.target.value } : feeItem
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </ContentListCard>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={saveContent} className="bg-primary-700 text-white px-5 py-3 rounded-lg">Save All Content Changes</button>
          </section>
        )}
      </div>

      {confirmDialog.open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-2xl text-slate-900">{confirmDialog.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{confirmDialog.message}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmDialog}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runConfirmDialog}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="bg-white p-5 rounded-xl shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-display text-primary-700 mt-2">{value}</p>
    </article>
  );
}

function FeeMetricCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-display text-primary-700">{value}</p>
    </article>
  );
}

function ReportPanel({ title, rows }) {
  return (
    <article className="bg-white p-4 rounded-xl shadow-soft space-y-3">
      <h3 className="font-display text-xl">{title}</h3>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No collection data yet.</p>
        ) : (
          rows.slice(0, 8).map((row) => (
            <div key={`${title}-${row.key}`} className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{row.key}</p>
                <p>INR {row.totalCollected}</p>
              </div>
              <p className="mt-1 text-slate-500">{row.payments} payment entries</p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function ImageManagerCard({ title, imageUrl, previewUrl, onFileChange, onUpload, onDelete }) {
  return (
    <div className="border rounded-lg p-3 bg-slate-50 space-y-3">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="grid sm:grid-cols-[140px_1fr] gap-3 items-start">
        <div className="h-28 w-full overflow-hidden rounded-lg bg-slate-200">
          {previewUrl || imageUrl ? (
            <img src={previewUrl || imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">No image</div>
          )}
        </div>
        <div className="space-y-2">
          <input type="file" accept="image/*" className="block" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onUpload} className="bg-primary-700 text-white px-4 py-2 rounded-lg text-sm">
              Upload / Replace
            </button>
            <button type="button" onClick={onDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentListCard({ title, onRemove, children }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-800">{title}</p>
        <button type="button" onClick={onRemove} className="text-sm text-red-600">
          Remove
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}


