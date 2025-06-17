# 🔧 Lingo.dev API Endpoint Debug Guide

## 🚨 **Issue:** Getting 404 errors from Lingo.dev API

The 404 error means the API endpoint URL or request format is incorrect. I've updated the Edge Function to try **5 different API formats** that Lingo.dev might be using.

---

## 🧪 **Test the Updated Function:**

### **Step 1: Test in Admin Dashboard**
1. **Go to Admin Dashboard** → **Translation** tab
2. **Click "Direct Edge Function Test"**
3. **Check the detailed console logs**

### **Step 2: Check Edge Function Logs**
1. **Go to Supabase Dashboard** → **Edge Functions** → **translate-content** → **Logs**
2. **Look for detailed console.log messages showing:**
   - Which API endpoints were tried
   - Exact response status codes
   - Full response bodies
   - Which method (if any) succeeded

---

## 🔍 **What the Updated Function Tests:**

### **Method 1: Standard REST API v1**
```
POST https://api.lingo.dev/v1/translate
Authorization: Bearer YOUR_API_KEY
Body: {
  "text": "Hello",
  "sourceLocale": "en", 
  "targetLocale": "es",
  "format": "text"
}
```

### **Method 2: Alternative Endpoint**
```
POST https://api.lingo.dev/translate
Authorization: Bearer YOUR_API_KEY
Body: {
  "source": "Hello",
  "source_language": "en",
  "target_language": "es"
}
```

### **Method 3: X-API-Key Header**
```
POST https://api.lingo.dev/v1/translate
X-API-Key: YOUR_API_KEY
Body: {
  "text": "Hello",
  "from": "en",
  "to": "es"
}
```

### **Method 4: Query Parameter**
```
POST https://api.lingo.dev/v1/translate?key=YOUR_API_KEY
Body: {
  "q": "Hello",
  "source": "en",
  "target": "es"
}
```

### **Method 5: LibreTranslate Format**
```
POST https://api.lingo.dev/translate
Authorization: Bearer YOUR_API_KEY
Body: {
  "q": "Hello",
  "source": "en", 
  "target": "es",
  "api_key": "YOUR_API_KEY"
}
```

---

## 📊 **Expected Results:**

### **Success Case:**
- ✅ One of the 5 methods will work
- ✅ You'll see: `"Translation successful: Hola, esto es una prueba"`
- ✅ Real translations instead of `[MR]` prefixes

### **Debug Case:**
- 📋 **Detailed error logs** showing exactly what each API returned
- 🔍 **Response status codes** (404, 401, 403, etc.)
- 📄 **Full response bodies** to see the exact error messages
- 🎯 **API key verification** (shows first 10 characters)

---

## 🎯 **What to Look For:**

### **If you see 401 errors:**
- API key is invalid or expired
- Check your Lingo.dev dashboard

### **If you see 403 errors:**
- API key doesn't have permission
- Account might need upgrading

### **If you see 404 errors on all methods:**
- Lingo.dev might use a completely different API structure
- We may need to switch to a different translation service

### **If you see 429 errors:**
- Rate limit exceeded
- Need to wait or upgrade plan

---

## 🚀 **Alternative Translation Services:**

If Lingo.dev continues to fail, I can quickly switch to:

### **Google Translate API**
- Most reliable and accurate
- $20 per 1M characters
- Easy integration

### **DeepL API**
- High quality translations
- Free tier: 500,000 characters/month
- Very good for European languages

### **LibreTranslate**
- Free and open source
- Self-hosted or cloud
- Good for basic translations

### **Azure Translator**
- Microsoft's service
- Free tier: 2M characters/month
- Good enterprise support

---

## 🔧 **Immediate Next Steps:**

1. **Test the updated function** (it's automatically deployed)
2. **Check the Edge Function logs** for detailed error information
3. **Copy the exact error messages** and response bodies
4. **Let me know which method (if any) works**

---

## 💡 **Pro Tip:**

The updated function now provides **extremely detailed debugging information**. Even if all methods fail, we'll know exactly:
- What Lingo.dev's API expects
- What error messages they return
- Whether the API key is valid
- Which endpoint format to use

**This will help us either fix the Lingo.dev integration or choose the best alternative service!** 🌍✨