import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userIds = searchParams.get('userIds')

    // Handle batch request (multiple user IDs)
    if (userIds) {
      const ids = userIds.split(',').filter(Boolean)
      if (ids.length === 0) {
        return NextResponse.json({ emails: {} })
      }

      const emailMap: Record<string, string | null> = {}
      
      // Fetch all users in parallel
      const promises = ids.map(async (id) => {
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(id)
        if (!error && user) {
          emailMap[id] = user.email || null
        } else {
          emailMap[id] = null
        }
      })

      await Promise.all(promises)
      
      return NextResponse.json({ emails: emailMap })
    }

    // Handle single user request
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId or userIds parameter' },
        { status: 400 }
      )
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (error) {
      console.error('Error fetching user email:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user email' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: user.email })
  } catch (error) {
    console.error('Error in user-email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
