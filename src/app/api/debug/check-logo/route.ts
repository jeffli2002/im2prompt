import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo3.png');
    
    const exists = fs.existsSync(logoPath);
    let stats = null;
    let error = null;
    
    if (exists) {
      try {
        stats = fs.statSync(logoPath);
      } catch (e) {
        error = (e as Error).message;
      }
    }
    
    return NextResponse.json({
      path: logoPath,
      exists,
      stats: stats ? {
        size: stats.size,
        isFile: stats.isFile(),
        mode: stats.mode.toString(8),
        mtime: stats.mtime
      } : null,
      error,
      cwd: process.cwd(),
      publicDir: path.join(process.cwd(), 'public'),
      imagesDir: path.join(process.cwd(), 'public', 'images'),
    });
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}