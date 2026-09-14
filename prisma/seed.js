const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const studentsData = [
  // Demo students specified in master prompt requirements
  { matricNo: 'RUN/FKI/23/15896', fullName: 'John Doe', suffix: '15896' },
  { matricNo: 'RUN/FKI/23/15897', fullName: 'Mary John', suffix: '15897' },
  { matricNo: 'RUN/FKI/22/15896', fullName: 'David Paul', suffix: '15896' },
  
  // Screenshot student records
  { matricNo: 'RUN/SOW/24/17710', fullName: 'Idowu Taiwo Praise', suffix: '17710' },
  { matricNo: 'RUN/PSY/23/15793', fullName: 'Adebisi Ifeoluwa Ruth', suffix: '15793' },
  { matricNo: 'RUN/LAW/24/16862', fullName: 'James Destiny Adamu', suffix: '16862' },
  { matricNo: 'RUN/MEE/24/16628', fullName: 'Akinbobola Oluwatobiloba Joshua', suffix: '16628' },
  { matricNo: 'RUN/PHI/23/14830', fullName: 'Adeniji-adele Toluwanimi Enoch', suffix: '14830' },
  { matricNo: 'RUN/CVE/22/12089', fullName: 'Abraham Abundance Anna', suffix: '12089' },

  // General roster
  { matricNo: 'RUN/CHE/23/14486', fullName: 'OGWOGHO SAMUEL OHIGBAI', suffix: '14486' },
  { matricNo: 'RUN/CMP/22/12786', fullName: 'ABRAHAM EBUBECHUKWU JOSHUA', suffix: '12786' },
  { matricNo: 'RUN/CMP/22/12801', fullName: 'ADEJUGBE FAITHFULNESS IBUKUNOLUWA', suffix: '12801' },
  { matricNo: 'RUN/CMP/22/12933', fullName: 'MAJEKODUNMI BUYINFOLUWA EMMANUEL', suffix: '12933' },
  { matricNo: 'RUN/CMP/23/15157', fullName: 'ABAH ELISHA', suffix: '15157' },
  { matricNo: 'RUN/CMP/23/15159', fullName: 'ABOYEJI VICTOR OLAJUWON', suffix: '15159' },
  { matricNo: 'RUN/CMP/23/15160', fullName: 'ACHA WILSON NWABUDIKE', suffix: '15160' },
  { matricNo: 'RUN/CMP/23/15161', fullName: 'ADEBANJO HEPHZIBAH ADEBUSUYI', suffix: '15161' },
  { matricNo: 'RUN/CMP/23/15162', fullName: 'ADEBAYO OLUWAFOLAHANMI DAVID', suffix: '15162' },
  { matricNo: 'RUN/CMP/23/15163', fullName: 'ADEBAYO OLUWATENIOLA DANIEL', suffix: '15163' },
  { matricNo: 'RUN/CMP/23/15164', fullName: 'ADEBEKUN ADEDOTUN ELIJAH', suffix: '15164' },
  { matricNo: 'RUN/CMP/23/15165', fullName: 'ADEBIMPE MOFOLUWASO AYOMIKUN', suffix: '15165' },
  { matricNo: 'RUN/CMP/23/15166', fullName: 'ADEBIYI ADEBOLA DAVID', suffix: '15166' },
  { matricNo: 'RUN/CMP/23/15167', fullName: 'ADEDEJI IREOLUWA SAMUEL', suffix: '15167' },
  { matricNo: 'RUN/CMP/23/15168', fullName: 'ADEDOTUN OLUWANIFEMI GRACE', suffix: '15168' },
  { matricNo: 'RUN/CMP/23/15169', fullName: 'ADEFEMIWA TIMOTHY OLUSOLA', suffix: '15169' },
  { matricNo: 'RUN/CMP/23/15170', fullName: 'ADEGBITE JOHN OLUWADAMILOLA', suffix: '15170' },
  { matricNo: 'RUN/CMP/23/15172', fullName: 'ADELABU ADEBOWALE ENIOLA', suffix: '15172' },
  { matricNo: 'RUN/CMP/23/15173', fullName: 'ADELAKUN TOLUWALASE JOSEPHINE', suffix: '15173' },
  { matricNo: 'RUN/CMP/23/15174', fullName: 'Adeola Toluwase Eberechi', suffix: '15174' }
];

async function main() {
  console.log('Starting seed process for RUC Prayer Unit...');

  // Clean legacy centre names
  try {
    await prisma.centre.deleteMany({
      where: {
        name: { in: ['Sapettor', '3-in-1 Lecture Theatre'] }
      }
    });
  } catch (e) {}

  // 1. Seed 6 Specified Centres
  const centreNames = ['Chapel', 'Sapetro', 'Event Center', 'Beyond Expectation', '3-In-1', 'LR'];
  const centres = [];
  const defaultHashedPassword = await bcrypt.hash('RUCPRAYER25*', 10);
  
  for (const name of centreNames) {
    const centre = await prisma.centre.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    centres.push(centre);

    // Create user for each centre with password RUCPRAYER25*
    const centreEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@ruc.edu`;
    await prisma.user.upsert({
      where: { email: centreEmail },
      update: { password: defaultHashedPassword, centreId: centre.id },
      create: {
        email: centreEmail,
        password: defaultHashedPassword,
        fullName: `${name} Exco`,
        role: 'EXCO',
        centreId: centre.id
      }
    });

    console.log(`Upserted centre: ${name}`);
  }

  const chapelId = centres[0].id;

  // 2. Seed Default Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ruc.edu' },
    update: { password: defaultHashedPassword },
    create: {
      email: 'admin@ruc.edu',
      password: defaultHashedPassword,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      centreId: chapelId
    }
  });
  console.log('Upserted Super Admin user (admin@ruc.edu / RUCPRAYER25*)');

  // 3. Seed Exco
  await prisma.user.upsert({
    where: { email: 'exco@ruc.edu' },
    update: { password: defaultHashedPassword },
    create: {
      email: 'exco@ruc.edu',
      password: defaultHashedPassword,
      fullName: 'Exco Admin',
      role: 'EXCO',
      centreId: chapelId
    }
  });
  console.log('Upserted Exco user (exco@ruc.edu / RUCPRAYER25*)');

  // 4. Seed Real Students
  for (const student of studentsData) {
    await prisma.student.upsert({
      where: { matricNo: student.matricNo },
      update: {
        fullName: student.fullName,
        matricSuffix: student.suffix
      },
      create: {
        matricNo: student.matricNo,
        fullName: student.fullName,
        matricSuffix: student.suffix
      }
    });
  }
  console.log(`Upserted ${studentsData.length} students successfully.`);

  // 5. Seed Default Meetings for each centre
  const defaultMeetings = [
    { title: 'Sunday Service', description: 'Weekly Sunday worship and intercession session', startTime: '07:00 AM', endTime: '09:30 AM', isRecurring: true },
    { title: 'Weekly Meeting', description: 'Wednesday power night prayer & bible study', startTime: '05:00 PM', endTime: '07:00 PM', isRecurring: true },
    { title: 'Night Vigil', description: 'Monthly all-night prayer vigil', startTime: '10:00 PM', endTime: '04:00 AM', isRecurring: true },
    { title: 'Executive Committee Prayer', description: 'Weekly prayer and planning for unit leaders', startTime: '06:00 PM', endTime: '07:30 PM', isRecurring: true },
    { title: 'Special Anointing Service', description: 'Special semester spiritual empowerment service', startTime: '08:00 AM', endTime: '11:00 AM', isRecurring: false }
  ];

  const today = new Date();

  for (const centre of centres) {
    for (const mData of defaultMeetings) {
      const existing = await prisma.meeting.findFirst({
        where: {
          title: mData.title,
          centreId: centre.id
        }
      });

      if (!existing) {
        await prisma.meeting.create({
          data: {
            title: mData.title,
            description: mData.description,
            meetingDate: today,
            startTime: mData.startTime,
            endTime: mData.endTime,
            isRecurring: mData.isRecurring,
            centreId: centre.id,
            createdById: adminUser.id
          }
        });
        console.log(`Created meeting "${mData.title}" for centre ${centre.name}`);
      }
    }
  }

  console.log('Seed completed successfully for RUC Prayer Unit!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
