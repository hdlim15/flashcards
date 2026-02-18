# Security Considerations

## Can Website Visitors Steal My Token?

### ✅ **No - Visitors Cannot Access Your Token**

**Important**: Each user's browser has **isolated localStorage**. When someone visits your GitHub Pages site:

- **User A's token** is stored in **User A's browser** only
- **User B's token** is stored in **User B's browser** only
- **They cannot see each other's tokens**

This is how web browsers work - localStorage is **per-origin** (per domain) and **per-browser-instance**. It's like each person has their own private safe.

### ⚠️ **The Real Risk: Compromised Site Code**

The actual security concern is if **the website code itself** is malicious or gets compromised:

1. **If someone pushes malicious code to your GitHub repo**, that code could steal tokens from all visitors
2. **XSS (Cross-Site Scripting) vulnerabilities** could allow attackers to inject malicious code
3. **Third-party scripts** (we don't use any) could be compromised

## Security Measures Implemented

### ✅ XSS Protection

1. **Content Security Policy (CSP)**: Prevents unauthorized scripts from running
   - Only allows scripts from the same origin
   - Blocks inline scripts and eval()
   - Only allows connections to GitHub API

2. **Input Sanitization**: All user input is escaped before display
   - `escapeHtml()` function sanitizes all text content
   - No inline `onclick` handlers (uses event delegation)
   - All data attributes are escaped

3. **No External Dependencies**: 
   - No third-party libraries that could be compromised
   - No CDN scripts
   - All code is in your repository

### ✅ Code Verification

Since the code is **open source on GitHub**:
- Users can review the code before using it
- You can verify no malicious code is present
- The code is version-controlled and auditable

## How to Verify Security

### Before Using the App:

1. **Review the Code**: Check the repository on GitHub
2. **Check for Updates**: If you see unexpected changes, review them
3. **Use Your Own Fork**: Fork the repo and deploy your own version (most secure)

### Red Flags to Watch For:

- Unexpected external script tags
- Code that sends data to unknown servers
- Obfuscated or minified code you didn't add
- Changes to `auth.js` or `gists.js` that look suspicious

## Best Practices

### For Maximum Security:

1. **Fork the Repository**: 
   - Create your own fork on GitHub
   - Deploy from your fork
   - You control the code

2. **Review Before Deploying**:
   - Check commits before pushing
   - Don't auto-deploy from untrusted sources

3. **Use Token Expiration**:
   - Set tokens to expire (90 days recommended)
   - Rotate tokens periodically

4. **Monitor Your Gists**:
   - Check your gists occasionally for unexpected changes
   - Revoke token if you see suspicious activity

## What If the Site Is Compromised?

If someone maliciously modifies the GitHub repo:

1. **Immediate Actions**:
   - Revoke your token: https://github.com/settings/tokens
   - Check your gists for unauthorized changes
   - Generate a new token

2. **Damage Assessment**:
   - Attacker could only access your gists (not repos, account, etc.)
   - They could read/modify your flashcard data
   - They cannot access other GitHub resources

3. **Prevention**:
   - Use your own fork (most secure)
   - Review code changes before deploying
   - Enable branch protection on GitHub

## Security Model Summary

```
┌─────────────────────────────────────────┐
│  User A's Browser                       │
│  ┌───────────────────────────────────┐ │
│  │ localStorage: {                    │ │
│  │   github_token: "ghp_abc123..."   │ │
│  │ }                                  │ │
│  └───────────────────────────────────┘ │
│  ✅ Isolated - User B cannot access    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  User B's Browser                       │
│  ┌───────────────────────────────────┐ │
│  │ localStorage: {                    │ │
│  │   github_token: "ghp_xyz789..."    │ │
│  │ }                                  │ │
│  └───────────────────────────────────┘ │
│  ✅ Isolated - User A cannot access    │
└─────────────────────────────────────────┘
```

**Bottom Line**: Visitors to your site **cannot** access each other's tokens. The only risk is if the site code itself is compromised, which you can prevent by:
- Using your own fork
- Reviewing code before deploying
- Monitoring for suspicious changes
