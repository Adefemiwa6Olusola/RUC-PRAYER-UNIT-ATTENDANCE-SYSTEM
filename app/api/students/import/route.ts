import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { normalizeMatricNo, extractMatricSuffix } from '@/lib/validation';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'students:import')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const csvText = await req.text();
    const rows = csvText.split('\n').map(r => r.split(','));
    
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    const headerRow = rows[0]?.map(h => h.trim().toLowerCase()) || [];
    const nameIdx = headerRow.findIndex(h => h.includes('name'));
    const matricIdx = headerRow.findIndex(h => h.includes('matric'));

    if (nameIdx === -1 || matricIdx === -1) {
      return NextResponse.json({ error: 'Invalid CSV headers. Need Name and Matric No.' }, { status: 400 });
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;
      
      const rawName = row[nameIdx]?.trim();
      const rawMatric = row[matricIdx]?.trim();
      
      if (!rawName || !rawMatric) {
        skipped++;
        continue;
      }

      const matricNo = normalizeMatricNo(rawMatric);
      if (!matricNo) {
        errors.push(`Row ${i + 1}: Invalid matric format ${rawMatric}`);
        skipped++;
        continue;
      }

      try {
        const existing = await prisma.student.findUnique({ where: { matricNo } });
        if (existing) {
          skipped++;
          continue;
        }

        await prisma.student.create({
          data: {
            fullName: rawName,
            matricNo,
            matricSuffix: extractMatricSuffix(matricNo)
          }
        });
        imported++;
      } catch (e: any) {
        errors.push(`Row ${i + 1}: ${e.message}`);
        skipped++;
      }
    }

    await logAudit({
      userId: user.userId,
      action: 'IMPORT',
      entity: 'Student',
      metadata: { imported, skipped, errors }
    });

    return NextResponse.json({ imported, skipped, errors });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
