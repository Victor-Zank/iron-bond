import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaxuqxyiofmdefzyywjc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheHVxeHlpb2ZtZGVmenl5d2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDIwMDYsImV4cCI6MjA5NzUxODAwNn0.-GhpQAzGMbF_dWZlDCkwLGKgF9dF5FSYoEYF7OJa9Ns';

console.log("Supabase URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey);