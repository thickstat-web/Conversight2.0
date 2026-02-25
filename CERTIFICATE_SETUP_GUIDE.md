# iOS Certificate Setup Guide for GitHub Actions

This guide will help you export a new certificate and set it up in GitHub Actions if your current certificate fails.

## Step 1: Export Certificate from Keychain Access

1. **Open Keychain Access** on your Mac
   - Press `Cmd + Space` and type "Keychain Access"
   - Or go to Applications → Utilities → Keychain Access

2. **Find your certificate**
   - In the left sidebar, click on **"My Certificates"**
   - Look for your certificate. It's usually named:
     - `Apple Development: [Your Name] ([Team ID])`
     - `Apple Distribution: [Your Name] ([Team ID])`
     - Or `iPhone Developer: [Your Name]`

3. **Export the certificate**
   - Right-click on the certificate
   - Select **"Export '[Certificate Name]'"**
   - Choose where to save it (e.g., Desktop)
   - **Important**: When prompted, set a password for the .p12 file
     - Choose a password you'll remember (e.g., `mycert123`)
     - **Write this password down!** You'll need it for the GitHub secret
   - Click **"Save"**

4. **If you see a password prompt**
   - This is asking for your **Mac password** (to allow the export)
   - Enter your Mac password and click **"Allow"**

## Step 2: Encode Certificate to Base64

1. **Open Terminal** on your Mac

2. **Navigate to where you saved the certificate**
   ```bash
   cd ~/Desktop
   # Or wherever you saved it
   ```

3. **Encode the certificate to base64**
   ```bash
   base64 -i YourCertificate.p12 | pbcopy
   ```
   Replace `YourCertificate.p12` with your actual certificate filename.

   This command will:
   - Encode the certificate to base64
   - Copy it to your clipboard automatically

4. **Verify the base64 string was copied**
   - The command should complete without errors
   - The base64 string is now in your clipboard (ready to paste)

## Step 3: Update GitHub Secrets

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/[your-username]/[your-repo]`

2. **Open Secrets settings**
   - Click **Settings** (top menu)
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Update BUILD_CERTIFICATE_BASE64**
   - Find `BUILD_CERTIFICATE_BASE64` in the list
   - Click the **pencil icon** (edit) next to it
   - **Paste** the base64 string from your clipboard (Cmd+V)
   - Click **"Update secret"**

4. **Update P12_PASSWORD**
   - Find `P12_PASSWORD` in the list
   - Click the **pencil icon** (edit) next to it
   - Enter the password you set when exporting the certificate (e.g., `mycert123`)
   - If the certificate has no password, enter: `none`
   - Click **"Update secret"**

## Step 4: Verify and Test

1. **Check your secrets are updated**
   - Both secrets should show "Updated [time] ago"

2. **Run the workflow**
   - Go to **Actions** tab in your repository
   - Click on your workflow
   - Click **"Run workflow"** → **"Run workflow"**

3. **Monitor the build**
   - The workflow should now successfully:
     - Decode the certificate
     - Validate it's a proper .p12 file
     - Import it into the keychain
     - Build your iOS app

## Troubleshooting

### Certificate not found in Keychain Access

If you don't see your certificate:
- Make sure you're logged into the correct Apple ID in Xcode
- Go to Xcode → Settings → Accounts
- Select your Apple ID → Download Manual Profiles
- The certificate should appear in Keychain Access after this

### "Certificate expired" error

If your certificate has expired:
- Go to [Apple Developer Portal](https://developer.apple.com/account)
- Generate a new certificate
- Download and install it
- Then follow this guide to export it

### "Wrong password" error

If you get a password error:
- Double-check the `P12_PASSWORD` secret matches the password you set when exporting
- If you're not sure, export a new certificate with a known password

### Base64 encoding issues

If base64 encoding fails:
- Make sure the file path is correct
- Try: `base64 YourCertificate.p12 | pbcopy` (without `-i` flag)
- Or: `cat YourCertificate.p12 | base64 | pbcopy`

## Quick Reference

**Export certificate:**
```bash
# In Keychain Access: Right-click certificate → Export → Set password → Save
```

**Encode to base64:**
```bash
base64 -i YourCertificate.p12 | pbcopy
```

**Update GitHub Secrets:**
- `BUILD_CERTIFICATE_BASE64`: Paste the base64 string
- `P12_PASSWORD`: Enter the password you set (or `none` if no password)

## Security Notes

- Never commit certificates or passwords to git
- Keep your .p12 file secure (delete it after uploading to GitHub)
- Use strong passwords for your certificates
- Rotate certificates periodically for security
