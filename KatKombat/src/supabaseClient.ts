
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xqqjlbzqshtnidzywrpo.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcWpsYnpxc2h0bmlkenl3cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2NDI5MzYsImV4cCI6MjA0MTIxODkzNn0.4AXKg99UpTSa6krDY_8nR7BMt79mNY2IRdW5qD3MswE"

export const supabase = createClient(supabaseUrl, supabaseKey);
        