# 🧪 Test Your Edge Functions

## **Method 1: Test via Admin Dashboard**
1. Go to **Admin Dashboard** → **News API** tab
2. Click **"Fetch Now"** button
3. Watch for any error messages

## **Method 2: Test via Supabase Dashboard**
1. Go to **Edge Functions** → **fetch-news**
2. Click **"Invoke Function"** button
3. Use this test payload:
```json
{
  "manual": true
}
```

## **Method 3: Test via Direct API Call**
Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY`:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"manual": true}' \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/fetch-news
```

## **Expected Success Response:**
```json
{
  "success": true,
  "articlesProcessed": 50,
  "articlesInserted": 12,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## **Common Error Responses:**

### **"No API keys configured"**
- ✅ Add API keys to Edge Function secrets

### **"Function not found"**
- ✅ Function not deployed properly

### **"Failed to fetch news"**
- ✅ Check function logs for specific error

### **Network timeout**
- ✅ Function might be taking too long (API rate limits)