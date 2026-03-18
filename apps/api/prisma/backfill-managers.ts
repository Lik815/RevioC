/**
 * Backfill script: creates PracticeManager entries for all practices
 * that still use the legacy adminEmail / adminTherapistId fields.
 *
 * Safe to run multiple times (idempotent).
 *
 * Usage:
 *   DATABASE_URL='file:./prisma/prisma/dev.db' npx tsx prisma/backfill-managers.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  let skipped = 0;

  const practices = await (prisma as any).practice.findMany({
    where: {
      OR: [
        { adminEmail: { not: null } },
        { adminTherapistId: { not: null } },
      ],
    },
  });

  console.log(`Found ${practices.length} practices with legacy admin fields.`);

  for (const practice of practices) {
    // Skip if a PracticeManager already exists for this practice
    const existing = await prisma.practiceManager.findUnique({
      where: { practiceId: practice.id },
    });
    if (existing) {
      skipped++;
      continue;
    }

    if (practice.adminTherapistId) {
      // Therapist-admin: create PracticeManager linked to existing therapist
      const alreadyLinked = await prisma.practiceManager.findUnique({
        where: { therapistId: practice.adminTherapistId },
      });
      if (alreadyLinked) {
        skipped++;
        continue;
      }

      const therapist = await prisma.therapist.findUnique({
        where: { id: practice.adminTherapistId },
      });
      if (!therapist) {
        console.warn(`  Therapist ${practice.adminTherapistId} not found, skipping practice ${practice.id}`);
        skipped++;
        continue;
      }

      await prisma.practiceManager.create({
        data: {
          email: therapist.email,
          passwordHash: therapist.passwordHash ?? '',
          practiceId: practice.id,
          therapistId: therapist.id,
        },
      });
      console.log(`  [therapist-admin] Created manager for "${practice.name}" → ${therapist.email}`);
      created++;

    } else if (practice.adminEmail && practice.adminPasswordHash) {
      // Standalone manager: use practice's own credentials
      const emailTaken = await prisma.practiceManager.findUnique({
        where: { email: practice.adminEmail },
      });
      if (emailTaken) {
        console.warn(`  Email ${practice.adminEmail} already used by another manager, skipping`);
        skipped++;
        continue;
      }

      await prisma.practiceManager.create({
        data: {
          email: practice.adminEmail,
          passwordHash: practice.adminPasswordHash,
          sessionToken: practice.adminSessionToken ?? undefined,
          practiceId: practice.id,
          therapistId: null,
        },
      });
      console.log(`  [standalone]     Created manager for "${practice.name}" → ${practice.adminEmail}`);
      created++;
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped (already exists): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
