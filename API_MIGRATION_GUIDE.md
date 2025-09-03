# API Migration Guide: V1 to V2 Transition Strategy

## Overview

This document outlines the comprehensive migration strategy implemented to transition the Skedlii frontend application from V1 to V2 API endpoints while maintaining backwards compatibility and zero downtime.

## Migration Architecture

### Dual-Instance Axios Configuration

The migration uses a **dual-instance approach** with separate Axios clients for V1 and V2 APIs:

```typescript
// Environment-based configuration
const API_V1_URL = process.env.VITE_API_V1_URL || '/api'
const API_V2_URL = process.env.VITE_API_V2_URL || '/api'
const USE_V2_API = process.env.VITE_USE_V2_API === 'true'

// Separate instances for each API version
export const axiosV1Instance = axios.create({ baseURL: API_V1_URL })
export const axiosV2Instance = axios.create({ baseURL: API_V2_URL })

// Utility for version selection
export const getApiClient = (version?: 'v1' | 'v2'): AxiosInstance => {
  if (version === 'v1') return axiosV1Instance;
  if (version === 'v2') return axiosV2Instance;
  return axiosInstance; // Default based on global flag
}
```

### Feature Flag System

Granular control over V2 adoption through feature flags:

```bash
# Global V2 flag
VITE_USE_V2_API=false

# Feature-specific flags for gradual rollout
VITE_USE_V2_AUTH=true      # Enable V2 authentication
VITE_USE_V2_SOCIAL=false   # Keep V1 social media endpoints
VITE_USE_V2_BILLING=false  # Keep V1 billing endpoints
```

### Enhanced Error Handling

V2-specific error standardization with automatic retry logic:

```typescript
// V2 API: Handle standardized error format
if (version === 'v2' && errorData) {
  const standardizedError = {
    ...error,
    response: {
      ...error.response,
      data: {
        code: errorData.code || 'unknown_error',
        message: errorData.message || 'An error occurred',
        details: errorData.details,
        traceId: errorData.traceId,
      }
    }
  };
  return Promise.reject(standardizedError);
}
```

### Refresh Token Rotation (V2 Enhancement)

Automatic token refresh with retry logic:

```typescript
// V2-specific refresh token rotation
if (version === 'v2' && localStorage.getItem("refresh_token")) {
  try {
    const refreshResponse = await axiosV2Instance.post('/auth/refresh', {
      refreshToken: localStorage.getItem("refresh_token")
    });
    
    if (refreshResponse.data.accessToken) {
      // Update tokens and retry original request
      localStorage.setItem("auth_token", refreshResponse.data.accessToken);
      localStorage.setItem("refresh_token", refreshResponse.data.refreshToken);
      
      const originalRequest = error.config;
      originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
      return axios.request(originalRequest);
    }
  } catch (refreshError) {
    // Fall back to logout if refresh fails
    await logoutUser();
  }
}
```

## Phase 1 Implementation: Authentication Core

### Authentication API Adaptation

Dual-API authentication with response format adaptation:

```typescript
// Adaptive auth API
export const authApi = {
  loginUser: async (credentials: any) => {
    const useV2 = useV2Api('auth');
    
    if (useV2) {
      // V2: Simple email/password format
      const v2Credentials = {
        email: credentials.email,
        password: credentials.password,
      };
      return authApiV2.loginUser(v2Credentials);
    } else {
      // V1: Original format
      return authApiV1.loginUser(credentials);
    }
  },
  // ... other methods
};
```

### Response Format Adapters

Unified response handling across API versions:

```typescript
const adaptLoginResponse = (response: LoginResponse | LoginResponseV2, isV2: boolean) => {
  if (isV2) {
    const v2Response = response as LoginResponseV2;
    return {
      token: v2Response.accessToken,
      refreshToken: v2Response.refreshToken,
      user: v2Response.user,
      // V2 requires separate calls for organization/teams
      organization: null,
      teams: [],
      computedPermissions: { /* defaults */ },
      subscriptionInfo: { /* defaults */ },
    };
  } else {
    // V1 format with full response
    const v1Response = response as LoginResponse;
    return {
      token: v1Response.token,
      refreshToken: null,
      user: v1Response.user,
      organization: v1Response.organization,
      teams: v1Response.teams || [],
      computedPermissions: v1Response.computedPermissions,
      subscriptionInfo: v1Response.subscriptionInfo,
    };
  }
};
```

### Auth Store Enhancements

Enhanced Zustand store with V2 compatibility:

```typescript
interface AuthState {
  // Enhanced token management
  token: string | null;
  refreshToken: string | null; // V2 specific
  
  // Response adaptation logic
  login: async (email, password) => {
    const rawResponse = await authApi.loginUser({ email, password });
    const isV2 = useV2Api('auth');
    const data = adaptLoginResponse(rawResponse, isV2);
    
    // Store appropriate tokens
    localStorage.setItem("auth_token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("refresh_token", data.refreshToken);
    }
    
    // Update store state
    set({
      token: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
      // ... rest of state
    });
  },
};
```

## Migration Benefits Achieved

### 1. **Zero Downtime Migration**
- Parallel API support ensures no service interruption
- Feature flags enable gradual rollout per user cohort
- Instant rollback capability to V1 if issues arise

### 2. **Enhanced Security**
- V2 refresh token rotation prevents token reuse attacks  
- Automatic token refresh reduces authentication friction
- Better error handling with standardized error codes

### 3. **Improved Performance**
- V2's modular architecture reduces response payload size
- Enhanced caching strategies in V2 interceptors
- Reduced authentication round trips with refresh tokens

### 4. **Better Error Visibility**
- Standardized error codes (`validation_error`, `service_error`, etc.)
- Trace IDs for debugging (`traceId` field)
- Consistent error response format across all endpoints

### 5. **Future-Proof Architecture**
- OpenAPI documentation for type safety
- Feature flag infrastructure for future migrations
- Modular endpoint migration approach

## Environment Configuration

### Development Setup

```bash
# .env.local for development
VITE_API_V1_URL=http://localhost:3001/api
VITE_API_V2_URL=http://localhost:3002/api
VITE_USE_V2_API=false

# Enable V2 auth for testing
VITE_USE_V2_AUTH=true
```

### Production Deployment

```bash
# Production environment variables
VITE_API_V1_URL=https://api.skedlii.com/v1
VITE_API_V2_URL=https://api.skedlii.com/v2
VITE_USE_V2_API=false

# Gradual feature rollout
VITE_USE_V2_AUTH=true     # Authentication: fully migrated
VITE_USE_V2_SOCIAL=false  # Social: pending migration
VITE_USE_V2_BILLING=false # Billing: pending migration
```

## Next Phases

### Phase 2: User & Organization Management (Weeks 2-3)
- Migrate user CRUD operations
- Update organization endpoints with enhanced RBAC
- Implement V2's membership model

### Phase 3: Social Media Core (Weeks 3-4)
- OAuth flows with enhanced security
- Platform-specific authentication endpoints
- BullMQ job queue integration

### Phase 4: Content & Collections (Weeks 4-5)
- Content management with cursor pagination
- Collections with organization scoping
- Media upload optimization

### Phase 5: Billing & Analytics (Weeks 5-6)
- Stripe integration enhancements
- Subscription management
- Analytics with improved data models

## Testing Strategy

### Unit Tests
```bash
# Test both API versions
npm run test:auth-v1
npm run test:auth-v2
```

### Integration Tests
```bash
# Test API version switching
npm run test:migration
```

### E2E Tests
```bash
# Test complete authentication flows
npm run test:e2e:auth
```

## Monitoring & Rollback

### Success Metrics
- API response times (target: <200ms P95)
- Authentication success rates (target: >99.5%)
- Error rate reduction with V2 (target: <0.5%)

### Rollback Strategy
1. Set `VITE_USE_V2_AUTH=false` in environment
2. Restart frontend service
3. Monitor authentication success rates
4. V1 API remains fully functional during rollback

### Monitoring
- Track V1 vs V2 usage with API version headers
- Monitor error rates by API version
- Alert on authentication failure spikes

## Security Considerations

### Token Management
- V2 refresh tokens stored securely in localStorage
- Automatic token cleanup on logout
- Protection against token reuse attacks

### Error Information Leakage
- Sanitized error messages to prevent information disclosure
- Consistent error responses regardless of API version
- Secure logging with PII redaction

## Conclusion

This migration approach provides a robust, secure, and maintainable path from V1 to V2 APIs while ensuring zero downtime and excellent user experience. The feature flag system enables controlled rollout, while the dual-instance architecture provides flexibility and safety.

The implemented Phase 1 (Authentication Core) demonstrates the effectiveness of this approach and provides a solid foundation for subsequent phases of the migration.