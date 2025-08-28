import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

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

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
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
          
          console.log('🔍 Fetching friend profile for user_id:', friendId);
          
          const { data: friendProfileData, error: profileError } = await this.supabase
            .rpc('get_user_profile_for_friend_request', { user_uuid: friendId });

          console.log('📊 Friend profile fetch result:', { friendProfileData, profileError });
          console.log('📊 Raw friendProfileData type:', typeof friendProfileData);
          console.log('📊 Raw friendProfileData value:', JSON.stringify(friendProfileData, null, 2));

          if (profileError) {
            console.error('❌ Error loading friend profile:', profileError);
          }

          // The function now returns an array with financial data
          let friendProfile;
          if (Array.isArray(friendProfileData) && friendProfileData.length > 0) {
            friendProfile = friendProfileData[0];
            console.log('✅ Using first element from array:', friendProfile);
          } else if (friendProfileData && !Array.isArray(friendProfileData)) {
            friendProfile = friendProfileData;
            console.log('✅ Using direct object:', friendProfile);
          } else {
            friendProfile = {
              id: friendId,
              name: 'Unknown User',
              email: 'unknown@email.com',
              cash: 0,
              net_worth: 0
            };
            console.log('❌ Using fallback profile:', friendProfile);
          }

          console.log('✅ Final friend profile:', friendProfile);

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

      return uniqueFriends;
    } catch (error) {
      console.error('Error loading friends:', error);
      return [];
    }
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
          console.log('🔍 Fetching profile for user_id:', friendship.user_id);
          
          const { data: profileData, error: profileError } = await this.supabase
            .rpc('get_user_profile_for_friend_request', { user_uuid: friendship.user_id });

          console.log('📊 Profile fetch result:', { 
            profileData, 
            profileError,
            dataType: typeof profileData,
            isArray: Array.isArray(profileData)
          });

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

          console.log('✅ Using sender profile:', senderProfile);

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

  async sendStockholderReminder(fromUserId: string, toUserId: string, businessName: string, fromUserName: string): Promise<void> {
    try {
      console.log('🔍 Social service sending reminder:', {
        fromUserId,
        toUserId,
        businessName,
        fromUserName
      });

      // Use the SQL function to send the stockholder reminder
      const { data, error } = await this.supabase
        .rpc('send_stockholder_reminder', {
          from_user_id: fromUserId,
          to_user_id: toUserId,
          business_name: businessName,
          from_user_name: fromUserName
        });

      console.log('🔍 RPC response:', { data, error });

      if (error) {
        console.error('❌ RPC Error sending stockholder reminder:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (data && !data.success) {
        console.error('❌ Function returned error:', data);
        throw new Error(data.error || 'Function execution failed');
      }

      console.log('✅ Reminder sent successfully');

    } catch (error) {
      console.error('❌ Error in sendStockholderReminder:', error);
      throw new Error(`Failed to send stockholder reminder: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async getUserPokes(userId: string): Promise<any[]> {
    try {
      console.log('🔍 SocialService: Loading pokes for user:', userId);
      const { data, error } = await this.supabase
        .rpc('get_user_social_notifications', { user_uuid: userId });

      if (error) {
        console.error('❌ Error loading pokes:', error);
        throw error;
      }
      
      console.log('🔍 Raw pokes data from database:', data);
      console.log('🔍 First poke structure:', data?.[0]);
      
      // Transform the data to match expected format (poke_id -> id)
      const transformedData = (data || []).map((poke: any) => ({
        ...poke,
        id: poke.poke_id, // Map poke_id to id
        type: poke.poke_type // Map poke_type to type for consistency
      }));
      
      console.log('🔍 Transformed pokes data:', transformedData);
      console.log('🔍 First transformed poke:', transformedData?.[0]);
      
      return transformedData;
    } catch (error) {
      console.error('Error loading pokes:', error);
      return [];
    }
  }

  async markPokeAsRead(pokeId: string): Promise<void> {
    try {
      console.log('🔍 SocialService: Marking poke as read:', pokeId);
      
      const { error } = await this.supabase
        .from('social_pokes')
        .update({ is_read: true })
        .eq('id', pokeId);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ SocialService: Successfully marked poke as read');
    } catch (error) {
      console.error('❌ SocialService: Error marking poke as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log('🗑️ SocialService: Deleting notification:', notificationId);
      console.log('🔍 Notification ID type:', typeof notificationId);
      console.log('🔍 Notification ID valid:', !!notificationId);
      
      if (!notificationId) {
        throw new Error('Notification ID is required for deletion');
      }
      
      const { data, error } = await this.supabase
        .from('social_pokes')
        .delete()
        .eq('id', notificationId)
        .select(); // Return the deleted rows to confirm deletion

      console.log('🔍 Delete operation result:', { data, error });

      if (error) {
        console.error('❌ Database error deleting notification:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No notification was deleted - ID might not exist:', notificationId);
        throw new Error('Notification not found or already deleted');
      }
      
      console.log('✅ SocialService: Notification deleted successfully:', data);
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

      // Calculate real net worth: cash + value of all habit businesses
      let calculatedNetWorth = userProfile.cash || 0;
      
      try {
        // Get user's habit businesses to calculate their total value
        const { data: habitBusinesses } = await this.supabase
          .from('habit_businesses')
          .select(`
            id, business_type_id, level,
            business_types!inner(base_cost)
          `)
          .eq('user_id', userId);

        if (habitBusinesses) {
          // Calculate total value of businesses (assuming 70% of cost as current value)
          const businessValue = habitBusinesses.reduce((total, business: any) => {
            const businessCost = business.business_types?.base_cost || 0;
            const currentValue = businessCost * 0.7; // 70% sell value
            return total + currentValue;
          }, 0);
          
          calculatedNetWorth += businessValue;
        }
      } catch (error) {
        console.error('Error calculating business value:', error);
        // Fall back to just cash if business calculation fails
      }

      // Get friends data (now includes financial information)
      const friends = await this.getFriends(userId);
      
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
}
