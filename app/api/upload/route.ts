import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Nincs kijelölt fájl.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        
        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {}

        // Create unique filenames to avoid overwriting
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
        const path = join(uploadDir, fileName);

        // Write the file to the filesystem
        await writeFile(path, buffer);
        
        // Return the public URL
        const publicUrl = `/uploads/${fileName}`;
        
        return NextResponse.json({ 
            success: true, 
            url: publicUrl 
        });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: 'Hiba történt a feltöltés során.' },
            { status: 500 }
        );
    }
}
