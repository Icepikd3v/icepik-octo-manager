# Week 3 Research – Security, Compliance & Innovation

## 🔐 OWASP Top 10 Web Application Security Risks

After reviewing OWASP’s Top 10, I found **Broken Access Control** and **Security Misconfiguration** most relevant to my project. Since my platform handles file uploads and user sessions, I need to be cautious about risks like:

- Broken access control: Ensuring users can only access their own files and print jobs
- Security misconfigurations: Making sure API keys, admin features, and error messages are properly secured
- Insecure design: Avoiding assumptions about input or access without strict validation

## 🛡️ GitHub Code Scanning Tools

I explored GitHub Advanced Security with CodeQL. This tool automatically scans your codebase for vulnerabilities and unsafe patterns. I plan to enable this for my backend soon.

I also found **Snyk** useful. It helps monitor known vulnerabilities in dependencies. As my backend grows and more libraries are added, it will help maintain strong package hygiene.

## 🌐 Electronic Frontier Foundation – Creativity & Innovation

I reviewed the **Creativity & Innovation** section on the EFF site, particularly articles on **Open Source Development** and **Privacy Best Practices**. It discusses how innovation thrives when developers maintain user trust by respecting data privacy and transparency. This aligns well with my project’s goals of protecting user data, print logs, and file uploads.

## 🧭 SWOT Security Summary (Optional)

- **Strengths:**

  - Secure user authentication via JWT
  - File access restricted by user ID
  - Print job access locked to specific users or admins

- **Weaknesses:**

  - Upload controller had no explicit file type enforcement early on
  - Admin roles were not clearly defined until recently

- **Opportunities:**

  - Add CodeQL and Snyk scanning
  - Add rate limiting to routes in future
  - Improve error handling and logging for unauthorized requests

- **Threats:**
  - If middleware fails, users could manipulate requests
  - If email notification logic fails silently, users may be unaware of queued or canceled jobs
  - GCODE files with hidden commands could present risk if not pre-screened
