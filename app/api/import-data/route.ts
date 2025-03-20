import { NextResponse } from "next/server"
import { importData } from "@/app/actions"

// Increase the response timeout for large imports
export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const bucket = url.searchParams.get("bucket") || "healthcare-data"
    const file = url.searchParams.get("file") || "patient-data.json"

    const result = await importData(bucket, file)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in import API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

