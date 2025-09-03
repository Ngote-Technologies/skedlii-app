# V2 Authentication Infrastructure Implementation

**Date**: 2025-09-02  
**Status**: ✅ Complete

## Summary
Successfully implemented dual API configuration infrastructure and V2 authentication integration in skedlii-app frontend, enabling gradual migration from V1 to V2 endpoints with feature flag control.

## Problem
Frontend application was tightly coupled to V1 API endpoints with no migration path to V2. Direct migration would require a complete rewrite and risk breaking existing functionality during transition.

## Root Cause Analysis
1. **Tight Coupling**: Single Axios instance hardcoded to V1 endpoints
2. **Response Format Dependencies**: Frontend expected specific V1 response structures
3. **No Migration Strategy**: No infrastructure for gradual API version rollout
4. **Authentication Complexity**: V2 introduced refresh token rotation not present in V1

## Solution Implemented

### 1. **Dual API Configuration Infrastructure**
**File**: `src/api/axios.ts`

Implemented sophisticated API version switching system:
```typescript
// Dual instance configuration
const axiosV1Instance = axios.create({
  baseURL: import.meta.env.VITE_API_V1_URL,
  // V1 specific configuration
});

const axiosV2Instance = axios.create({
  baseURL: import.meta.env.VITE_API_V2_URL,
  // V2 specific configuration with refresh token handling
});

// Feature flag utilities
export const useV2Api = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature] && import.meta.env.VITE_API_V2_BASE_URL;
};

export const getApiClient = (version?: 'v1' | 'v2'): AxiosInstance => {
  if (version === 'v1') return axiosV1Instance;
  if (version === 'v2') return axiosV2Instance;
  return axiosInstance; // Default based on feature flags
};
```

**Key Features**:
- Feature flag system for gradual rollout per API domain
- Environment-based configuration with fallbacks
- Automatic API version selection based on feature flags
- Enhanced error handling with automatic token refresh for V2

### 2. **V2 Authentication API Integration**
**File**: `src/api/auth.ts`

Created comprehensive V2 authentication methods:
```typescript
// V2-specific response interfaces
interface LoginResponseV2 {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
    defaultOrganizationId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Adaptive authentication API
export const authApi = {
  loginUser: async (credentials: any) => {
    const useV2 = useV2Api('auth');
    if (useV2) {
      const v2Credentials = { email: credentials.email, password: credentials.password };
      return authApiV2.loginUser(v2Credentials);
    } else {
      return authApiV1.loginUser(credentials);
    }
  },
  // ... other adaptive methods
};
```

**Complete Authentication Coverage**:
- ✅ Login with dual API support
- ✅ Registration with dual API support
- ✅ Password reset flow (forgot-password, reset-password)
- ✅ Account management (delete account)
- ✅ User profile fetching (/me endpoint)
- ✅ Authentication event logging
- ✅ Permission refresh endpoint integration

### 3. **Response Format Adaptation**
**File**: `src/store/authStore.ts`

Implemented sophisticated response adapters for V1/V2 compatibility:
```typescript
const adaptLoginResponse = (response: LoginResponse | LoginResponseV2, isV2: boolean) => {
  if (isV2) {
    const v2Response = response as LoginResponseV2;
    return {
      token: v2Response.accessToken,
      refreshToken: v2Response.refreshToken,
      user: v2Response.user,
      // V2 defaults - will be enhanced when V2 API provides full data
      organization: null,
      teams: [],
      computedPermissions: { /* basic defaults */ },
      subscriptionInfo: { /* default values */ }
    };
  } else {
    // V1 response handling
    const v1Response = response as LoginResponse;
    return {
      token: v1Response.token,
      refreshToken: null,
      user: v1Response.user,
      organization: v1Response.organization,
      teams: v1Response.teams || [],
      computedPermissions: v1Response.computedPermissions,
      subscriptionInfo: v1Response.subscriptionInfo
    };
  }
};
```

### 4. **Enhanced Error Handling & Token Management**
**Automatic Token Refresh for V2**:
```typescript
// V2 response interceptor with automatic token refresh
axiosV2Instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('auth_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          // Retry original request with new token
          return axiosV2Instance(originalRequest);
        } catch (refreshError) {
          await logoutUser();
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### 5. **Environment Configuration Updates**
**File**: `.env.example`

Added comprehensive V2 configuration options:
```env
# V2 API Configuration
VITE_API_V2_BASE_URL=http://localhost:3001

# Feature flags for gradual migration
VITE_USE_V2_AUTH=true
VITE_USE_V2_ORGANIZATIONS=false
VITE_USE_V2_POSTS=false
VITE_USE_V2_SOCIAL_ACCOUNTS=false
VITE_USE_V2_TEAMS=false
VITE_USE_V2_BILLING=false
```

## Technical Challenges Resolved

### 1. **CORS Configuration**
**Issue**: V2 API blocked requests with custom headers
**Solution**: Removed problematic `X-API-Version` header, configured proper CORS handling

### 2. **Authentication Header Management**
**Issue**: V2 login endpoint doesn't require auth headers, but interceptor was adding them
**Solution**: Added endpoint detection to skip auth headers for auth-related endpoints:
```typescript
const isAuthEndpoint = request.url?.includes('/auth/login') || 
                      request.url?.includes('/auth/register');
if (!isAuthEndpoint) {
  request.headers.Authorization = `Bearer ${token}`;
}
```

### 3. **Refresh Token Storage**
**Issue**: V1 didn't use refresh tokens, V2 requires them
**Solution**: Enhanced localStorage management with dual token support

## Results & Verification

### ✅ **Authentication Flow Working**:
- **V2 Login**: Successfully authenticates users with V2 endpoints
- **Token Management**: Access tokens and refresh tokens properly stored and managed
- **Automatic Refresh**: Token rotation working without user intervention
- **Error Handling**: Proper logout on refresh token expiration
- **Backwards Compatibility**: V1 auth flow remains functional

### ✅ **Infrastructure Benefits**:
- **Gradual Migration**: Can enable/disable V2 features independently
- **Rollback Safety**: Can instantly revert to V1 for any feature
- **Development Flexibility**: Developers can test V2 features in isolation
- **Production Safety**: Feature flags allow careful rollout control

### ✅ **Code Quality Improvements**:
- **Type Safety**: Full TypeScript coverage for V2 response formats
- **Error Boundaries**: Enhanced error handling for auth failures
- **Maintainability**: Clean separation of V1 and V2 logic
- **Testing**: Easier to test individual API versions

## Current Limitations & Known Issues

### ❌ **V2 API Gaps** (Blocking Full Migration):
1. **Permission System**: V2 `/auth/refresh-permissions` returns stub `{ok: true}`
2. **Computed Permissions**: V2 auth responses missing computed permissions
3. **Subscription Context**: V2 auth responses missing subscription information
4. **User Object Structure**: V2 user object missing `role` and `userType` fields

### ⚠️ **Temporary Workarounds** (Until V2 Complete):
- Client-side basic permission computation for V2
- Default subscription info until billing integration
- Multi-call pattern for complete user context

## Impact Assessment

### **Development Impact**:
- **Phase 1 (Auth)**: ✅ **UNBLOCKED** - Infrastructure ready for V2 migration
- **Phase 2+**: ⏸️ **READY** - Can proceed once V2 API gaps resolved
- **Development Workflow**: Enhanced with feature flag control
- **Testing Strategy**: Can test V1/V2 APIs independently

### **User Experience Impact**:
- **Performance**: V2 endpoints show improved response times
- **Security**: Enhanced with refresh token rotation
- **Reliability**: Dual API support provides fallback options
- **Future Features**: Foundation ready for V2-exclusive capabilities

### **Business Impact**:
- **Migration Risk**: Significantly reduced with gradual rollout capability
- **Development Velocity**: Unblocked frontend team from V2 API dependency
- **Technical Debt**: Clean architecture prevents future migration complications
- **Scalability**: Infrastructure ready for multi-version API management

## Follow-up Actions

### **Immediate (Frontend)**:
1. ✅ Documentation of V2 API integration requirements
2. ✅ Project status tracking system setup
3. ⏳ Waiting for V2 API permission system completion

### **Next Phase Dependencies (Backend)**:
1. Complete V2 `/auth/refresh-permissions` implementation
2. Add computed permissions to V2 auth responses
3. Integrate subscription context in V2 auth system
4. Enhance V2 user object with role/userType fields

### **Future Enhancements (Frontend)**:
1. Enhanced loading states for auth flows
2. Better error messaging for permission-related issues
3. User feedback systems for role/subscription changes
4. Performance optimizations for dual API management

## Validation & Testing

### **Testing Coverage**:
- ✅ V2 login flow end-to-end testing
- ✅ Token refresh rotation verification
- ✅ Error handling with invalid tokens
- ✅ Feature flag switching between V1/V2
- ✅ CORS resolution verification
- ✅ Backwards compatibility with V1 endpoints

### **Performance Verification**:
- ✅ V2 API response times (improved over V1)
- ✅ Token refresh operation latency
- ✅ Memory usage with dual API instances
- ✅ Browser compatibility across major browsers

---

**Impact**: Successfully established foundation for V1 to V2 migration with zero risk gradual rollout capability, enhanced security through refresh token rotation, and maintained full backwards compatibility.

**Next Steps**: V2 API permission system completion required to unblock remaining migration phases. Frontend infrastructure ready to proceed immediately once backend gaps resolved.