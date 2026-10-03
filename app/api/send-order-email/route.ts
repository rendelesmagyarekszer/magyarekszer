import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const STORE_EMAIL = 'rendeles.magyarekszer@gmail.com';

function formatPrice(n: number) {
    return `${n.toLocaleString('hu-HU')} Ft`;
}

function buildStoreEmail(order: any): string {
    const itemRows = order.items.map((item: any) =>
        `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f08;">${item.name}${item.selectedCustomization ? ` <em style="color:#c9a56a;">(${item.selectedCustomization})</em>` : ''}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f08;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f08;text-align:right;color:#c9a56a;font-weight:bold;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    ).join('');

    return `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0700;font-family:Georgia,serif;color:#fdfdf3;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#150e03;border:1px solid #c9a56a33;padding:40px 32px;border-radius:4px;">
        <div style="text-align:center;border-bottom:1px solid #c9a56a22;padding-bottom:24px;margin-bottom:32px;">
            <p style="color:#c9a56a;font-size:11px;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 8px;">MagyarÉkszer</p>
            <h1 style="color:#fdfdf3;font-size:22px;margin:0;font-weight:normal;">🛒 Új rendelés érkezett!</h1>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1a1005;border:1px solid #c9a56a22;">
            <tr style="background:#c9a56a11;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Termék</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Db</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Ár</th>
            </tr>
            ${itemRows}
            ${order.premiumBox ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #2a1f08;">⭐ Prémium Díszdoboz</td><td style="padding:8px 12px;text-align:center;">1</td><td style="padding:8px 12px;text-align:right;color:#c9a56a;font-weight:bold;">+${formatPrice(order.premiumBoxPrice || 1500)}</td></tr>` : ''}
        </table>

        <table style="width:100%;margin-bottom:32px;">
            <tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Szállítás:</td><td style="padding:4px 0;text-align:right;font-size:12px;">${order.shipping?.method || '-'}</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #c9a56a22;padding-top:12px;"></td></tr>
            <tr><td style="padding:4px 0;color:#c9a56a;font-size:18px;font-weight:bold;letter-spacing:0.05em;">Összesen:</td><td style="padding:4px 0;text-align:right;color:#c9a56a;font-size:18px;font-weight:bold;">${formatPrice(order.total)}</td></tr>
        </table>

        <div style="display:grid;gap:16px;">
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Vásárló adatai</p>
                <p style="margin:4px 0;font-size:13px;"><strong>${order.customerInfo?.fullName}</strong></p>
                <p style="margin:4px 0;font-size:13px;color:#999;">📧 ${order.customerInfo?.email}</p>
                <p style="margin:4px 0;font-size:13px;color:#999;">📞 ${order.customerInfo?.phone}</p>
            </div>
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Szállítási cím</p>
                <p style="margin:4px 0;font-size:13px;">${order.shipping?.address || '-'}</p>
            </div>
            <div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;">
                <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Fizetési mód</p>
                <p style="margin:4px 0;font-size:13px;">${order.paymentMethod || '-'}</p>
            </div>
            ${order.comment ? `<div style="background:#1a1005;border:1px solid #c9a56a22;padding:20px;border-radius:4px;"><p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Megjegyzés</p><p style="margin:4px 0;font-size:13px;font-style:italic;">${order.comment}</p></div>` : ''}
        </div>
    </div>
    <p style="text-align:center;color:#555;font-size:10px;margin-top:24px;letter-spacing:0.2em;text-transform:uppercase;">MagyarÉkszer • rendeles.magyarekszer@gmail.com</p>
</div>
</body>
</html>`;
}

function buildCustomerEmail(order: any): string {
    const itemRows = order.items.map((item: any) =>
        `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f08;">${item.name}${item.selectedCustomization ? ` <em style="color:#c9a56a;">(${item.selectedCustomization})</em>` : ''}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f08;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #2a1f08;text-align:right;color:#c9a56a;font-weight:bold;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    ).join('');

    return `
<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0700;font-family:Georgia,serif;color:#fdfdf3;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#150e03;border:1px solid #c9a56a33;padding:40px 32px;border-radius:4px;">
        <div style="text-align:center;border-bottom:1px solid #c9a56a22;padding-bottom:32px;margin-bottom:32px;">
            <p style="color:#c9a56a;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;margin:0 0 12px;">MagyarÉkszer</p>
            <h1 style="color:#fdfdf3;font-size:24px;margin:0 0 8px;font-weight:normal;">Köszönjük a rendelését!</h1>
            <p style="color:#999;font-size:13px;margin:0;font-style:italic;">Rendelését sikeresen rögzítettük.</p>
        </div>

        <p style="font-size:14px;color:#fdfdf3;margin:0 0 24px;">Kedves <strong>${order.customerInfo?.fullName}</strong>!</p>
        <p style="font-size:13px;color:#aaa;line-height:1.8;margin:0 0 32px;">
            Örömmel értesítjük, hogy rendelését megkaptuk és hamarosan elkészítjük az Ön egyedi ékszerét. 
            Minden darabot kézzel, egyedileg készítünk el. A gyártási idő ${order.paymentMethod?.toLowerCase().includes('utal') ? 'az <strong>utalás beérkezésétől számított <span style="color:#c9a56a;">10 munkanapon belül</span></strong>' : 'általában <strong style="color:#c9a56a;">10 munkanapon belül</strong>'} valósul meg.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1a1005;border:1px solid #c9a56a22;">
            <tr style="background:#c9a56a11;">
                <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Termék</th>
                <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Db</th>
                <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a56a;">Ár</th>
            </tr>
            ${itemRows}
            ${order.premiumBox ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #2a1f08;">⭐ Prémium Díszdoboz</td><td style="padding:8px 12px;text-align:center;">1</td><td style="padding:8px 12px;text-align:right;color:#c9a56a;font-weight:bold;">+${formatPrice(order.premiumBoxPrice || 1500)}</td></tr>` : ''}
        </table>

        <table style="width:100%;margin-bottom:32px;">
            <tr><td style="padding:4px 0;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Szállítás:</td><td style="padding:4px 0;text-align:right;font-size:12px;">${order.shipping?.method || '-'}</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #c9a56a22;padding-top:12px;"></td></tr>
            <tr><td style="padding:4px 0;color:#c9a56a;font-size:18px;font-weight:bold;">Végösszeg:</td><td style="padding:4px 0;text-align:right;color:#c9a56a;font-size:18px;font-weight:bold;">${formatPrice(order.total)}</td></tr>
        </table>

        ${order.paymentMethod?.toLowerCase().includes('utal') ? `
        <div style="background:#c9a56a0d;border:1px solid #c9a56a33;padding:20px;border-radius:4px;margin-bottom:24px;">
            <p style="color:#c9a56a;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">Átutalás adatai</p>
            <p style="margin:4px 0;font-size:12px;">Kedvezményezett: <strong>MARTIN'S BT.</strong></p>
            <p style="margin:4px 0;font-size:12px;">Bank: <strong>K&H Bank Zrt.</strong></p>
            <p style="margin:4px 0;font-size:12px;">Számlaszám: <strong style="color:#c9a56a;letter-spacing:0.1em;">10404089-50526774-52721009</strong></p>
            <p style="margin:16px 0 0;font-size:11px;color:#777;font-style:italic;">Kérjük, a közlemény rovatba írja be a nevét és telefonszámát az azonosításhoz.</p>
        </div>` : ''}

        <div style="border-top:1px solid #c9a56a22;padding-top:24px;margin-top:8px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0 0 8px;">Kérdése van? Keressen minket:</p>
            <p style="color:#c9a56a;font-size:13px;margin:0 0 4px;">📞 +36 20 807 4841</p>
            <p style="color:#c9a56a;font-size:13px;margin:0;">📧 magyarekszer@gmail.com</p>
            <p style="color:#555;font-size:11px;margin:16px 0 0;font-style:italic;">1056 Budapest, Molnár u. 23.</p>
        </div>
    </div>
    <p style="text-align:center;color:#444;font-size:10px;margin-top:24px;letter-spacing:0.2em;text-transform:uppercase;">© MagyarÉkszer • Tradicionális Magyar Ékszer</p>
</div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
    try {
        const order = await req.json();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // 1. Send notification to store
        await transporter.sendMail({
            from: `"MagyarÉkszer Webshop" <${process.env.GMAIL_USER}>`,
            to: STORE_EMAIL,
            subject: `🛒 Új rendelés: ${order.customerInfo?.fullName} – ${new Date().toLocaleDateString('hu-HU')}`,
            html: buildStoreEmail(order),
        });

        // 2. Send confirmation to customer
        if (order.customerInfo?.email) {
            await transporter.sendMail({
                from: `"MagyarÉkszer" <${process.env.GMAIL_USER}>`,
                to: order.customerInfo.email,
                subject: 'Köszönjük rendelését! – MagyarÉkszer',
                html: buildCustomerEmail(order),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Email sending failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
