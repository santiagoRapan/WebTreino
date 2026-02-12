#!/usr/bin/env tsx
/**
 * Fix orphan trainer_link_request records
 * 
 * This script finds requests marked as 'accepted' that don't have a corresponding
 * trainer_student relationship and creates the missing relationships.
 * 
 * Run with: npx tsx scripts/fix-orphan-requests.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixOrphanRequests() {
  console.log('🔍 Finding orphan accepted requests...')

  // Find all accepted requests
  const { data: acceptedRequests, error: fetchError } = await supabase
    .from('trainer_link_request')
    .select('id, trainer_id, student_id')
    .eq('status', 'accepted')

  if (fetchError) {
    console.error('❌ Error fetching requests:', fetchError)
    process.exit(1)
  }

  if (!acceptedRequests || acceptedRequests.length === 0) {
    console.log('✅ No accepted requests found')
    return
  }

  console.log(`📋 Found ${acceptedRequests.length} accepted requests`)

  let orphanCount = 0
  let fixedCount = 0
  const orphansToFix: Array<{ trainer_id: string; student_id: string }> = []

  // Check each request
  for (const request of acceptedRequests) {
    const { data: existingRelation } = await supabase
      .from('trainer_student')
      .select('*')
      .eq('trainer_id', request.trainer_id)
      .eq('student_id', request.student_id)
      .maybeSingle()

    if (!existingRelation) {
      orphanCount++
      orphansToFix.push({
        trainer_id: request.trainer_id,
        student_id: request.student_id,
      })
      console.log(`🔴 Orphan found: trainer ${request.trainer_id} -> student ${request.student_id}`)
    }
  }

  if (orphanCount === 0) {
    console.log('✅ No orphan requests found - all accepted requests have corresponding relationships')
    return
  }

  console.log(`\n⚠️  Found ${orphanCount} orphan request(s)`)
  console.log('🔧 Creating missing trainer_student relationships...\n')

  // Create missing relationships
  for (const orphan of orphansToFix) {
    const { error: insertError } = await supabase
      .from('trainer_student')
      .insert({
        trainer_id: orphan.trainer_id,
        student_id: orphan.student_id,
      })

    if (insertError) {
      // Check if it's a duplicate (which is fine)
      if (insertError.code === '23505') {
        console.log(`✅ Relationship already exists: ${orphan.trainer_id} -> ${orphan.student_id}`)
        fixedCount++
      } else {
        console.error(`❌ Error creating relationship ${orphan.trainer_id} -> ${orphan.student_id}:`, insertError)
      }
    } else {
      console.log(`✅ Created relationship: ${orphan.trainer_id} -> ${orphan.student_id}`)
      fixedCount++
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} out of ${orphanCount} orphan requests`)
}

// Run the script
fixOrphanRequests()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
