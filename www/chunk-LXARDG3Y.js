import {
  Injectable,
  SupabaseService,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-AYR3XDH5.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-QXFS4N4X.js";

// src/app/services/social.service.ts
var _SocialService = class _SocialService {
  constructor(supabaseService) {
    this.supabase = supabaseService.client;
  }
  // Posts and Feed
  getSocialFeed(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("social_posts").select(`
          *,
          user_profile:user_profiles(id, name, avatar_url),
          likes:social_likes(user_id),
          likes_count:social_likes(count)
        `).order("created_at", { ascending: false }).limit(50);
        if (error)
          throw error;
        return (data || []).map((post) => __spreadProps(__spreadValues({}, post), {
          likesCount: post.likes_count?.[0]?.count || 0,
          isLiked: post.likes?.some((like) => like.user_id === userId) || false
        }));
      } catch (error) {
        console.error("Error loading social feed:", error);
        return [];
      }
    });
  }
  createPost(userId, content, type = "general", metadata) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("social_posts").insert({
        user_id: userId,
        content,
        type,
        metadata
      });
      if (error)
        throw error;
    });
  }
  shareAchievement(userId, message) {
    return __async(this, null, function* () {
      const { data: latestCompletion } = yield this.supabase.from("habit_completions").select(`
        *,
        habit_business:habit_businesses(business_name, business_icon, earnings_per_completion)
      `).eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
      const content = message || `Just completed my ${latestCompletion?.habit_business?.business_name} habit! \u{1F4AA}`;
      yield this.createPost(userId, content, "achievement", {
        habit_business_id: latestCompletion?.habit_business_id,
        earnings: latestCompletion?.habit_business?.earnings_per_completion
      });
    });
  }
  likePost(postId, userId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("social_likes").insert({
        post_id: postId,
        user_id: userId
      });
      if (error)
        throw error;
    });
  }
  unlikePost(postId, userId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("social_likes").delete().eq("post_id", postId).eq("user_id", userId);
      if (error)
        throw error;
    });
  }
  // Friends
  getFriends(userId) {
    return __async(this, null, function* () {
      try {
        const { data: outgoingFriends, error: outgoingError } = yield this.supabase.from("friendships").select("*").eq("user_id", userId).eq("status", "accepted");
        const { data: incomingFriends, error: incomingError } = yield this.supabase.from("friendships").select("*").eq("friend_id", userId).eq("status", "accepted");
        if (outgoingError) {
          console.error("Error loading outgoing friends:", outgoingError);
        }
        if (incomingError) {
          console.error("Error loading incoming friends:", incomingError);
        }
        const allFriendships = [
          ...outgoingFriends || [],
          ...incomingFriends || []
        ];
        if (allFriendships.length === 0) {
          return [];
        }
        const enrichedFriends = yield Promise.all(allFriendships.map((friendship) => __async(this, null, function* () {
          const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
          console.log("\u{1F50D} Fetching friend profile for user_id:", friendId);
          const { data: friendProfileData, error: profileError } = yield this.supabase.rpc("get_user_profile_for_friend_request", { user_uuid: friendId });
          console.log("\u{1F4CA} Friend profile fetch result:", { friendProfileData, profileError });
          console.log("\u{1F4CA} Raw friendProfileData type:", typeof friendProfileData);
          console.log("\u{1F4CA} Raw friendProfileData value:", JSON.stringify(friendProfileData, null, 2));
          if (profileError) {
            console.error("\u274C Error loading friend profile:", profileError);
          }
          let friendProfile;
          if (Array.isArray(friendProfileData) && friendProfileData.length > 0) {
            friendProfile = friendProfileData[0];
            console.log("\u2705 Using first element from array:", friendProfile);
          } else if (friendProfileData && !Array.isArray(friendProfileData)) {
            friendProfile = friendProfileData;
            console.log("\u2705 Using direct object:", friendProfile);
          } else {
            friendProfile = {
              id: friendId,
              name: "Unknown User",
              email: "unknown@email.com",
              cash: 0,
              net_worth: 0
            };
            console.log("\u274C Using fallback profile:", friendProfile);
          }
          console.log("\u2705 Final friend profile:", friendProfile);
          return __spreadProps(__spreadValues({}, friendship), {
            friend_profile: friendProfile
            // Use the complete profile with all data
          });
        })));
        const uniqueFriends = enrichedFriends.filter((friend, index, self) => index === self.findIndex((f) => f.friend_profile.id === friend.friend_profile.id));
        return uniqueFriends;
      } catch (error) {
        console.error("Error loading friends:", error);
        return [];
      }
    });
  }
  // Get pending friend requests (incoming)
  getPendingRequests(userId) {
    return __async(this, null, function* () {
      try {
        const { data: friendships, error } = yield this.supabase.from("friendships").select("*").eq("friend_id", userId).eq("status", "pending");
        if (error) {
          console.error("Error loading pending requests:", error);
          return [];
        }
        if (!friendships || friendships.length === 0) {
          return [];
        }
        const enrichedRequests = yield Promise.all(friendships.map((friendship) => __async(this, null, function* () {
          console.log("\u{1F50D} Fetching profile for user_id:", friendship.user_id);
          const { data: profileData, error: profileError } = yield this.supabase.rpc("get_user_profile_for_friend_request", { user_uuid: friendship.user_id });
          console.log("\u{1F4CA} Profile fetch result:", {
            profileData,
            profileError,
            dataType: typeof profileData,
            isArray: Array.isArray(profileData)
          });
          if (profileError) {
            console.error("\u274C Error loading sender profile:", profileError);
          }
          let senderProfile;
          if (Array.isArray(profileData) && profileData.length > 0) {
            senderProfile = profileData[0];
          } else {
            senderProfile = {
              id: friendship.user_id,
              name: "Unknown User",
              email: "unknown@email.com"
            };
          }
          console.log("\u2705 Using sender profile:", senderProfile);
          return __spreadProps(__spreadValues({}, friendship), {
            sender_profile: senderProfile
          });
        })));
        return enrichedRequests;
      } catch (error) {
        console.error("Error loading pending requests:", error);
        return [];
      }
    });
  }
  // Get sent friend requests (outgoing)
  getSentRequests(userId) {
    return __async(this, null, function* () {
      try {
        const { data: friendships, error } = yield this.supabase.from("friendships").select("*").eq("user_id", userId).eq("status", "pending");
        if (error) {
          console.error("Error loading sent requests:", error);
          return [];
        }
        if (!friendships || friendships.length === 0) {
          return [];
        }
        const enrichedRequests = yield Promise.all(friendships.map((friendship) => __async(this, null, function* () {
          const { data: recipientProfileData, error: profileError } = yield this.supabase.rpc("get_user_profile_for_friend_request", { user_uuid: friendship.friend_id });
          if (profileError) {
            console.error("Error loading recipient profile:", profileError);
          }
          let recipientProfile;
          if (Array.isArray(recipientProfileData) && recipientProfileData.length > 0) {
            recipientProfile = recipientProfileData[0];
          } else {
            recipientProfile = {
              id: friendship.friend_id,
              name: "Unknown User",
              email: "unknown@email.com"
            };
          }
          return __spreadProps(__spreadValues({}, friendship), {
            recipient_profile: recipientProfile
          });
        })));
        return enrichedRequests;
      } catch (error) {
        console.error("Error loading sent requests:", error);
        return [];
      }
    });
  }
  sendFriendRequest(userId, friendIdentifier) {
    return __async(this, null, function* () {
      const { data: searchResults, error: searchError } = yield this.supabase.rpc("search_users_for_friend_request", { search_term: friendIdentifier });
      if (searchError) {
        console.error("Search error:", searchError);
        throw new Error("Error searching for user");
      }
      if (!searchResults || searchResults.length === 0) {
        throw new Error("User not found");
      }
      let friendUser = searchResults.find((user) => user.email.toLowerCase() === friendIdentifier.toLowerCase());
      if (!friendUser) {
        friendUser = searchResults[0];
      }
      if (friendUser.id === userId) {
        throw new Error("You cannot send a friend request to yourself");
      }
      const { data: existingFriendship } = yield this.supabase.from("friendships").select("id, status").or(`and(user_id.eq.${userId},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${userId})`).maybeSingle();
      if (existingFriendship) {
        if (existingFriendship.status === "accepted") {
          throw new Error("You are already friends with this user");
        } else if (existingFriendship.status === "pending") {
          throw new Error("Friend request already sent or pending");
        } else if (existingFriendship.status === "declined") {
          const { error: deleteError } = yield this.supabase.from("friendships").delete().eq("id", existingFriendship.id);
          if (deleteError) {
            console.error("Error deleting declined friendship:", deleteError);
            throw new Error("Error resending friend request");
          }
        }
      }
      const { error } = yield this.supabase.from("friendships").insert({
        user_id: userId,
        friend_id: friendUser.id,
        status: "pending"
      });
      if (error)
        throw error;
    });
  }
  // Accept a friend request
  acceptFriendRequest(requestId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("friendships").update({ status: "accepted" }).eq("id", requestId);
      if (error)
        throw error;
    });
  }
  // Decline a friend request
  declineFriendRequest(requestId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("friendships").update({ status: "declined" }).eq("id", requestId);
      if (error)
        throw error;
    });
  }
  // Remove a friend (delete the friendship)
  removeFriend(userId, friendId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("friendships").delete().or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
      if (error)
        throw error;
    });
  }
  // Challenges
  getActiveChallenges(userId) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.from("challenges").select(`
          *,
          creator_profile:user_profiles!challenges_creator_id_fkey(name),
          participants:challenge_participants(user_id),
          participants_count:challenge_participants(count)
        `).eq("is_active", true).gte("end_date", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: false });
        if (error)
          throw error;
        return (data || []).map((challenge) => __spreadProps(__spreadValues({}, challenge), {
          participants_count: challenge.participants_count?.[0]?.count || 0,
          is_participant: challenge.participants?.some((p) => p.user_id === userId) || false
        }));
      } catch (error) {
        console.error("Error loading challenges:", error);
        return [];
      }
    });
  }
  createChallenge(userId, title, description, durationDays) {
    return __async(this, null, function* () {
      const startDate = /* @__PURE__ */ new Date();
      const endDate = /* @__PURE__ */ new Date();
      endDate.setDate(startDate.getDate() + durationDays);
      const { data: challenge, error } = yield this.supabase.from("challenges").insert({
        creator_id: userId,
        title,
        description,
        duration_days: durationDays,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true
      }).select().single();
      if (error)
        throw error;
      yield this.joinChallenge(challenge.id, userId);
    });
  }
  joinChallenge(challengeId, userId) {
    return __async(this, null, function* () {
      const { error } = yield this.supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: userId
      });
      if (error)
        throw error;
    });
  }
  // Social Pokes
  sendHabitPoke(fromUserId, toUserId, habitBusinessName) {
    return __async(this, null, function* () {
      try {
        const { data, error } = yield this.supabase.rpc("send_habit_poke", {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          business_name: habitBusinessName
        });
        if (error) {
          console.error("Error sending habit poke:", error);
          throw error;
        }
        if (!data.success) {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Error in sendHabitPoke:", error);
        throw new Error("Failed to send reminder. Please try again.");
      }
    });
  }
  sendStockholderReminder(fromUserId, toUserId, businessName, fromUserName) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} Social service sending reminder:", {
          fromUserId,
          toUserId,
          businessName,
          fromUserName
        });
        const { data, error } = yield this.supabase.rpc("send_stockholder_reminder", {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          business_name: businessName,
          from_user_name: fromUserName
        });
        console.log("\u{1F50D} RPC response:", { data, error });
        if (error) {
          console.error("\u274C RPC Error sending stockholder reminder:", error);
          throw new Error(`Database error: ${error.message}`);
        }
        if (data && !data.success) {
          console.error("\u274C Function returned error:", data);
          throw new Error(data.error || "Function execution failed");
        }
        console.log("\u2705 Reminder sent successfully");
      } catch (error) {
        console.error("\u274C Error in sendStockholderReminder:", error);
        throw new Error(`Failed to send stockholder reminder: ${error?.message || "Unknown error"}`);
      }
    });
  }
  getUserPokes(userId) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} SocialService: Loading pokes for user:", userId);
        const { data, error } = yield this.supabase.rpc("get_user_social_notifications", { user_uuid: userId });
        if (error) {
          console.error("\u274C Error loading pokes:", error);
          throw error;
        }
        console.log("\u{1F50D} Raw pokes data from database:", data);
        console.log("\u{1F50D} First poke structure:", data?.[0]);
        const transformedData = (data || []).map((poke) => __spreadProps(__spreadValues({}, poke), {
          id: poke.poke_id,
          // Map poke_id to id
          type: poke.poke_type
          // Map poke_type to type for consistency
        }));
        console.log("\u{1F50D} Transformed pokes data:", transformedData);
        console.log("\u{1F50D} First transformed poke:", transformedData?.[0]);
        return transformedData;
      } catch (error) {
        console.error("Error loading pokes:", error);
        return [];
      }
    });
  }
  markPokeAsRead(pokeId) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F50D} SocialService: Marking poke as read:", pokeId);
        const { error } = yield this.supabase.from("social_pokes").update({ is_read: true }).eq("id", pokeId);
        if (error) {
          console.error("\u274C Database error:", error);
          throw error;
        }
        console.log("\u2705 SocialService: Successfully marked poke as read");
      } catch (error) {
        console.error("\u274C SocialService: Error marking poke as read:", error);
        throw error;
      }
    });
  }
  deleteNotification(notificationId) {
    return __async(this, null, function* () {
      try {
        console.log("\u{1F5D1}\uFE0F SocialService: Deleting notification:", notificationId);
        console.log("\u{1F50D} Notification ID type:", typeof notificationId);
        console.log("\u{1F50D} Notification ID valid:", !!notificationId);
        if (!notificationId) {
          throw new Error("Notification ID is required for deletion");
        }
        const { data, error } = yield this.supabase.from("social_pokes").delete().eq("id", notificationId).select();
        console.log("\u{1F50D} Delete operation result:", { data, error });
        if (error) {
          console.error("\u274C Database error deleting notification:", error);
          throw error;
        }
        if (!data || data.length === 0) {
          console.warn("\u26A0\uFE0F No notification was deleted - ID might not exist:", notificationId);
          throw new Error("Notification not found or already deleted");
        }
        console.log("\u2705 SocialService: Notification deleted successfully:", data);
      } catch (error) {
        console.error("\u274C SocialService: Error deleting notification:", error);
        throw error;
      }
    });
  }
  // Friends-only Leaderboard
  getFriendsLeaderboard(userId) {
    return __async(this, null, function* () {
      try {
        const { data: userProfile, error: userError } = yield this.supabase.from("user_profiles").select("*").eq("id", userId).single();
        if (userError) {
          console.error("Error loading user profile:", userError);
          return [{
            id: userId,
            name: "You",
            avatar_url: "",
            net_worth: 0,
            cash: 0,
            rank: 1
          }];
        }
        const friends = yield this.getFriends(userId);
        const leaderboard = [
          // Current user - use stored net_worth from database like home screen does
          {
            id: userProfile.id,
            name: "You",
            // Override name to show "You"
            avatar_url: userProfile.avatar_url || "",
            net_worth: userProfile.net_worth || 0,
            // Use stored net_worth like home screen
            cash: userProfile.cash || 0,
            rank: 1
          }
        ];
        if (friends && friends.length > 0) {
          const friendsData = friends.map((friend) => ({
            id: friend.friend_profile.id,
            name: friend.friend_profile.name,
            avatar_url: friend.friend_profile.avatar_url || "",
            net_worth: friend.friend_profile.net_worth || 0,
            // Use stored net_worth from database
            cash: friend.friend_profile.cash || 0,
            rank: 0
          }));
          leaderboard.push(...friendsData);
          leaderboard.sort((a, b) => b.net_worth - a.net_worth);
          leaderboard.forEach((user, index) => {
            user.rank = index + 1;
          });
        }
        return leaderboard;
      } catch (error) {
        console.error("Error loading friends leaderboard:", error);
        return [{
          id: userId,
          name: "You",
          avatar_url: "",
          net_worth: 0,
          cash: 0,
          rank: 1
        }];
      }
    });
  }
  // Weekly Habit Cash Earned Leaderboard (resets at the start of the user's local week)
  getFriendsCashLeaderboard(userId, weekStart) {
    return __async(this, null, function* () {
      try {
        const { data: userProfile, error: userError } = yield this.supabase.from("user_profiles").select("id, name").eq("id", userId).single();
        if (userError) {
          console.error("Error loading user profile for cash leaderboard:", userError);
        }
        const friends = yield this.getFriends(userId);
        const allIds = [userId, ...friends.map((f) => f.friend_profile.id)];
        const { data: earningsData, error: earningsError } = yield this.supabase.rpc("get_users_cash_earned", { user_ids: allIds, period: "weekly", week_start: weekStart.toISOString() });
        if (earningsError) {
          console.error("Error loading cash earned leaderboard:", earningsError);
        }
        const earningsMap = {};
        if (earningsData) {
          for (const row of earningsData) {
            earningsMap[row.user_id] = Number(row.total_earned) || 0;
          }
        }
        const leaderboard = [
          {
            id: userId,
            name: "You",
            cash_earned: earningsMap[userId] ?? 0,
            rank: 1
          }
        ];
        if (friends.length > 0) {
          const friendEntries = friends.map((f) => ({
            id: f.friend_profile.id,
            name: f.friend_profile.name,
            cash_earned: earningsMap[f.friend_profile.id] ?? 0,
            rank: 0
          }));
          leaderboard.push(...friendEntries);
          leaderboard.sort((a, b) => b.cash_earned - a.cash_earned);
          leaderboard.forEach((entry, i) => {
            entry.rank = i + 1;
          });
        }
        return leaderboard;
      } catch (error) {
        console.error("Error loading friends cash leaderboard:", error);
        return [{
          id: userId,
          name: "You",
          cash_earned: 0,
          rank: 1
        }];
      }
    });
  }
  // Weekly Habits Completed Leaderboard (resets at the start of the user's local week)
  getFriendsHabitsCompletedLeaderboard(userId, weekStart) {
    return __async(this, null, function* () {
      try {
        const friends = yield this.getFriends(userId);
        const allIds = [userId, ...friends.map((f) => f.friend_profile.id)];
        const { data: completionsData, error: completionsError } = yield this.supabase.rpc("get_users_habits_completed", { user_ids: allIds, week_start: weekStart.toISOString() });
        if (completionsError) {
          console.error("Error loading habits completed leaderboard:", completionsError);
        }
        const completionsMap = {};
        if (completionsData) {
          for (const row of completionsData) {
            completionsMap[row.user_id] = Number(row.total_completed) || 0;
          }
        }
        const leaderboard = [
          {
            id: userId,
            name: "You",
            habits_completed: completionsMap[userId] ?? 0,
            rank: 1
          }
        ];
        if (friends.length > 0) {
          const friendEntries = friends.map((f) => ({
            id: f.friend_profile.id,
            name: f.friend_profile.name,
            habits_completed: completionsMap[f.friend_profile.id] ?? 0,
            rank: 0
          }));
          leaderboard.push(...friendEntries);
          leaderboard.sort((a, b) => b.habits_completed - a.habits_completed);
          leaderboard.forEach((entry, i) => {
            entry.rank = i + 1;
          });
        }
        return leaderboard;
      } catch (error) {
        console.error("Error loading friends habits completed leaderboard:", error);
        return [{
          id: userId,
          name: "You",
          habits_completed: 0,
          rank: 1
        }];
      }
    });
  }
};
_SocialService.\u0275fac = function SocialService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || _SocialService)(\u0275\u0275inject(SupabaseService));
};
_SocialService.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _SocialService, factory: _SocialService.\u0275fac, providedIn: "root" });
var SocialService = _SocialService;
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SocialService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: SupabaseService }], null);
})();

export {
  SocialService
};
//# sourceMappingURL=chunk-LXARDG3Y.js.map
