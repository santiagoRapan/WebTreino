# Real-Time Subscription Fix - Quick Checklist

## ⚡ Quick Fix (5 minutes)

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/[your-project-id]/sql

### 2. Run This SQL
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE trainer_link_request;
ALTER PUBLICATION supabase_realtime ADD TABLE trainer_student;
ALTER TABLE trainer_link_request REPLICA IDENTITY FULL;
ALTER TABLE trainer_student REPLICA IDENTITY FULL;
```

### 3. Verify
```sql
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND schemaname = 'public';
```

Expected output:
- ✅ message
- ✅ trainer_link_request
- ✅ trainer_student

### 4. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
# or
pnpm dev
```

### 5. Check Console
Look for these logs:
- ✅ `Subscribed to trainer link requests`
- ✅ `Subscribed to trainer-student relationships`

## 🎯 Done!
The subscription errors should be gone. Real-time updates for trainer-student relationships now work!

---

📖 For detailed explanation, see: `/docs/FIX_REALTIME_ERRORS.md`
