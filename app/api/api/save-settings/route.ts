export const dynamic = 'force-static';

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    // 1. Receive data from client
    const data = await request.json();

    // 2. Define where to save the data (e.g., a local JSON file)
    // Adjust the file path as needed for your project structure
    const filePath = path.join(process.cwd(), 'data', 'settings.json');

    // Ensure the directory exists, create if necessary
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // 3. Write the received data to the file in JSON format
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

    // 4. Return a successful response to the client
    return NextResponse.json(
      { success: true, message: 'Az adatok sikeresen elmentve!' },
      { status: 200 }
    );
  } catch (error: any) {
    // Handle any errors and respond with JSON (no HTML error pages)
    console.error('Mentési hiba történt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Ismeretlen hiba történt a mentés során.'
      },
      { status: 500 }
    );
  }
}
