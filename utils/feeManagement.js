const FeeStructure = require("../models/FeeStructure");
const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");

const toMoney = (value) => {
  const numericValue = Number(value || 0);
  return Number.isFinite(numericValue) ? Number(numericValue.toFixed(2)) : 0;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const buildClassLabel = (classRoom, fallbackClassName = "") => {
  if (classRoom?.name && classRoom?.section) return `${classRoom.name} - ${classRoom.section}`;
  if (classRoom?.name) return classRoom.name;
  return fallbackClassName || "Unassigned Class";
};

const normalizeSnapshot = (snapshot = {}) => {
  const transportEnabled = snapshot.transportEnabled !== false;
  const normalized = {
    className: snapshot.className || "",
    academicYear: snapshot.academicYear || "2026-27",
    tuitionFee: toMoney(snapshot.tuitionFee),
    transportFee: transportEnabled ? toMoney(snapshot.transportFee) : 0,
    libraryFee: toMoney(snapshot.libraryFee),
    examFee: toMoney(snapshot.examFee),
    otherCharges: toMoney(snapshot.otherCharges),
    transportEnabled,
    totalMonthlyFee: 0,
    totalYearlyFee: 0,
  };

  normalized.totalMonthlyFee = toMoney(
    normalized.tuitionFee +
      normalized.transportFee +
      normalized.libraryFee +
      normalized.examFee +
      normalized.otherCharges
  );
  normalized.totalYearlyFee = toMoney(normalized.totalMonthlyFee * 12);
  return normalized;
};

const createStructureSnapshot = (structure, student = null) =>
  normalizeSnapshot({
    className: structure?.className || buildClassLabel(student?.classRoom),
    academicYear: structure?.academicYear || student?.academicYear || student?.classRoom?.academicYear || "2026-27",
    tuitionFee: structure?.tuitionFee || 0,
    transportFee: structure?.transportFee || 0,
    libraryFee: structure?.libraryFee || 0,
    examFee: structure?.examFee || 0,
    otherCharges: structure?.otherCharges || 0,
    transportEnabled: structure?.transportEnabled !== false,
  });

const getFeeStructureForStudent = async (student) => {
  if (!student) return null;

  if (student.assignedFeeStructure?._id || student.assignedFeeStructure?.className) {
    return student.assignedFeeStructure;
  }

  const academicYear = student.academicYear || student.classRoom?.academicYear || "2026-27";
  const classLabel = buildClassLabel(student.classRoom);

  if (student.classRoom?._id) {
    const structureByClass = await FeeStructure.findOne({
      $or: [{ classRoom: student.classRoom._id }, { className: classLabel }],
      academicYear,
    }).sort({ updatedAt: -1 });
    if (structureByClass) return structureByClass;
  }

  if (!classLabel || classLabel === "Unassigned Class") return null;
  return FeeStructure.findOne({ className: classLabel, academicYear }).sort({ updatedAt: -1 });
};

const getStudentCurrentFeePlan = async (student) => {
  if (student?.feePlan?.overrideActive && student?.feePlan?.structureSnapshot?.className) {
    return {
      overrideActive: true,
      startMonth: student.feePlan.startMonth || 1,
      structureSnapshot: normalizeSnapshot(student.feePlan.structureSnapshot),
      revisions: (student.feePlan.revisions || [])
        .map((revision) => ({
          ...revision.toObject?.() || revision,
          previousStructure: normalizeSnapshot(revision.previousStructure),
          updatedStructure: normalizeSnapshot(revision.updatedStructure),
        }))
        .sort((first, second) => first.effectiveMonth - second.effectiveMonth),
    };
  }

  const structure = await getFeeStructureForStudent(student);
  if (!structure) return null;

  return {
    overrideActive: false,
    startMonth: 1,
    structureSnapshot: createStructureSnapshot(structure, student),
    revisions: [],
  };
};

const getStructureForMonth = (feePlan, monthNumber) => {
  if (!feePlan?.structureSnapshot) return null;
  let active = normalizeSnapshot(feePlan.structureSnapshot);

  (feePlan.revisions || [])
    .filter((revision) => Number(revision.effectiveMonth) <= monthNumber)
    .sort((first, second) => first.effectiveMonth - second.effectiveMonth)
    .forEach((revision) => {
      active = normalizeSnapshot(revision.updatedStructure);
    });

  return active;
};

const calculateProjectedYearlyFee = (feePlan) => {
  if (!feePlan?.structureSnapshot) return 0;
  let total = 0;
  for (let month = 1; month <= 12; month += 1) {
    total += getStructureForMonth(feePlan, month)?.totalMonthlyFee || 0;
  }
  return toMoney(total);
};

const calculateExpectedFeeUntilMonth = (feePlan, monthNumber) => {
  if (!feePlan?.structureSnapshot) return 0;
  let total = 0;
  for (let month = feePlan.startMonth || 1; month <= monthNumber; month += 1) {
    total += getStructureForMonth(feePlan, month)?.totalMonthlyFee || 0;
  }
  return toMoney(total);
};

const getStudentFeeSummary = async (studentDoc, options = {}) => {
  const student =
    studentDoc?.populate && !studentDoc.user
      ? await studentDoc.populate([
          { path: "user", select: "name email phone" },
          { path: "classRoom", select: "name section academicYear" },
          { path: "assignedFeeStructure" },
        ])
      : studentDoc;

  if (!student) return null;

  const feePlan = options.feePlan || (await getStudentCurrentFeePlan(student));
  const academicYear =
    options.academicYear ||
    feePlan?.structureSnapshot?.academicYear ||
    student.academicYear ||
    student.classRoom?.academicYear ||
    "2026-27";

  const payments =
    options.payments ||
    (await FeePayment.find({ studentId: student._id, academicYear })
      .sort({ paymentDate: -1, createdAt: -1 })
      .populate("createdBy", "name"));

  const currentMonthNumber = options.currentMonthNumber || new Date().getMonth() + 1;
  const projectedYearlyFee = calculateProjectedYearlyFee(feePlan);
  const expectedFeeUntilCurrentMonth = calculateExpectedFeeUntilMonth(feePlan, currentMonthNumber);
  const amountPaid = toMoney(payments.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0));
  const remainingBalance = toMoney(Math.max(projectedYearlyFee - amountPaid, 0));
  const paymentStatus =
    projectedYearlyFee === 0 ? "pending" : remainingBalance === 0 ? "paid" : amountPaid === 0 ? "pending" : "partial";

  return {
    studentId: student._id,
    academicYear,
    currentMonth: MONTH_NAMES[currentMonthNumber - 1],
    currentMonthNumber,
    structure: feePlan?.structureSnapshot ? normalizeSnapshot(feePlan.structureSnapshot) : null,
    currentMonthlyStructure: feePlan?.structureSnapshot ? getStructureForMonth(feePlan, currentMonthNumber) : null,
    totalMonthlyFee: feePlan?.structureSnapshot ? getStructureForMonth(feePlan, currentMonthNumber)?.totalMonthlyFee || 0 : 0,
    totalYearlyFee: projectedYearlyFee,
    totalFee: projectedYearlyFee,
    expectedFeeUntilCurrentMonth,
    amountPaid,
    remainingBalance,
    paymentStatus,
    usesStudentOverride: Boolean(feePlan?.overrideActive),
    revisionHistory: (feePlan?.revisions || []).map((revision) => ({
      _id: revision._id,
      studentId: revision.studentId || student._id,
      effectiveMonth: revision.effectiveMonth,
      revisionDate: revision.revisionDate,
      reason: revision.reason,
      previousStructure: normalizeSnapshot(revision.previousStructure),
      updatedStructure: normalizeSnapshot(revision.updatedStructure),
    })),
    paymentHistory: payments.map((payment) => ({
      _id: payment._id,
      paymentDate: payment.paymentDate,
      paymentMonth: payment.paymentMonth,
      amountPaid: toMoney(payment.amountPaid),
      paymentMethod: payment.paymentMethod,
      receiptNumber: payment.receiptNumber,
      paymentStatus: payment.paymentStatus,
      remainingBalance: toMoney(payment.remainingBalance),
      academicYear: payment.academicYear,
      createdBy: payment.createdBy || null,
    })),
  };
};

const syncStudentFeeStatus = async (studentId) => {
  const student = await Student.findById(studentId).populate("assignedFeeStructure").populate("classRoom", "name section academicYear");
  if (!student) return null;
  const summary = await getStudentFeeSummary(student);
  student.feeStatus = summary?.paymentStatus === "pending" ? "due" : summary?.paymentStatus || "due";
  await student.save();
  return summary;
};

const initializeStudentFeePlan = async (student, structure, overrides = {}) => {
  student.assignedFeeStructure = structure?._id || null;
  student.academicYear = structure?.academicYear || student.academicYear;

  if (overrides.overrideActive) {
    const snapshot = normalizeSnapshot({
      ...createStructureSnapshot(structure, student),
      ...overrides,
    });

    student.feePlan = {
      overrideActive: true,
      startMonth: overrides.startMonth || student.feePlan?.startMonth || 1,
      structureSnapshot: snapshot,
      revisions: [],
    };
    student.academicYear = snapshot.academicYear;
  } else if (!student.feePlan?.overrideActive) {
    student.feePlan = {
      overrideActive: false,
      startMonth: student.feePlan?.startMonth || 1,
      structureSnapshot: null,
      revisions: [],
    };
  }

  await student.save();
  return syncStudentFeeStatus(student._id);
};

const reviseStudentFeePlan = async (student, revision) => {
  const feePlan = await getStudentCurrentFeePlan(student);
  if (!feePlan?.structureSnapshot) {
    throw new Error("Student does not have an active fee plan.");
  }

  const effectiveMonth = Number(revision.effectiveMonth);
  if (!Number.isInteger(effectiveMonth) || effectiveMonth < 1 || effectiveMonth > 12) {
    throw new Error("Effective month must be between 1 and 12.");
  }

  const previousStructure = getStructureForMonth(feePlan, effectiveMonth);
  const updatedStructure = normalizeSnapshot({
    ...previousStructure,
    ...revision.updatedStructure,
    academicYear: revision.updatedStructure?.academicYear || previousStructure.academicYear,
  });

  const nextRevision = {
    studentId: student._id,
    effectiveMonth,
    revisionDate: revision.revisionDate || new Date(),
    reason: revision.reason || "",
    previousStructure,
    updatedStructure,
  };

  const existingRevisions = (student.feePlan?.revisions || []).filter(
    (item) => Number(item.effectiveMonth) !== effectiveMonth
  );
  student.feePlan = {
    overrideActive: true,
    startMonth: student.feePlan?.startMonth || 1,
    structureSnapshot: feePlan.structureSnapshot,
    revisions: [...existingRevisions, nextRevision].sort((first, second) => first.effectiveMonth - second.effectiveMonth),
  };
  student.academicYear = updatedStructure.academicYear;
  await student.save();
  return syncStudentFeeStatus(student._id);
};

module.exports = {
  MONTH_NAMES,
  toMoney,
  buildClassLabel,
  normalizeSnapshot,
  createStructureSnapshot,
  getFeeStructureForStudent,
  getStudentCurrentFeePlan,
  getStructureForMonth,
  calculateProjectedYearlyFee,
  calculateExpectedFeeUntilMonth,
  getStudentFeeSummary,
  syncStudentFeeStatus,
  initializeStudentFeePlan,
  reviseStudentFeePlan,
};
