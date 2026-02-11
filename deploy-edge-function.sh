#!/bin/bash

# Deploy Supabase Edge Function for Media URLs
echo "🚀 Deploying get-workout-media-url edge function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Deploy the function
echo "📦 Deploying function..."
supabase functions deploy get-workout-media-url --project-ref xuixyepowawocvniusgb

echo "✅ Edge function deployed successfully!"
echo ""
echo "⚠️  Don't forget to set the required environment variables:"
echo "   supabase secrets set R2_ENDPOINT=<your-endpoint>"
echo "   supabase secrets set R2_ACCESS_KEY=<your-access-key>"
echo "   supabase secrets set R2_SECRET_KEY=<your-secret-key>"
echo "   supabase secrets set R2_BUCKET=r2"
echo ""
echo "To view function logs:"
echo "   supabase functions logs get-workout-media-url"
