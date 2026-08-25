import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { MarketplaceService } from './marketplace.service';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    cash: number;
    net_worth: number;
  };
  // Whether this friend can see the current user's stocks / marketplace
  // listings. Defaults to true (visible) when no row exists yet.
  show_stocks: boolean;
  show_marketplace: boolean;
  // Whether this friend appears on the current user's own leaderboards.
  // Defaults to true (shown) when no row exists yet. Unlike the two fields
  // above, this is a viewer-side preference — it only affects what the
  // current user sees, not what the friend can do.
  show_on_leaderboard: boolean;
}

export interface FriendVisibilitySettings {
  show_stocks: boolean;
  show_marketplace: boolean;
  show_on_leaderboard: boolean;
}

export interface SocialPost {
  id: string;
  user_id: string;
  content: string;
  type: 'achievement' | 'general' | 'challenge';
  metadata?: any;
  created_at: string;
  likesCount: number;
  isLiked: boolean;
  user_profile: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  participants_count: number;
  is_active: boolean;
  is_participant: boolean;
  creator_profile: {
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private supabase: SupabaseClient;

  constructor(supabaseService: SupabaseService, private marketplaceService: MarketplaceService) {
    this.supabase = supabaseService.client;
  }

  // Posts and Feed
  async getSocialFeed(userId: string): Promise<SocialPost[]> {
    try {
      const { data, error } = await this.supabase
        .from('social_posts')
        .select(`
          *,
          user_profile:user_profiles(id, name, avatar_url),
          likes:social_likes(user_id),
          likes_count:social_likes(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((post: any) => ({
        ...post,
        likesCount: post.likes_count?.[0]?.count || 0,
        isLiked: post.likes?.some((like: any) => like.user_id === userId) || false
      }));
    } catch (error) {
      console.error('Error loading social feed:', error);
      return [];
    }
  }

  async createPost(userId: string, content: string, type: 'achievement' | 'general' | 'challenge' = 'general', metadata?: any): Promise<void> {
    const { error } = await this.supabase
      .from('social_posts')
      .insert({
        user_id: userId,
        content,
        type,
        metadata
      });

    if (error) throw error;
  }

  async shareAchievement(userId: string, message: string): Promise<void> {
    // Get user's latest habit completion for sharing
    const { data: latestCompletion } = await this.supabase
      .from('habit_completions')
      .select(`
        *,
        habit_business:habit_businesses(business_name, business_icon, earnings_per_completion)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const content = message || `Just completed my ${latestCompletion?.habit_business?.business_name} habit! 💪`;
    
    await this.createPost(userId, content, 'achievement', {
      habit_business_id: latestCompletion?.habit_business_id,
      earnings: latestCompletion?.habit_business?.earnings_per_completion
    });
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('social_likes')
      .insert({
        post_id: postId,
        user_id: userId
      });

    if (error) throw error;
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('social_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Friends
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      // Get friendships where user is the requester
      const { data: outgoingFriends, error: outgoingError } = await this.supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      // Get friendships where user is the recipient
      const { data: incomingFriends, error: incomingError } = await this.supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'accepted');

      if (outgoingError) {
        console.error('Error loading outgoing friends:', outgoingError);
      }
      if (incomingError) {
        console.error('Error loading incoming friends:', incomingError);
      }

      const allFriendships = [
        ...(outgoingFriends || []),
        ...(incomingFriends || [])
      ];

      if (allFriendships.length === 0) {
        return [];
      }

      // Use the special function to get friend profiles (bypasses RLS)
      const enrichedFriends = await Promise.all(
        allFriendships.map(async (friendship) => {
          // Determine which user is the friend (not the current user)
          const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;

          const { data: friendProfileData, error: profileError } = await this.supabase
            .rpc('get_user_profile_for_friend_request', { user_uuid: friendId });

          if (profileError) {
            console.error('❌ Error loading friend profile:', profileError);
          }

          // The function now returns an array with financial data
          let friendProfile;
          if (Array.isArray(friendProfileData) && friendProfileData.length > 0) {
            friendProfile = friendProfileData[0];
          } else if (friendProfileData && !Array.isArray(friendProfileData)) {
            friendProfile = friendProfileData;
          } else {
            friendProfile = {
              id: friendId,
              name: 'Unknown User',
              email: 'unknown@email.com',
              cash: 0,
              net_worth: 0
            };
          }

          return {
            ...friendship,
            friend_profile: friendProfile // Use the complete profile with all data
          };
        })
      );

      // Remove duplicates based on friend profile ID
      const uniqueFriends = enrichedFriends.filter((friend, index, self) =>
        index === self.findIndex(f => f.friend_profile.id === friend.friend_profile.id)
      );

      // Merge in this user's per-friend stock/marketplace visibility toggles
      // (defaults to visible when no row exists for a given friend yet).
      const visibilityMap = await this.getFriendVisibilitySettings(
        userId,
        uniqueFriends.map(f => f.friend_profile.id)
      );

      return uniqueFriends.map(friend => ({
        ...friend,
        show_stocks: visibilityMap[friend.friend_profile.id]?.show_stocks ?? true,
        show_marketplace: visibilityMap[friend.friend_profile.id]?.show_marketplace ?? true,
        show_on_leaderboard: visibilityMap[friend.friend_profile.id]?.show_on_leaderboard ?? true
      }));
    } catch (error) {
      console.error('Error loading friends:', error);
      return [];
    }
  }

  // Per-friend visibility settings (stocks / marketplace), keyed by friend id.
  async getFriendVisibilitySettings(userId: string, friendIds: string[]): Promise<Record<string, FriendVisibilitySettings>> {
    if (friendIds.length === 0) {
      return {};
    }

    try {
      const { data, error } = await this.supabase
        .from('friend_visibility_settings')
        .select('friend_id, show_stocks, show_marketplace, show_on_leaderboard')
        .eq('owner_id', userId)
        .in('friend_id', friendIds);

      if (error) {
        console.error('Error loading friend visibility settings:', error);
        return {};
      }

      const map: Record<string, FriendVisibilitySettings> = {};
      for (const row of data || []) {
        map[row.friend_id] = {
          show_stocks: row.show_stocks,
          show_marketplace: row.show_marketplace,
          show_on_leaderboard: row.show_on_leaderboard
        };
      }
      return map;
    } catch (error) {
      console.error('Error loading friend visibility settings:', error);
      return {};
    }
  }

  // Toggle whether a specific friend can see the current user's stocks and/or
  // marketplace listings. Only the fields present in `updates` are changed.
  async setFriendVisibility(userId: string, friendId: string, updates: Partial<FriendVisibilitySettings>): Promise<void> {
    const { error } = await this.supabase
      .from('friend_visibility_settings')
      .upsert(
        { owner_id: userId, friend_id: friendId, ...updates, updated_at: new Date().toISOString() },
        { onConflict: 'owner_id,friend_id' }
      );

    if (error) throw error;
  }

  // Get pending friend requests (incoming)
  async getPendingRequests(userId: string): Promise<any[]> {
    try {
      // First, get the basic friendship data
      const { data: friendships, error } = await this.supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error loading pending requests:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Use the special function to get sender profiles (bypasses RLS)
      const enrichedRequests = await Promise.all(
        friendships.map(async (friendship) => {
          const { data: profileData, error: profileError } = await this.supabase
            .rpc('get_user_profile_for_friend_request', { user_uuid: friendship.user_id });

          if (profileError) {
            console.error('❌ Error loading sender profile:', profileError);
          }

          // The function returns a TABLE (array), so we need to get the first element
          let senderProfile;
          if (Array.isArray(profileData) && profileData.length > 0) {
            senderProfile = profileData[0];
          } else {
            senderProfile = {
              id: friendship.user_id,
              name: 'Unknown User',
              email: 'unknown@email.com'
            };
          }

          return {
            ...friendship,
            sender_profile: senderProfile
          };
        })
      );

      return enrichedRequests;
    } catch (error) {
      console.error('Error loading pending requests:', error);
      return [];
    }
  }

  // Get sent friend requests (outgoing)
  async getSentRequests(userId: string): Promise<any[]> {
    try {
      // First, get the basic friendship data
      const { data: friendships, error } = await this.supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error loading sent requests:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      // Use the special function to get recipient profiles (bypasses RLS)
      const enrichedRequests = await Promise.all(
        friendships.map(async (friendship) => {
          const { data: recipientProfileData, error: profileError } = await this.supabase
            .rpc('get_user_profile_for_friend_request', { user_uuid: friendship.friend_id });

          if (profileError) {
            console.error('Error loading recipient profile:', profileError);
          }

          // The function returns a TABLE (array), so we need to get the first element
          let recipientProfile;
          if (Array.isArray(recipientProfileData) && recipientProfileData.length > 0) {
            recipientProfile = recipientProfileData[0];
          } else {
            recipientProfile = {
              id: friendship.friend_id,
              name: 'Unknown User',
              email: 'unknown@email.com'
            };
          }

          return {
            ...friendship,
            recipient_profile: recipientProfile
          };
        })
      );

      return enrichedRequests;
    } catch (error) {
      console.error('Error loading sent requests:', error);
      return [];
    }
  }

  async sendFriendRequest(userId: string, friendIdentifier: string): Promise<void> {
    // Use the special function to search for users (bypasses RLS)
    const { data: searchResults, error: searchError } = await this.supabase
      .rpc('search_users_for_friend_request', { search_term: friendIdentifier });

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error('Error searching for user');
    }

    if (!searchResults || searchResults.length === 0) {
      throw new Error('User not found');
    }

    // If multiple results, try to find exact email match first (case insensitive)
    let friendUser = searchResults.find((user: any) => user.email.toLowerCase() === friendIdentifier.toLowerCase());
    if (!friendUser) {
      // If no exact email match, use the first result
      friendUser = searchResults[0];
    }

    if (friendUser.id === userId) {
      throw new Error('You cannot send a friend request to yourself');
    }

    // Check if friendship already exists in either direction
    const { data: existingFriendship } = await this.supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${userId})`)
      .maybeSingle();

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        throw new Error('You are already friends with this user');
      } else if (existingFriendship.status === 'pending') {
        throw new Error('Friend request already sent or pending');
      } else if (existingFriendship.status === 'declined') {
        // If request was declined, delete the old record so a new one can be sent
        const { error: deleteError } = await this.supabase
          .from('friendships')
          .delete()
          .eq('id', existingFriendship.id);

        if (deleteError) {
          console.error('Error deleting declined friendship:', deleteError);
          throw new Error('Error resending friend request');
        }
      } else if (existingFriendship.status === 'blocked') {
        throw new Error('Unable to send friend request to this user');
      }
    }

    // Create friend request
    const { error } = await this.supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendUser.id,
        status: 'pending'
      });

    if (error) throw error;
  }

  // Accept a friend request
  async acceptFriendRequest(requestId: string): Promise<void> {
    const { error } = await this.supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;
  }

  // Decline a friend request
  async declineFriendRequest(requestId: string): Promise<void> {
    const { error } = await this.supabase
      .from('friendships')
      .update({ status: 'declined' })
      .eq('id', requestId);

    if (error) throw error;
  }

  // Remove a friend (delete the friendship)
  async removeFriend(userId: string, friendId: string): Promise<void> {
    const { error } = await this.supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

    if (error) throw error;
  }

  // Challenges
  async getActiveChallenges(userId: string): Promise<Challenge[]> {
    try {
      const { data, error } = await this.supabase
        .from('challenges')
        .select(`
          *,
          creator_profile:user_profiles!challenges_creator_id_fkey(name),
          participants:challenge_participants(user_id),
          participants_count:challenge_participants(count)
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((challenge: any) => ({
        ...challenge,
        participants_count: challenge.participants_count?.[0]?.count || 0,
        is_participant: challenge.participants?.some((p: any) => p.user_id === userId) || false
      }));
    } catch (error) {
      console.error('Error loading challenges:', error);
      return [];
    }
  }

  async createChallenge(userId: string, title: string, description: string, durationDays: number): Promise<void> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const { data: challenge, error } = await this.supabase
      .from('challenges')
      .insert({
        creator_id: userId,
        title,
        description,
        duration_days: durationDays,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join creator to their own challenge
    await this.joinChallenge(challenge.id, userId);
  }

  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: userId
      });

    if (error) throw error;
  }

  // Social Pokes
  async sendHabitPoke(fromUserId: string, toUserId: string, habitBusinessName: string): Promise<void> {
    try {
      // Use the SQL function to send the poke
      const { data, error } = await this.supabase
        .rpc('send_habit_poke', {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          business_name: habitBusinessName
        });

      if (error) {
        console.error('Error sending habit poke:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Error in sendHabitPoke:', error);
      throw new Error('Failed to send reminder. Please try again.');
    }
  }

  /**
   * habitBusinessId (not a business name) — the message is read by the habit's
   * OWNER, so the function looks up their own private business_name server-side
   * rather than trusting a client-supplied string, which would only ever be the
   * public business type name a stockholder is allowed to see (see
   * TodaysDividendsModalComponent, the only caller of this method).
   */
  async sendStockholderReminder(fromUserId: string, toUserId: string, habitBusinessId: string, fromUserName: string): Promise<void> {
    try {
      // Use the SQL function to send the stockholder reminder
      const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await this.supabase
        .rpc('send_stockholder_reminder', {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          habit_business_id: habitBusinessId,
          from_user_name: fromUserName,
          p_client_timezone: clientTimezone
        });

      if (error) {
        console.error('❌ RPC Error sending stockholder reminder:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (data && !data.success) {
        console.error('❌ Function returned error:', data);
        throw new Error(data.error || 'Function execution failed');
      }

    } catch (error) {
      console.error('❌ Error in sendStockholderReminder:', error);
      throw new Error(`Failed to send stockholder reminder: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async getUserPokes(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_social_notifications', { user_uuid: userId });

      if (error) {
        console.error('❌ Error loading pokes:', error);
        throw error;
      }

      // Transform the data to match expected format (poke_id -> id)
      const transformedData = (data || []).map((poke: any) => ({
        ...poke,
        id: poke.poke_id, // Map poke_id to id
        type: poke.poke_type // Map poke_type to type for consistency
      }));

      return transformedData;
    } catch (error) {
      console.error('Error loading pokes:', error);
      return [];
    }
  }

  // Achievement reactions
  //
  // Reactions are keyed by achiever + achievement identity (achievement_key,
  // plus habit_business_id for milestones) rather than by an individual
  // notification row, because one achievement fans out to a social_pokes row
  // per friend (plus a self row for the achiever) — see
  // 20260825000000_achievement_reactions.sql for why.
  async getAchievementReactions(
    achieverId: string,
    achievementType: 'general' | 'milestone',
    achievementKey: string,
    habitBusinessId: string | null = null
  ): Promise<{ reactor_id: string; reactor_name: string; emoji: string; created_at: string }[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_achievement_reactions', {
        p_achiever_id: achieverId,
        p_achievement_type: achievementType,
        p_achievement_key: achievementKey,
        p_habit_business_id: habitBusinessId
      });

      if (error) {
        console.error('Error loading achievement reactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading achievement reactions:', error);
      return [];
    }
  }

  async reactToAchievement(
    achieverId: string,
    achievementType: 'general' | 'milestone',
    achievementKey: string,
    habitBusinessId: string | null,
    emoji: string
  ): Promise<void> {
    const { error } = await this.supabase.rpc('react_to_achievement', {
      p_achiever_id: achieverId,
      p_achievement_type: achievementType,
      p_achievement_key: achievementKey,
      p_habit_business_id: habitBusinessId,
      p_emoji: emoji
    });

    if (error) {
      console.error('Error reacting to achievement:', error);
      throw error;
    }
  }

  async removeAchievementReaction(
    achieverId: string,
    achievementType: 'general' | 'milestone',
    achievementKey: string,
    habitBusinessId: string | null
  ): Promise<void> {
    const { error } = await this.supabase.rpc('remove_achievement_reaction', {
      p_achiever_id: achieverId,
      p_achievement_type: achievementType,
      p_achievement_key: achievementKey,
      p_habit_business_id: habitBusinessId
    });

    if (error) {
      console.error('Error removing achievement reaction:', error);
      throw error;
    }
  }

  // Lightweight count for badges (unread notifications + pending friend requests),
  // mirroring social.page.ts's totalNotificationsBadgeCount without the heavy profile enrichment.
  // Shared across all bottom-nav instances so marking a notification as read anywhere
  // updates every badge immediately instead of waiting for their next ngOnInit.
  private notificationBadgeCountSubject = new BehaviorSubject<number>(0);
  notificationBadgeCount$ = this.notificationBadgeCountSubject.asObservable();

  async getTotalNotificationBadgeCount(userId: string): Promise<number> {
    try {
      const [pokes, pendingRequests, marketplaceBadgeCount] = await Promise.all([
        this.getUserPokes(userId),
        this.supabase
          .from('friendships')
          .select('created_at')
          .eq('friend_id', userId)
          .eq('status', 'pending'),
        this.marketplaceService.getMarketplaceBadgeCount(userId)
      ]);

      // Same "last seen" cutoff social.page.ts's totalNotificationsBadgeCount uses,
      // so the bottom-nav badge (refreshed on every page, including on app restart
      // at the home screen) agrees with the Notifications tab instead of falling
      // back to a stale is_read-based count that never got cleared.
      const lastSeen = this.getNotificationsLastSeenTime(userId);
      const newPokes = pokes.filter((p: any) => new Date(p.created_at).getTime() > lastSeen).length;
      const newRequests = (pendingRequests.data || []).filter(
        (r: any) => new Date(r.created_at).getTime() > lastSeen
      ).length;
      return newPokes + newRequests + marketplaceBadgeCount;
    } catch (error) {
      console.error('Error loading notification badge count:', error);
      return 0;
    }
  }

  async refreshNotificationBadgeCount(userId: string): Promise<number> {
    const count = await this.getTotalNotificationBadgeCount(userId);
    this.notificationBadgeCountSubject.next(count);
    return count;
  }

  setNotificationBadgeCount(count: number): void {
    this.notificationBadgeCountSubject.next(Math.max(0, count));
  }

  private getNotificationsLastSeenKey(viewerId: string): string {
    return `notifications-last-seen-${viewerId}`;
  }

  /** Timestamp (ms) this user last viewed the Notifications tab; pokes/requests created after this count toward the badge. */
  getNotificationsLastSeenTime(viewerId: string): number {
    const stored = localStorage.getItem(this.getNotificationsLastSeenKey(viewerId));
    return stored ? parseInt(stored, 10) : 0;
  }

  /** Call when the user opens the Notifications tab, to clear the notifications badge. */
  markNotificationsSeen(viewerId: string): void {
    localStorage.setItem(this.getNotificationsLastSeenKey(viewerId), Date.now().toString());
  }

  async markPokeAsRead(pokeId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_pokes')
        .update({ is_read: true })
        .eq('id', pokeId);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ SocialService: Error marking poke as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required for deletion');
      }

      const { data, error } = await this.supabase
        .from('social_pokes')
        .delete()
        .eq('id', notificationId)
        .select(); // Return the deleted rows to confirm deletion

      if (error) {
        console.error('❌ Database error deleting notification:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No notification was deleted - ID might not exist:', notificationId);
        throw new Error('Notification not found or already deleted');
      }
    } catch (error) {
      console.error('❌ SocialService: Error deleting notification:', error);
      throw error;
    }
  }

  // Friends-only Leaderboard
  async getFriendsLeaderboard(userId: string): Promise<any[]> {
    try {
      // Get current user profile
      const { data: userProfile, error: userError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error loading user profile:', userError);
        // Return default user entry even if profile loading fails
        return [{
          id: userId,
          name: 'You',
          avatar_url: '',
          net_worth: 0,
          cash: 0,
          rank: 1
        }];
      }

      // Get friends data (now includes financial information), excluding
      // any the user has toggled off their leaderboards.
      const friends = (await this.getFriends(userId)).filter(f => f.show_on_leaderboard);

      const leaderboard = [
        // Current user - use stored net_worth from database like home screen does
        {
          id: userProfile.id,
          name: 'You', // Override name to show "You"
          avatar_url: userProfile.avatar_url || '',
          net_worth: userProfile.net_worth || 0, // Use stored net_worth like home screen
          cash: userProfile.cash || 0,
          rank: 1
        }
      ];

      // Add friends to leaderboard only if they exist
      if (friends && friends.length > 0) {
        const friendsData = friends.map(friend => ({
          id: friend.friend_profile.id,
          name: friend.friend_profile.name,
          avatar_url: friend.friend_profile.avatar_url || '',
          net_worth: friend.friend_profile.net_worth || 0, // Use stored net_worth from database
          cash: friend.friend_profile.cash || 0,
          rank: 0
        }));
        
        leaderboard.push(...friendsData);
        
        // Sort by net worth and assign ranks only when there are friends
        leaderboard.sort((a, b) => b.net_worth - a.net_worth);
        leaderboard.forEach((user, index) => {
          user.rank = index + 1;
        });
      }
      // If no friends, user stays at rank 1

      return leaderboard;
    } catch (error) {
      console.error('Error loading friends leaderboard:', error);
      // Always return at least the user, even on error
      return [{
        id: userId,
        name: 'You',
        avatar_url: '',
        net_worth: 0,
        cash: 0,
        rank: 1
      }];
    }
  }

  // Weekly Habit Cash Earned Leaderboard (resets at the start of the user's local week)
  async getFriendsCashLeaderboard(userId: string, weekStart: Date): Promise<any[]> {
    try {
      // Get current user profile
      const { data: userProfile, error: userError } = await this.supabase
        .from('user_profiles')
        .select('id, name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error loading user profile for cash leaderboard:', userError);
      }

      // Get friends, excluding any the user has toggled off their leaderboards
      const friends = (await this.getFriends(userId)).filter(f => f.show_on_leaderboard);

      // Build list of all user IDs (self + friends)
      const allIds: string[] = [userId, ...friends.map(f => f.friend_profile.id)];

      // Query aggregated earnings via SECURITY DEFINER function
      const { data: earningsData, error: earningsError } = await this.supabase
        .rpc('get_users_cash_earned', { user_ids: allIds, period: 'weekly', week_start: weekStart.toISOString() });

      if (earningsError) {
        console.error('Error loading cash earned leaderboard:', earningsError);
      }

      // Build a lookup map from the results
      const earningsMap: Record<string, number> = {};
      if (earningsData) {
        for (const row of earningsData) {
          earningsMap[row.user_id] = Number(row.total_earned) || 0;
        }
      }

      // Assemble leaderboard entries
      const leaderboard: any[] = [
        {
          id: userId,
          name: 'You',
          cash_earned: earningsMap[userId] ?? 0,
          rank: 1
        }
      ];

      if (friends.length > 0) {
        const friendEntries = friends.map(f => ({
          id: f.friend_profile.id,
          name: f.friend_profile.name,
          cash_earned: earningsMap[f.friend_profile.id] ?? 0,
          rank: 0
        }));
        leaderboard.push(...friendEntries);

        // Sort descending by cash_earned and assign ranks
        leaderboard.sort((a, b) => b.cash_earned - a.cash_earned);
        leaderboard.forEach((entry, i) => { entry.rank = i + 1; });
      }

      return leaderboard;
    } catch (error) {
      console.error('Error loading friends cash leaderboard:', error);
      return [{
        id: userId,
        name: 'You',
        cash_earned: 0,
        rank: 1
      }];
    }
  }

  // Weekly Habits Completed Leaderboard (resets at the start of the user's local week)
  async getFriendsHabitsCompletedLeaderboard(userId: string, weekStart: Date): Promise<any[]> {
    try {
      // Get friends, excluding any the user has toggled off their leaderboards
      const friends = (await this.getFriends(userId)).filter(f => f.show_on_leaderboard);

      // Build list of all user IDs (self + friends)
      const allIds: string[] = [userId, ...friends.map(f => f.friend_profile.id)];

      // Query aggregated completion counts via SECURITY DEFINER function
      const { data: completionsData, error: completionsError } = await this.supabase
        .rpc('get_users_habits_completed', { user_ids: allIds, week_start: weekStart.toISOString() });

      if (completionsError) {
        console.error('Error loading habits completed leaderboard:', completionsError);
      }

      // Build a lookup map from the results
      const completionsMap: Record<string, number> = {};
      if (completionsData) {
        for (const row of completionsData) {
          completionsMap[row.user_id] = Number(row.total_completed) || 0;
        }
      }

      // Assemble leaderboard entries
      const leaderboard: any[] = [
        {
          id: userId,
          name: 'You',
          habits_completed: completionsMap[userId] ?? 0,
          rank: 1
        }
      ];

      if (friends.length > 0) {
        const friendEntries = friends.map(f => ({
          id: f.friend_profile.id,
          name: f.friend_profile.name,
          habits_completed: completionsMap[f.friend_profile.id] ?? 0,
          rank: 0
        }));
        leaderboard.push(...friendEntries);

        // Sort descending by habits_completed and assign ranks
        leaderboard.sort((a, b) => b.habits_completed - a.habits_completed);
        leaderboard.forEach((entry, i) => { entry.rank = i + 1; });
      }

      return leaderboard;
    } catch (error) {
      console.error('Error loading friends habits completed leaderboard:', error);
      return [{
        id: userId,
        name: 'You',
        habits_completed: 0,
        rank: 1
      }];
    }
  }

  // Historical (past-week) Weekly Cash Earned Leaderboard — served from a frozen
  // snapshot via get_weekly_leaderboard_history, so it stops drifting once first viewed.
  async getFriendsCashLeaderboardHistory(userId: string, weekStart: Date, weekEnd: Date): Promise<any[]> {
    try {
      const rows = await this.getWeeklyLeaderboardHistoryRows('cash_earned', weekStart, weekEnd);
      return rows.map(row => ({
        id: row.ranked_user_id,
        name: row.ranked_user_id === userId ? 'You' : row.display_name,
        cash_earned: Number(row.value) || 0,
        rank: row.rank
      }));
    } catch (error) {
      console.error('Error loading historical cash leaderboard:', error);
      return [{ id: userId, name: 'You', cash_earned: 0, rank: 1 }];
    }
  }

  // Historical (past-week) Weekly Habits Completed Leaderboard — same frozen-snapshot pattern.
  async getFriendsHabitsCompletedLeaderboardHistory(userId: string, weekStart: Date, weekEnd: Date): Promise<any[]> {
    try {
      const rows = await this.getWeeklyLeaderboardHistoryRows('habits_completed', weekStart, weekEnd);
      return rows.map(row => ({
        id: row.ranked_user_id,
        name: row.ranked_user_id === userId ? 'You' : row.display_name,
        habits_completed: Number(row.value) || 0,
        rank: row.rank
      }));
    } catch (error) {
      console.error('Error loading historical habits completed leaderboard:', error);
      return [{ id: userId, name: 'You', habits_completed: 0, rank: 1 }];
    }
  }

  private async getWeeklyLeaderboardHistoryRows(
    metric: 'cash_earned' | 'habits_completed',
    weekStart: Date,
    weekEnd: Date
  ): Promise<{ ranked_user_id: string; display_name: string; value: number; rank: number }[]> {
    const { data, error } = await this.supabase.rpc('get_weekly_leaderboard_history', {
      p_metric: metric,
      p_week_start: weekStart.toISOString(),
      p_week_end: weekEnd.toISOString()
    });

    if (error) {
      console.error(`Error loading weekly leaderboard history (${metric}):`, error);
      throw error;
    }

    return data || [];
  }
}
