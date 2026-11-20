export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/settings-server';

export async function GET() {
    try {
        const settings = getSettings();
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const updated = saveSettings(data);
        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        console.error('API save-settings error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
