import { importEntregas } from "@/app/lib/actions/import-entregas";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await importEntregas();
    return new NextResponse(
      JSON.stringify(
        {
          success: true,
          message: "Import completed successfully",
          data: res || {},
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error importing entregas:", error);
    return new NextResponse(
      JSON.stringify(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to import entregas",
        },
        null,
        2,
      ),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
