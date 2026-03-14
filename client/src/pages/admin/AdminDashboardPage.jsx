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
  const [fees, setFees] = useState([]);
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
  const [editingFeeId, setEditingFeeId] = useState(null);
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
  const [feeForm, setFeeForm] = useState({ student: "", term: "", amount: "", dueDate: "", status: "due" });
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
    feeDueCount: summary?.dues ?? fees.filter((fee) => fee.status !== "paid").length,
  }), [gallery.length, notices.length, events.length, messages.length, summary, students.length, teachers.length, parents.length, admissions.length, fees]);

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

  const resetFeeForm = () => {
    setEditingFeeId(null);
    setFeeForm({ student: "", term: "", amount: "", dueDate: "", status: "due" });
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
      const [gRes, nRes, eRes, cRes, mRes, summaryRes, studentsRes, teachersRes, parentsRes, classesRes, admissionsRes, assignmentsRes, attendanceRes, resultsRes, materialsRes, feesRes, notificationsRes] = await Promise.all([
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
        api.get("/management/fees"),
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
      setFees(feesRes.data || []);
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

  const saveFeeRecord = async () => {
    if (!feeForm.student || !feeForm.term || !feeForm.amount || !feeForm.dueDate) {
      return toast.error("Student, term, amount, and due date are required.");
    }

    try {
      const payload = {
        ...feeForm,
        amount: Number(feeForm.amount),
      };
      if (editingFeeId) {
        await api.put(`/management/fees/${editingFeeId}`, payload);
        toast.success("Fee record updated.");
      } else {
        await api.post("/management/fees", payload);
        toast.success("Fee record created.");
      }
      resetFeeForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save fee record.");
    }
  };

  const editFeeRecord = (fee) => {
    setEditingFeeId(fee._id);
    setFeeForm({
      student: fee.student?._id || "",
      term: fee.term || "",
      amount: String(fee.amount || ""),
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : "",
      status: fee.status || "due",
    });
  };

  const deleteFeeRecord = async (id) => {
    if (!window.confirm("Delete this fee record?")) return;
    try {
      await api.delete(`/management/fees/${id}`);
      toast.success("Fee record deleted.");
      if (editingFeeId === id) resetFeeForm();
      await fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete fee record.");
    }
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
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-soft space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl">{editingFeeId ? "Edit Fee Record" : "Create Fee Record"}</h2>
                {editingFeeId ? <button type="button" onClick={resetFeeForm} className="text-sm text-slate-600 underline">Cancel Edit</button> : null}
              </div>
              <select className="w-full border rounded-lg px-3 py-2" value={feeForm.student} onChange={(event) => setFeeForm({ ...feeForm, student: event.target.value })}>
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{getStudentLabel(student)}</option>
                ))}
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Term" value={feeForm.term} onChange={(event) => setFeeForm({ ...feeForm, term: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" type="number" min="0" placeholder="Amount" value={feeForm.amount} onChange={(event) => setFeeForm({ ...feeForm, amount: event.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2" type="date" value={feeForm.dueDate} onChange={(event) => setFeeForm({ ...feeForm, dueDate: event.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={feeForm.status} onChange={(event) => setFeeForm({ ...feeForm, status: event.target.value })}>
                <option value="due">Due</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
              <button onClick={saveFeeRecord} className="bg-primary-700 text-white px-4 py-2 rounded-lg">{editingFeeId ? "Update Fee Record" : "Create Fee Record"}</button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-soft overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3">Term</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((item) => (
                    <tr key={item._id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">{item.student?.user?.name || item.student?.rollNumber || "Student"}</td>
                      <td className="py-3 pr-3">{item.term}</td>
                      <td className="py-3 pr-3">INR {item.amount}</td>
                      <td className="py-3 pr-3 capitalize">{item.status}</td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <button onClick={() => editFeeRecord(item)} className="rounded-lg bg-amber-100 px-3 py-1 text-amber-900">Edit</button>
                          <button onClick={() => deleteFeeRecord(item._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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


