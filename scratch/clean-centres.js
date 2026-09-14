const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanCentres() {
  console.log('Cleaning up centre table...');
  const allowed = ['Chapel', 'Sapetro', 'Event Center', 'Beyond Expectation', '3-In-1', 'LR'];
  
  // Find all centres
  const allCentres = await prisma.centre.findMany();
  console.log('Current DB centres:', allCentres.map(c => c.name));

  // Delete centres that are not in allowed exact names
  for (const centre of allCentres) {
    if (!allowed.includes(centre.name)) {
      console.log(`Deleting legacy/duplicate centre: "${centre.name}" (${centre.id})`);
      // Update any meeting or user references before deleting
      const targetCentre = allCentres.find(c => c.name === 'Chapel');
      if (targetCentre) {
        await prisma.meeting.updateMany({ where: { centreId: centre.id }, data: { centreId: targetCentre.id } });
        await prisma.attendanceSession.updateMany({ where: { centreId: centre.id }, data: { centreId: targetCentre.id } });
        await prisma.user.updateMany({ where: { centreId: centre.id }, data: { centreId: targetCentre.id } });
      }
      await prisma.centre.delete({ where: { id: centre.id } });
    }
  }

  // Upsert exact 6 centres
  for (const name of allowed) {
    await prisma.centre.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true }
    });
  }

  const finalCentres = await prisma.centre.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
  console.log('FINAL CLEAN DB CENTRES:', finalCentres.map(c => c.name));
}

cleanCentres()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
