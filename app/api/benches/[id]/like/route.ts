import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const benchId = parseInt(params.id);
    
    // Get current like count
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT likes FROM benches WHERE id = ?',
      [benchId]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Bench not found' }, { status: 404 });
    }
    
    const currentLikes = rows[0].likes;
    
    // Increment likes
    await pool.query<ResultSetHeader>(
      'UPDATE benches SET likes = ? WHERE id = ?',
      [currentLikes + 1, benchId]
    );
    
    return NextResponse.json({ 
      success: true,
      likes: currentLikes + 1 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to like bench' }, { status: 500 });
  }
}