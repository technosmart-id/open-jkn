import { NextResponse } from "next/server";
import {
  clearAllData,
  seedAdminUser,
  seedAll,
  seedChangeRequests,
  seedDentalFacilities,
  seedHealthcareFacilities,
  seedParticipants,
  seedPayments,
  seedRegistrations,
} from "@/lib/seeders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, count } = body;

    // Verify user is admin (you may want to add proper auth check)
    // For now, we'll proceed since the route is protected by middleware

    const result = { message: "", stats: {} as Record<string, number> };

    switch (action) {
      case "all":
        await seedAll();
        result.message = "Database seeded successfully with all data";
        result.stats = {
          facilities: 20,
          dental: 10,
          participants: 50,
          registrations: 30,
          payments: 100,
          changes: 20,
        };
        break;

      case "facilities": {
        const facilities = await seedHealthcareFacilities(count || 20);
        result.message = `Seeded ${facilities.length} healthcare facilities`;
        result.stats = { facilities: facilities.length };
        break;
      }

      case "dental": {
        const dental = await seedDentalFacilities(count || 10);
        result.message = `Seeded ${dental.length} dental facilities`;
        result.stats = { dental: dental.length };
        break;
      }

      case "participants": {
        const participants = await seedParticipants(count || 50);
        result.message = `Seeded ${participants.length} participants`;
        result.stats = { participants: participants.length };
        break;
      }

      case "registrations": {
        const registrations = await seedRegistrations(count || 30);
        result.message = `Seeded ${registrations.length} registrations`;
        result.stats = { registrations: registrations.length };
        break;
      }

      case "payments": {
        const payments = await seedPayments(count || 100);
        result.message = `Seeded ${payments.length} payments`;
        result.stats = { payments: payments.length };
        break;
      }

      case "changes": {
        const changes = await seedChangeRequests(count || 20);
        result.message = `Seeded ${changes.length} change requests`;
        result.stats = { changes: changes.length };
        break;
      }

      case "admin": {
        await seedAdminUser();
        result.message = "Admin user created successfully";
        result.stats = { admin: 1 };
        break;
      }

      case "clear":
        await clearAllData();
        result.message = "All data cleared successfully";
        result.stats = {};
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        error: "Seeding failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
