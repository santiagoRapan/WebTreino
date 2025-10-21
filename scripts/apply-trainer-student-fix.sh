#!/bin/bash

# Apply trainer_student DELETE policy fix
# This fixes the issue where trainers cannot delete student relationships

echo "🔧 Applying trainer_student DELETE policy fix..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "📝 Running migration: fix_trainer_student_delete_policy.sql"
supabase db reset --linked

# Alternative: If you prefer to run just the SQL file
# echo "📝 You can also run this SQL directly in your Supabase dashboard:"
# echo "   cat database/migrations/fix_trainer_student_delete_policy.sql"

echo "✅ Migration applied successfully!"
echo ""
echo "🎯 What this fixes:"
echo "   - Trainers can now delete students from their roster"
echo "   - Students can now unlink themselves from trainers"
echo "   - The 'eliminar cliente' functionality will work properly"
echo ""
echo "🧪 Test the fix:"
echo "   1. Go to the clients tab"
echo "   2. Try to delete a client"
echo "   3. The trainer_student relationship should be removed from the database"
