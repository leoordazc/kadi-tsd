import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { subject, html } = await req.json();
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        
        await transporter.sendMail({
            from: `"KADI TS&D" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject,
            html,
        });
        
        return NextResponse.json({ success: true });
        
    } catch (err) {
        console.error('Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        return NextResponse.json({ 
            success: false, 
            error: errorMessage 
        });
    }
}