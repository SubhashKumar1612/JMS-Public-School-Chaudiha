const express = require("express");
const {
  getAdminSummary,
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  listParents,
  createParent,
  listClassRooms,
  createClassRoom,
  updateClassRoom,
  deleteClassRoom,
  listAdmissions,
  createAdmission,
  updateAdmission,
  approveAdmission,
  rejectAdmission,
  deleteAdmission,
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listResults,
  upsertResult,
  deleteResult,
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  assignFeeStructureToStudent,
  reviseStudentFeePlanRecord,
  listFeePayments,
  createFeePayment,
  updateFeePayment,
  deleteFeePayment,
  getStudentFeeDetails,
  getFeeReports,
  exportFeeTransactions,
  deleteFeeSessionHistory,
  listFees,
  listNotifications,
  createNotification,
  markAttendance,
  listAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/managementController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin", "teacher"));
router.get("/summary", authorize("admin"), getAdminSummary);

router.get("/students", authorize("admin"), listStudents);
router.post("/students", authorize("admin"), createStudent);
router.put("/students/:id", authorize("admin"), updateStudent);
router.delete("/students/:id", authorize("admin"), deleteStudent);

router.get("/teachers", authorize("admin"), listTeachers);
router.post("/teachers", authorize("admin"), createTeacher);
router.put("/teachers/:id", authorize("admin"), updateTeacher);
router.delete("/teachers/:id", authorize("admin"), deleteTeacher);

router.get("/parents", authorize("admin"), listParents);
router.post("/parents", authorize("admin"), createParent);

router.get("/classes", authorize("admin", "teacher"), listClassRooms);
router.post("/classes", authorize("admin"), createClassRoom);
router.put("/classes/:id", authorize("admin"), updateClassRoom);
router.delete("/classes/:id", authorize("admin"), deleteClassRoom);

router.get("/admissions", authorize("admin"), listAdmissions);
router.post("/admissions", authorize("admin"), createAdmission);
router.put("/admissions/:id", authorize("admin"), updateAdmission);
router.post("/admissions/:id/approve", authorize("admin"), approveAdmission);
router.post("/admissions/:id/reject", authorize("admin"), rejectAdmission);
router.delete("/admissions/:id", authorize("admin"), deleteAdmission);

router.get("/assignments", authorize("admin", "teacher"), listAssignments);
router.post("/assignments", authorize("admin", "teacher"), createAssignment);
router.put("/assignments/:id", authorize("admin", "teacher"), updateAssignment);
router.delete("/assignments/:id", authorize("admin", "teacher"), deleteAssignment);

router.get("/results", authorize("admin", "teacher"), listResults);
router.post("/results", authorize("admin", "teacher"), upsertResult);
router.put("/results/:id", authorize("admin", "teacher"), upsertResult);
router.delete("/results/:id", authorize("admin", "teacher"), deleteResult);

router.get("/materials", authorize("admin", "teacher"), listMaterials);
router.post("/materials", authorize("admin", "teacher"), createMaterial);
router.put("/materials/:id", authorize("admin", "teacher"), updateMaterial);
router.delete("/materials/:id", authorize("admin", "teacher"), deleteMaterial);

router.get("/fees", authorize("admin"), listFees);
router.get("/fees/reports", authorize("admin"), getFeeReports);
router.get("/fee-structures", authorize("admin"), listFeeStructures);
router.post("/fee-structures", authorize("admin"), createFeeStructure);
router.put("/fee-structures/:id", authorize("admin"), updateFeeStructure);
router.delete("/fee-structures/:id", authorize("admin"), deleteFeeStructure);
router.put("/students/:id/fee-structure", authorize("admin"), assignFeeStructureToStudent);
router.post("/students/:id/fee-plan/revise", authorize("admin"), reviseStudentFeePlanRecord);
router.get("/students/:id/fees", authorize("admin"), getStudentFeeDetails);
router.get("/fee-payments", authorize("admin"), listFeePayments);
router.get("/fee-payments/export", authorize("admin"), exportFeeTransactions);
router.post("/fee-payments", authorize("admin"), createFeePayment);
router.put("/fee-payments/:id", authorize("admin"), updateFeePayment);
router.delete("/fee-payments/:id", authorize("admin"), deleteFeePayment);
router.post("/fee-payments/session-history/delete", authorize("admin"), deleteFeeSessionHistory);

router.get("/notifications", authorize("admin", "teacher"), listNotifications);
router.post("/notifications", authorize("admin", "teacher"), createNotification);

router.get("/attendance", authorize("admin", "teacher"), listAttendance);
router.post("/attendance", authorize("admin", "teacher"), markAttendance);
router.put("/attendance/:id", authorize("admin", "teacher"), updateAttendance);
router.delete("/attendance/:id", authorize("admin", "teacher"), deleteAttendance);

module.exports = router;
