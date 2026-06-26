# Risks & Mitigations

> Denis Chamkaga Portfolio & AI Business Platform

---

## Risk Matrix

| Severity | Likelihood | Risk Level |
|----------|------------|------------|
| High | High | 🔴 Critical |
| High | Medium | 🟠 High |
| Medium | High | 🟠 High |
| Medium | Medium | 🟡 Medium |
| Low | Any | 🟢 Low |

---

## Technical Risks

### 🔴 R1: AI Model Availability

| Property | Value |
|----------|-------|
| Risk | Ollama/LLM not available or too slow on deployment server |
| Impact | AI Assistant non-functional — core feature broken |
| Likelihood | Medium-High |
| Mitigation | Implement fallback chain: Ollama → Cloud API → Static responses |
| Contingency | Pre-built response templates for common intents |

### 🟠 R2: Database Migration Failures

| Property | Value |
|----------|-------|
| Risk | Prisma migrations fail in production |
| Impact | Data loss or application downtime |
| Likelihood | Medium |
| Mitigation | Test migrations on staging, daily backups, rollback scripts |
| Contingency | Manual SQL migration scripts as fallback |

### 🟡 R3: Dependency Vulnerabilities

| Property | Value |
|----------|-------|
| Risk | npm packages with security vulnerabilities |
| Impact | Security exposure |
| Likelihood | Medium |
| Mitigation | Regular `npm audit`, Dependabot alerts, pin major versions |
| Contingency | Fork and patch critical dependencies if needed |

### 🟡 R4: Browser Compatibility

| Property | Value |
|----------|-------|
| Risk | CSS/JS features not supported in older browsers |
| Impact | UI broken for some visitors |
| Likelihood | Low-Medium |
| Mitigation | Target ES2023 with Vite's browser targets, test in multiple browsers |
| Contingency | Progressive enhancement for critical features |

### 🟢 R5: Build Size Growth

| Property | Value |
|----------|-------|
| Risk | Bundle size exceeds performance targets |
| Impact | Slow page load times |
| Likelihood | Medium |
| Mitigation | Code splitting, lazy loading, bundle analyzer, tree shaking |
| Contingency | Extract heavy features into separate chunks |

---

## Business Risks

### 🟠 R6: Content Not Ready

| Property | Value |
|----------|-------|
| Risk | Denis's portfolio content (images, project descriptions, testimonials) not ready when platform is |
| Impact | Launch delay or launch with placeholder content |
| Likelihood | Medium |
| Mitigation | Use high-quality placeholders, build admin so content can be added later |
| Contingency | Soft launch with available content, iterate |

### 🟡 R7: Domain/Hosting Setup

| Property | Value |
|----------|-------|
| Risk | Domain registration, DNS, SSL, or hosting delays |
| Impact | Deployment blocked |
| Likelihood | Low-Medium |
| Mitigation | Set up hosting infrastructure early in Phase 22 |
| Contingency | Deploy to temporary domain first |

### 🟢 R8: Scope Creep

| Property | Value |
|----------|-------|
| Risk | Adding features beyond the approved specification |
| Impact | Delays, code quality degradation |
| Likelihood | Medium |
| Mitigation | Strict phase adherence, future features documented separately |
| Contingency | Feature freeze for launch, defer to post-launch |

---

## Security Risks

### 🔴 R9: JWT Secret Exposure

| Property | Value |
|----------|-------|
| Risk | JWT secrets committed to git or exposed |
| Impact | Authentication bypass, full system compromise |
| Likelihood | Low |
| Mitigation | .gitignore for .env, env validation on startup, secret rotation plan |
| Contingency | Immediate secret rotation, invalidate all tokens |

### 🟠 R10: SQL Injection

| Property | Value |
|----------|-------|
| Risk | Raw SQL queries with unsanitized input |
| Impact | Data breach or data loss |
| Likelihood | Low (Prisma prevents this) |
| Mitigation | Use Prisma for all queries, validate all inputs with Zod |
| Contingency | Database audit, patch vulnerable queries |

### 🟡 R11: Rate Limiting Bypass

| Property | Value |
|----------|-------|
| Risk | Attackers bypass rate limiting via IP rotation |
| Impact | Spam leads, DDoS, resource exhaustion |
| Likelihood | Low-Medium |
| Mitigation | Multi-layer rate limiting (IP + fingerprint), CAPTCHA on forms |
| Contingency | WAF/Cloudflare protection |

---

## Operational Risks

### 🟠 R12: Server Resource Limits

| Property | Value |
|----------|-------|
| Risk | Ollama + PostgreSQL + Express exceeds server RAM/CPU |
| Impact | Slow responses or crashes |
| Likelihood | Medium |
| Mitigation | Size server appropriately (min 4GB RAM), monitor resources |
| Contingency | Scale to larger server or separate AI to dedicated machine |

### 🟡 R13: Backup Failure

| Property | Value |
|----------|-------|
| Risk | Automated backups fail silently |
| Impact | Data loss on server failure |
| Likelihood | Low |
| Mitigation | Backup monitoring with alerts, test restoration quarterly |
| Contingency | Manual backup verification checklist |

---

## Risk Monitoring

| Activity | Frequency |
|----------|-----------|
| npm audit | Weekly |
| Backup verification | Monthly |
| Security headers check | Monthly |
| Performance monitoring | Continuous |
| Error log review | Daily (initially), Weekly (stable) |
| Dependency updates | Monthly |
