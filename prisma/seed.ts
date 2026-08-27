import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, TokenStatus, VisitType } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const HASH_ROUNDS = 10;
const today = () => new Date().toISOString().slice(0, 10);

async function main() {
  console.log("Seeding QLess demo data...");

  await prisma.notificationLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.token.deleteMany();
  await prisma.queueSession.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();

  const password = await bcrypt.hash("Qless@123", HASH_ROUNDS);

  // --- Super Admin (platform-level, no hospital) --------------------------
  await prisma.user.create({
    data: {
      role: "SUPER_ADMIN",
      name: "QLess Platform Admin",
      email: "superadmin@qless.app",
      passwordHash: password,
    },
  });

  // --- Hospital 1: Sunrise Multispecialty Hospital -------------------------
  const sunrise = await prisma.hospital.create({
    data: {
      name: "Sunrise Multispecialty Hospital",
      slug: "sunrise-hospital",
      address: "14 MG Road, Bengaluru, Karnataka",
      phone: "+91 80 4000 1000",
      email: "contact@sunrisehospital.example",
      logoUrl: null,
      status: "ACTIVE",
      subscriptionPlan: "PREMIUM",
      doctorLimit: 20,
      subscriptionExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 300),
    },
  });

  const [cardiology, generalMed, pediatrics, orthopedics] = await Promise.all([
    prisma.department.create({ data: { hospitalId: sunrise.id, name: "Cardiology" } }),
    prisma.department.create({ data: { hospitalId: sunrise.id, name: "General Medicine" } }),
    prisma.department.create({ data: { hospitalId: sunrise.id, name: "Pediatrics" } }),
    prisma.department.create({ data: { hospitalId: sunrise.id, name: "Orthopedics" } }),
  ]);

  const hospitalAdmin = await prisma.user.create({
    data: {
      hospitalId: sunrise.id,
      role: "HOSPITAL_ADMIN",
      name: "Anita Rao",
      email: "admin@sunrisehospital.example",
      phone: "+91 98765 43210",
      passwordHash: password,
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      hospitalId: sunrise.id,
      role: "RECEPTIONIST",
      name: "Ramesh Kumar",
      email: "reception@sunrisehospital.example",
      phone: "+91 98765 43211",
      passwordHash: password,
    },
  });

  const workingHours = JSON.stringify({
    mon: ["09:00-13:00", "16:00-19:00"],
    tue: ["09:00-13:00", "16:00-19:00"],
    wed: ["09:00-13:00", "16:00-19:00"],
    thu: ["09:00-13:00", "16:00-19:00"],
    fri: ["09:00-13:00", "16:00-19:00"],
    sat: ["09:00-13:00"],
    sun: [],
  });

  const doctorSeed = [
    { name: "Dr. Meera Nair", dept: cardiology, spec: "Interventional Cardiologist", email: "meera.nair@sunrisehospital.example" },
    { name: "Dr. Arvind Sharma", dept: generalMed, spec: "General Physician", email: "arvind.sharma@sunrisehospital.example" },
    { name: "Dr. Priya Menon", dept: pediatrics, spec: "Pediatrician", email: "priya.menon@sunrisehospital.example" },
    { name: "Dr. Sanjay Gupta", dept: orthopedics, spec: "Orthopedic Surgeon", email: "sanjay.gupta@sunrisehospital.example" },
  ];

  const doctors = [];
  for (const d of doctorSeed) {
    const doctorUser = await prisma.user.create({
      data: {
        hospitalId: sunrise.id,
        role: "DOCTOR",
        name: d.name,
        email: d.email,
        passwordHash: password,
      },
    });
    const doctor = await prisma.doctor.create({
      data: {
        hospitalId: sunrise.id,
        departmentId: d.dept.id,
        userId: doctorUser.id,
        name: d.name,
        specialization: d.spec,
        maxTokensPerDay: 40,
        workingHours,
        status: "ACTIVE",
      },
    });
    doctors.push(doctor);
  }

  // --- Hospital 2: Green Valley Clinic (smaller, Basic plan) ---------------
  const greenValley = await prisma.hospital.create({
    data: {
      name: "Green Valley Clinic",
      slug: "green-valley-clinic",
      address: "22 Lake View Road, Pune, Maharashtra",
      phone: "+91 20 6000 2000",
      email: "hello@greenvalleyclinic.example",
      status: "ACTIVE",
      subscriptionPlan: "BASIC",
      doctorLimit: 5,
      subscriptionExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    },
  });
  const gvDept = await prisma.department.create({ data: { hospitalId: greenValley.id, name: "General Medicine" } });
  await prisma.user.create({
    data: {
      hospitalId: greenValley.id,
      role: "HOSPITAL_ADMIN",
      name: "Kavita Joshi",
      email: "admin@greenvalleyclinic.example",
      passwordHash: password,
    },
  });
  const gvDoctorUser = await prisma.user.create({
    data: {
      hospitalId: greenValley.id,
      role: "DOCTOR",
      name: "Dr. Vikram Singh",
      email: "vikram.singh@greenvalleyclinic.example",
      passwordHash: password,
    },
  });
  await prisma.doctor.create({
    data: {
      hospitalId: greenValley.id,
      departmentId: gvDept.id,
      userId: gvDoctorUser.id,
      name: "Dr. Vikram Singh",
      specialization: "General Physician",
      maxTokensPerDay: 25,
      workingHours,
      status: "ACTIVE",
    },
  });

  // --- Live demo queue for Sunrise Hospital, doctor #1 (Dr. Meera Nair) ----
  const queueDoctor = doctors[0];
  const queueDate = today();
  const session = await prisma.queueSession.create({
    data: {
      hospitalId: sunrise.id,
      doctorId: queueDoctor.id,
      queueDate,
      status: "OPEN",
      lastTokenSeq: 0,
    },
  });

  const patientSeed = [
    { name: "Rahul Verma", mobile: "9000000001", age: 45, status: TokenStatus.COMPLETED, visit: VisitType.FOLLOW_UP },
    { name: "Sneha Patil", mobile: "9000000002", age: 32, status: TokenStatus.COMPLETED, visit: VisitType.NEW },
    { name: "Imran Sheikh", mobile: "9000000003", age: 58, status: TokenStatus.NO_SHOW, visit: VisitType.NEW },
    { name: "Deepa Iyer", mobile: "9000000004", age: 29, status: TokenStatus.IN_CONSULTATION, visit: VisitType.FOLLOW_UP },
    { name: "Karan Malhotra", mobile: "9000000005", age: 61, status: TokenStatus.WAITING, visit: VisitType.NEW },
    { name: "Farida Ansari", mobile: "9000000006", age: 37, status: TokenStatus.WAITING, visit: VisitType.NEW },
    { name: "Vivek Bhatt", mobile: "9000000007", age: 50, status: TokenStatus.WAITING, visit: VisitType.FOLLOW_UP },
    { name: "Anjali Desai", mobile: "9000000008", age: 24, status: TokenStatus.CANCELLED, visit: VisitType.NEW },
  ];

  let seq = 0;
  let currentTokenId: string | null = null;
  for (const p of patientSeed) {
    seq += 1;
    const patient = await prisma.patient.create({
      data: { hospitalId: sunrise.id, name: p.name, mobile: p.mobile, age: p.age },
    });
    const tokenNumber = `D1-${String(seq).padStart(3, "0")}`;
    const token = await prisma.token.create({
      data: {
        hospitalId: sunrise.id,
        doctorId: queueDoctor.id,
        patientId: patient.id,
        queueSessionId: session.id,
        tokenNumber,
        sequence: seq,
        visitType: p.visit,
        status: p.status,
        estimatedWaitMinutes: seq * 8,
        queueDate,
        calledAt: p.status !== TokenStatus.WAITING ? new Date() : null,
        completedAt: p.status === TokenStatus.COMPLETED ? new Date() : null,
        cancelledAt: p.status === TokenStatus.CANCELLED ? new Date() : null,
      },
    });
    if (p.status === TokenStatus.IN_CONSULTATION) currentTokenId = token.id;

    await prisma.notificationLog.create({
      data: {
        hospitalId: sunrise.id,
        tokenId: token.id,
        channel: "SMS",
        event: "TOKEN_GENERATED",
        message: `Hi ${p.name}, your QLess token ${tokenNumber} for ${queueDoctor.name} is confirmed.`,
        status: "SENT",
      },
    });
  }

  await prisma.queueSession.update({
    where: { id: session.id },
    data: { lastTokenSeq: seq, currentTokenId },
  });

  await prisma.auditLog.create({
    data: {
      hospitalId: sunrise.id,
      userId: hospitalAdmin.id,
      action: "SEED_DATA_LOADED",
      entityType: "Hospital",
      entityId: sunrise.id,
      details: JSON.stringify({ note: "Demo dataset seeded" }),
    },
  });

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log("Demo credentials (password for all: Qless@123)");
  console.log("Super Admin:      superadmin@qless.app");
  console.log("Hospital Admin:   admin@sunrisehospital.example");
  console.log("Doctor:           meera.nair@sunrisehospital.example");
  console.log("Receptionist:     reception@sunrisehospital.example");
  console.log("---------------------------------------------");
  void receptionist;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
