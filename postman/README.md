# Postman Import

## Import via Link

1. Open Postman
2. Click **Import** (top left)
3. Select the **Link** tab
4. Paste the URL below and click **Continue**

```
https://raw.githubusercontent.com/minhacademi/webhook-contracts/main/postman/cademi.postman_collection.json
```

## Import via File

Alternatively, download `cademi.postman_collection.json` from this directory and use **Import > File** in Postman.

## Setup

After importing, set the `{{endpoint}}` variable to your webhook URL:

1. Click on the **Cademi Webhooks** collection
2. Go to the **Variables** tab
3. Replace the `endpoint` value with your URL
4. Click **Save**
