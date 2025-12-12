import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM bench_comments WHERE bench_id = ? ORDER BY created_at DESC',
      [params.id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { user_name, comment } = body;
    
    if (!user_name || !comment) {
      return NextResponse.json(
        { error: 'Username and comment are required' }, 
        { status: 400 }
      );
    }
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO bench_comments (bench_id, user_name, comment) VALUES (?, ?, ?)',
      [params.id, user_name, comment]
    );
    
    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
