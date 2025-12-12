import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM benches ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      image_url, 
      location, 
      town,
      province,
      country, 
      latitude, 
      longitude, 
      description,
      is_tribute,
      tribute_name,
      tribute_date
    } = body;
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO benches (image_url, location, town, province, country, latitude, longitude, description, is_tribute, tribute_name, tribute_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [image_url, location, town, province, country, latitude, longitude, description, is_tribute || false, tribute_name, tribute_date]
    );
    
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create bench' }, { status: 500 });
  }
}