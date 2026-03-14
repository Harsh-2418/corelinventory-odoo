import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urckgczlovpqouvtprdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2tnY3psb3ZwcW91dnRwcmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NTU0NzYsImV4cCI6MjA4OTAzMTQ3Nn0.p6ryhYXbgq8hy7KeBbiL6FiFHtSDZ_8HF-4Wz9cxsls';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
