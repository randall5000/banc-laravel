export interface Bench {
  id: number;
  image_url: string;
  location: string;
  country: string;
  province?: string;
  town?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  is_tribute: boolean;
  tribute_name?: string;
  tribute_date?: Date;
  likes: number;
  created_at: Date;
  updated_at: Date;
}

export interface BenchPhoto {
  id: number;
  bench_id: number;
  photo_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: Date;
}

export interface BenchVideo {
  id: number;
  bench_id: number;
  video_url: string;
  thumbnail_url?: string;
  created_at: Date;
}
export interface BenchComment {
  id: number;
  bench_id: number;
  user_name: string;
  comment: string;
  created_at: Date;
}