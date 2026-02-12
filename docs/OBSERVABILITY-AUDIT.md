# Logging & Observability Audit

**Feature**: User Login and Logout  
**Date**: February 10, 2026  
**Auditor**: Phase 6 Implementation  

---

## T103: Audit Events Logging ⚠️

### Current Status
**PARTIAL IMPLEMENTATION** - Audit infrastructure exists but not fully integrated.

### What Exists ✅
1. ✅ **Database Table**: `Audit_AuthEvents` with proper schema
   ```sql
   - EventId (PK)
   - UserId
   - Username
   - EventType (LOGIN, LOGOUT, SESSION_EXPIRED, etc.)
   - Success (bit)
   - ErrorCode
   - IpAddress
   - UserAgent
   - AdditionalInfo
   - EventTimestamp
   ```

2. ✅ **Stored Procedure**: `Audit_AuthEvents_Insert` with TRY-CATCH
   - Parameters: @UserId, @Username, @EventType, @Success, @ErrorCode, @IpAddress, @UserAgent, @AdditionalInfo
   - Returns: tState (OK~00000 or ERR~...)

3. ✅ **Indexes for Performance**:
   - `IX_Audit_AuthEvents_Username_Timestamp` (Username, EventTimestamp DESC)
   - `IX_Audit_AuthEvents_EventType_Timestamp` (EventType, EventTimestamp DESC)

### What's Missing ❌
1. ❌ **Repository Method**: `InsertAuditEventAsync()` not implemented in `AuthenticationRepository.cs`
2. ❌ **Service Integration**: `AuthenticationService` doesn't call audit insertion
3. ❌ **Event Coverage**: LOGIN, LOGOUT, SESSION_EXPIRED events not being persisted to database

### Recommendation
**Priority: HIGH** - Audit logging is critical for security compliance and forensic analysis.

**Implementation Required**:
```csharp
// Add to IAuthenticationRepository.cs
Task<TStateResult> InsertAuditEventAsync(
    int? userId, 
    string? username, 
    string eventType, 
    bool success, 
    string? errorCode, 
    string? ipAddress, 
    string? userAgent, 
    string? additionalInfo);

// Add to AuthenticationService.cs
await _repository.InsertAuditEventAsync(
    userId, 
    username, 
    "LOGIN", 
    true, 
    "00000", 
    ipAddress, 
    userAgent, 
    "Successful authentication");
```

### Current Alternative
- Application logs LOGIN/LOGOUT events via Serilog (console + file)
- Events searchable in log files but not in structured database
- Missing: Query capability, historical analysis, user action timeline

---

## T104: Serilog Configuration ✅

### Implementation Verified

**Configuration** (`appsettings.json`):
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/webapi-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7,
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      }
    ]
  }
}
```

### What's Logged ✅

**Authentication Events**:
- `Authentication attempt for user: {Username}`
- `Authentication successful for user: {Username} (UserId: {UserId})`
- `Authentication failed: Invalid password for user: {Username}`
- `Creating session for UserId: {UserId}, Username: {Username}`
- `Session created successfully: SessionId={SessionId}, UserId={UserId}`

**Logout Events**:
- `Logout attempt for session token`
- `Logout successful`
- `Logout failed: {ErrorCode} - {Message}`

**Session Validation**:
- `Validating session token`
- `Session validation successful for UserId: {UserId}`
- `Session validation failed: {ErrorCode}`

### Log Enrichment ✅

**Correlation IDs**:
- ✅ Added via `CorrelationIdMiddleware`
- ✅ Included in `HttpContext.Items["CorrelationId"]`
- ✅ Accessible in all log entries for the same request

**Structured Logging**:
- ✅ Uses parameterized logging: `{Username}`, `{UserId}`, `{SessionId}`
- ✅ Enables log aggregation and filtering
- ✅ Supports JSON export for ELK, Splunk, etc.

### Log Rotation ✅
- **Daily Rotation**: Files rotate at midnight (rollingInterval: "Day")
- **Retention**: Last 7 days kept (retainedFileCountLimit: 7)
- **File Pattern**: `logs/webapi-20260210.log`
- **Disk Management**: Automatic cleanup of old files

---

## T105: Log Aggregation & Parsing ✅

### File-Based Logs

**Location**: `backend/src/WebApi/logs/`
**Format**: Plain text with timestamp, level, message, exception

**Example Log Entry**:
```
2026-02-10 02:24:53.123 +00:00 [INF] Authentication attempt for user: Admin
2026-02-10 02:24:53.456 +00:00 [INF] Authentication successful for user: Admin (UserId: 1)
2026-02-10 02:24:53.789 +00:00 [INF] Creating session for UserId: 1, Username: Admin
2026-02-10 02:24:54.012 +00:00 [INF] Session created successfully: SessionId=436, UserId=1, Username=Admin
```

### Parsing & Filtering ✅

**PowerShell Examples**:
```powershell
# Filter by event type
Select-String -Path "logs/webapi-*.log" -Pattern "Authentication attempt"

# Filter by username
Select-String -Path "logs/webapi-*.log" -Pattern "Admin"

# Filter by date range
Get-Content "logs/webapi-20260210.log" | Select-String -Pattern "02:24"

# Count failed authentications
(Select-String -Path "logs/webapi-*.log" -Pattern "Authentication failed").Count
```

**Linux/Bash Examples**:
```bash
# Filter by event type
grep "Authentication attempt" logs/webapi-*.log

# Filter by username
grep "Admin" logs/webapi-*.log

# Count failed authentications
grep -c "Authentication failed" logs/webapi-*.log

# Extract user IDs from successful logins
grep "Authentication successful" logs/webapi-*.log | grep -oP 'UserId: \K\d+'
```

### Future: Centralized Log Aggregation

**Recommended Tools** (not implemented):
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
  - Serilog sink: `Serilog.Sinks.Elasticsearch`
  - Real-time search and visualization
  
- **Splunk**
  - Serilog sink: `Serilog.Sinks.Splunk`
  - Enterprise-grade analytics
  
- **Azure Application Insights**
  - Serilog sink: `Serilog.Sinks.ApplicationInsights`
  - Cloud-native, integrated with Azure

**Migration Path**:
1. Add Serilog sink package (e.g., `Serilog.Sinks.Elasticsearch`)
2. Update `appsettings.json` with sink configuration
3. Deploy aggregation service (ELK, Splunk, etc.)
4. Verify logs flowing to centralized system
5. Create dashboards for authentication metrics

---

## Observability Metrics

### What We Can Track (from logs)

**Performance Metrics**:
- Login response times (via timestamp diffs)
- Session creation latency
- Database query duration (if enabled)

**Security Metrics**:
- Failed login attempts per user
- Failed login attempts per IP
- Successful logins per user
- Session creations per user
- Logouts (explicit vs. expiration)

**Business Metrics**:
- Active users (distinct usernames in logs)
- Peak login hours
- Average session duration

### Sample Queries

**Count logins by user** (PowerShell):
```powershell
$logs = Select-String -Path "logs/webapi-*.log" -Pattern "Authentication successful"
$logs | ForEach-Object { 
    if ($_ -match 'Username: (\w+)') { $matches[1] } 
} | Group-Object | Sort-Object Count -Descending
```

**Failed login attempts in last hour**:
```powershell
$since = (Get-Date).AddHours(-1).ToString("HH:mm:ss")
Select-String -Path "logs/webapi-$(Get-Date -Format 'yyyyMMdd').log" -Pattern "Authentication failed" | Where-Object { $_.Line -match "^(\d{2}:\d{2}:\d{2})" -and $matches[1] -gt $since }
```

---

## Summary

| Task | Description | Status |
|------|-------------|--------|
| T103 | Audit events logged to database | ⚠️ **PARTIAL** (infrastructure exists, integration missing) |
| T104 | Serilog with correlation IDs | ✅ PASS |
| T105 | Log parsing and aggregation | ✅ PASS (file-based) |

**Overall Assessment**: **2/3 PASS** with 1 HIGH priority finding

**Production Readiness**: ⚠️ **CONDITIONAL**
- **Minimum**: Can deploy with file-based logging (current state)
- **Recommended**: Implement database audit logging before production (T103)
- **Ideal**: Add centralized log aggregation (ELK/Splunk) for enterprise deployments

---

## Action Items

1. **HIGH PRIORITY**: Implement `InsertAuditEventAsync` in repository and integrate with `AuthenticationService`
2. **MEDIUM PRIORITY**: Add centralized log aggregation (ELK/Splunk/AppInsights)
3. **LOW PRIORITY**: Create Grafana/Kibana dashboards for authentication metrics

**Estimated Effort**: 4-6 hours for T103 completion

---

**Audit Completed**: February 10, 2026  
**Next Review**: After T103 implementation
