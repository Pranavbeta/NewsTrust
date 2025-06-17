# 🔧 Lingo.dev API Key Debug Steps

## 🚨 **Issue:** API key added but still getting "not configured" error

This usually happens due to one of these reasons:

---

## 🔍 **Step 1: Verify API Key is Actually Set**

1. **Go to Supabase Dashboard** → **Edge Functions** → **Settings**
2. **Check if you see `LINGO_API_KEY` in the secrets list**
3. **Make sure the name is EXACTLY:** `LINGO_API_KEY` (case-sensitive)

---

## 🔍 **Step 2: Test Edge Function Directly**

Let's test the Edge Function directly to see the exact error:

```bash
# Replace YOUR_PROJECT_ID and 
curl -X POST \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnYWlvcGtrY3BsYWV3aWJxd2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTA1MDAsImV4cCI6MjA2NTQ4NjUwMH0.4XVSx7YxmqIc0mqvBZqnhGCaVZ75VmqbRcLGySf_ov0" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "toLanguage": "es"}' \
  https://jgaiopkkcplaewibqwaf.supabase.co/functions/v1/translate-content
```

---

## 🔍 **Step 3: Check Edge Function Logs**

1. **Go to Supabase Dashboard** → **Edge Functions** → **translate-content**
2. **Click "Logs" tab**
3. **Look for recent error messages**
4. **Check if it shows the exact error about API key**

---

## 🔍 **Step 4: Common Issues & Fixes**

### **Issue A: Wrong Secret Name**
- ❌ `LINGO_API_KEY ` (extra space)
- ❌ `lingo_api_key` (lowercase)
- ❌ `LINGO_DEV_API_KEY` (wrong name)
- ✅ `LINGO_API_KEY` (correct)

### **Issue B: API Key Format**
- Make sure you copied the FULL API key from Lingo.dev
- No extra spaces or characters
- Should look like: `lingo_sk_...` or similar format

### **Issue C: Edge Function Not Updated**
- The function might be using old code
- Try redeploying: `supabase functions deploy translate-content`

### **Issue D: Propagation Delay**
- Wait 2-3 minutes after adding the secret
- Supabase needs time to propagate the environment variable

---

## 🔍 **Step 5: Test in Admin Dashboard**

1. **Go to Admin Dashboard** → **Translation** tab
2. **Click "Run Test" button**
3. **Check the exact error message**

---

## 🔍 **Step 6: Manual Verification**

If you want to verify your Lingo.dev API key works:

```bash
# Test your API key directly with Lingo.dev
curl -X POST \
  -H "Authorization: Bearer api_zhisy8kl2m7n0pyvynl4oweo" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "sourceLocale:": "en", "targetLocale": "es"}' \
  https://api.lingo.dev/v1/translate
```

---

## 🎯 **Most Likely Solutions:**

### **Solution 1: Re-add the API Key**
1. **Delete the existing `LINGO_API_KEY` secret**
2. **Add it again with the exact name: `LINGO_API_KEY`**
3. **Wait 2 minutes**
4. **Test again**

### **Solution 2: Check API Key Format**
1. **Go back to Lingo.dev dashboard**
2. **Copy the API key again (fresh copy)**
3. **Make sure it's the complete key**
4. **Re-add to Supabase**

### **Solution 3: Redeploy Edge Function**
```bash
supabase functions deploy translate-content
```

---

## 🚀 **Quick Test Commands:**

After making changes, test with these:

1. **Admin Dashboard Test:**
   - Go to Admin → Translation → "Run Test"

2. **Direct API Test:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"text": "test", "toLanguage": "es"}' \
     https://YOUR_PROJECT_ID.supabase.co/functions/v1/translate-content
   ```

---

## 📋 **Checklist:**

- [ ] API key name is exactly `LINGO_API_KEY`
- [ ] API key value is complete and correct
- [ ] Waited 2+ minutes after adding secret
- [ ] Edge function logs show the secret is available
- [ ] Lingo.dev API key is valid and active
- [ ] Edge function is deployed and working

---

**Try these steps and let me know what specific error you see in the Edge Function logs!** 🔍