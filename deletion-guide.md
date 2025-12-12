# Account Deletion Implementation Guide

## Overview

Users can now delete their own accounts, which will automatically cascade delete all related records (bets, pool memberships, etc.).

---

## Backend Implementation

### 1. Cascade Delete Hook

The Users collection has a `beforeDelete` hook that automatically deletes:
- All bets placed by the user
- All pool memberships
- Any other user-related records

### 2. Access Control

- **Users**: Can delete their own account only
- **Admins**: Can delete any user account

### 3. Custom Endpoint

A dedicated endpoint is available for self-service account deletion:

**Endpoint:** `DELETE /api/users/delete-account`

---

## Frontend Implementation (React Native)

### Example 1: Delete Account Function

```typescript
// utils/api.ts
export const deleteAccount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Include auth token/cookie if needed
      },
      credentials: 'include', // Important for session cookies
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete account')
    }

    return data
  } catch (error) {
    console.error('Account deletion error:', error)
    throw error
  }
}
```

### Example 2: Delete Account Component

```typescript
// components/DeleteAccountButton.tsx
import React, { useState } from 'react'
import { Alert, Button, View, Text } from 'react-native'
import { deleteAccount } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export const DeleteAccountButton = () => {
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()

  const handleDeleteAccount = async () => {
    // First confirmation
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDeletion(),
        },
      ]
    )
  }

  const confirmDeletion = () => {
    // Second confirmation for safety
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete:\n\n• Your account\n• All your bets\n• Your pool memberships\n• All personal data\n\nThis cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => performDeletion(),
        },
      ]
    )
  }

  const performDeletion = async () => {
    setLoading(true)

    try {
      await deleteAccount()

      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Logout and redirect to welcome screen
              logout()
              // navigation.navigate('Welcome')
            },
          },
        ]
      )
    } catch (error) {
      Alert.alert(
        'Deletion Failed',
        error.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10, color: '#666' }}>
        Delete your account and all associated data permanently.
      </Text>
      <Button
        title={loading ? 'Deleting...' : 'Delete Account'}
        onPress={handleDeleteAccount}
        color="red"
        disabled={loading}
      />
    </View>
  )
}
```

### Example 3: Using Axios

```typescript
// utils/api.ts
import axios from 'axios'

export const deleteAccount = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/users/delete-account`,
      {
        withCredentials: true, // Important for cookies
      }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete account')
    }
    throw error
  }
}
```

---

## Testing

### Test Account Deletion

1. **Create a test user** with some data:
   ```bash
   # Create user, place some bets, join a pool
   ```

2. **Delete the account** via API:
   ```bash
   curl -X DELETE http://localhost:3000/api/users/delete-account \
     -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
   ```

3. **Verify cascade deletion**:
   - Check that user is deleted
   - Check that all bets are deleted
   - Check that all pool memberships are deleted

### Check Server Logs

The deletion process logs all actions:
```
[User Deletion] Starting cascade delete for user: abc-123
[User Deletion] Deleting 15 bets...
[User Deletion] Deleting 3 pool memberships...
[User Deletion] Cascade delete completed for user: abc-123
[Account Deletion] User abc-123 (user@example.com) requested account deletion
[Account Deletion] Successfully deleted user abc-123
```

---

## Security Considerations

1. **Double Confirmation**: Always require explicit user confirmation before deletion
2. **Rate Limiting**: Consider rate limiting the deletion endpoint to prevent abuse
3. **Audit Logging**: All deletions are logged with user ID and timestamp
4. **No Recovery**: Make it clear to users that deletion is permanent
5. **Session Cleanup**: Sessions are automatically cleared after deletion

---

## Database Backup (Optional)

If you want to archive deleted accounts before removing them:

```typescript
// In the beforeDelete hook, add archiving:
const archiveData = {
  user: doc,
  bets: bets.docs,
  memberships: memberships.docs,
  deletedAt: new Date(),
}

// Save to archive collection or external storage
await payload.create({
  collection: 'deleted-accounts-archive',
  data: archiveData,
})
```

---

## Support

If a user accidentally deletes their account and requests restoration, you can:
1. Check the server logs for the deletion timestamp
2. Check database backups if available
3. Restore from archive collection if implemented

**Note:** By default, deletion is permanent with no recovery option.
