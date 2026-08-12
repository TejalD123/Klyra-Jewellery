import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
} from "./notification.api";

const initialState = {
  items: [],
  pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  unreadCount: 0,
  filters: { type: "", isRead: "" }, // isRead: "" | "true" | "false"
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (params, { rejectWithValue }) => {
    try {
      const res = await fetchNotifications(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  "notifications/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchUnreadCount();
      return res.data.data.count;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load unread count");
    }
  }
);

export const markRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const res = await markNotificationAsRead(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
    }
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark all as read");
    }
  }
);

export const removeNotification = createAsyncThunk(
  "notifications/removeNotification",
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotificationById(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete notification");
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setTypeFilter: (state, action) => {
      state.filters.type = action.payload;
    },
    setIsReadFilter: (state, action) => {
      state.filters.isRead = action.payload;
    },
    // Used by the bell/topbar to bump the badge instantly if you ever wire
    // up a socket/SSE push instead of relying solely on polling.
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((n) => n._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }));
        state.unreadCount = 0;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const removed = state.items.find((n) => n._id === id);
        state.items = state.items.filter((n) => n._id !== id);
        if (removed && !removed.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  },
});

export const { setTypeFilter, setIsReadFilter, incrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;