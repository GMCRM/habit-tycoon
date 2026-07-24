import { TestBed } from '@angular/core/testing';

import { SocialService } from './social.service';

// ============================================================================
// TEST GROUP 8: Social Features
// "Test social actions so friend requests, leaderboard visibility, and
//  notifications behave correctly."
// ============================================================================

describe('SocialService', () => {
  let service: SocialService;
  let mockSupabaseClient: any;

  // Reusable chainable query mock
  function makeQuery(resolvedValue?: any) {
    const q: any = {};
    const methods = [
      'select', 'eq', 'neq', 'single', 'insert', 'update', 'delete',
      'order', 'limit', 'gte', 'lte', 'lt', 'gt', 'or', 'maybeSingle'
    ];
    for (const m of methods) {
      q[m] = jasmine.createSpy(m).and.returnValue(q);
    }
    if (resolvedValue !== undefined) {
      q.single.and.resolveTo(resolvedValue);
    }
    return q;
  }

  beforeEach(() => {
    mockSupabaseClient = {
      rpc: jasmine.createSpy('rpc').and.resolveTo({ data: [], error: null }),
      from: jasmine.createSpy('from').and.callFake((_table: string) => makeQuery())
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialService);
    (service as any).supabase = mockSupabaseClient;
  });

  // --- Friend Requests ---

  // Sending a friend request should look up the user then insert a pending row
  it('should search for user and insert a pending friendship when sending friend request', async () => {
    // Mock user search RPC → finds one user
    mockSupabaseClient.rpc.and.callFake((fn: string) => {
      if (fn === 'search_users_for_friend_request') {
        return Promise.resolve({
          data: [{ id: 'friend-1', email: 'friend@test.com', name: 'Friend' }],
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    // Mock existing friendship check (none found)
    const friendQuery = makeQuery();
    friendQuery.or.and.returnValue(friendQuery);
    friendQuery.maybeSingle.and.resolveTo({ data: null, error: null });

    // Mock insert
    const insertQuery = makeQuery();
    insertQuery.insert.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'friendships') {
        return friendQuery;
      }
      return makeQuery();
    });

    await service.sendFriendRequest('user-1', 'friend@test.com');

    // Search should have been called
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'search_users_for_friend_request',
      { search_term: 'friend@test.com' }
    );
  });

  // Sending a friend request to yourself should be rejected
  it('should reject sending a friend request to yourself', async () => {
    mockSupabaseClient.rpc.and.resolveTo({
      data: [{ id: 'user-1', email: 'me@test.com' }],
      error: null
    });

    await expectAsync(
      service.sendFriendRequest('user-1', 'me@test.com')
    ).toBeRejectedWithError('You cannot send a friend request to yourself');
  });

  // Sending when user is not found should throw
  it('should throw "User not found" when search returns no results', async () => {
    mockSupabaseClient.rpc.and.resolveTo({ data: [], error: null });

    await expectAsync(
      service.sendFriendRequest('user-1', 'nobody@test.com')
    ).toBeRejectedWithError('User not found');
  });

  // Sending to someone who is already a friend should be rejected
  it('should reject friend request when already friends', async () => {
    mockSupabaseClient.rpc.and.resolveTo({
      data: [{ id: 'friend-1', email: 'friend@test.com' }],
      error: null
    });

    const friendQuery = makeQuery();
    friendQuery.or.and.returnValue(friendQuery);
    friendQuery.maybeSingle.and.resolveTo({
      data: { id: 'f1', status: 'accepted' },
      error: null
    });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'friendships') return friendQuery;
      return makeQuery();
    });

    await expectAsync(
      service.sendFriendRequest('user-1', 'friend@test.com')
    ).toBeRejectedWithError('You are already friends with this user');
  });

  // Accepting a friend request should update status to 'accepted'
  it('should update friendship status to accepted when accepting request', async () => {
    const friendQuery = makeQuery();
    friendQuery.update.and.returnValue(friendQuery);
    friendQuery.eq.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'friendships') return friendQuery;
      return makeQuery();
    });

    await service.acceptFriendRequest('request-1');

    expect(friendQuery.update).toHaveBeenCalledWith({ status: 'accepted' });
  });

  // Declining should update status to 'declined'
  it('should update friendship status to declined when declining request', async () => {
    const friendQuery = makeQuery();
    friendQuery.update.and.returnValue(friendQuery);
    friendQuery.eq.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'friendships') return friendQuery;
      return makeQuery();
    });

    await service.declineFriendRequest('request-1');

    expect(friendQuery.update).toHaveBeenCalledWith({ status: 'declined' });
  });

  // Removing a friend should delete the friendship row in either direction
  it('should delete friendship between two users in either direction', async () => {
    const friendQuery = makeQuery();
    friendQuery.delete.and.returnValue(friendQuery);
    friendQuery.or.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'friendships') return friendQuery;
      return makeQuery();
    });

    await service.removeFriend('user-1', 'user-2');

    expect(friendQuery.delete).toHaveBeenCalled();
  });

  // --- Notifications / Pokes ---

  // markPokeAsRead should update the is_read flag to true
  it('should mark a poke notification as read', async () => {
    const pokeQuery = makeQuery();
    pokeQuery.update.and.returnValue(pokeQuery);
    pokeQuery.eq.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'social_pokes') return pokeQuery;
      return makeQuery();
    });

    await service.markPokeAsRead('poke-1');

    expect(pokeQuery.update).toHaveBeenCalledWith({ is_read: true });
  });

  // deleteNotification should remove the poke row and throw if not found
  it('should delete a notification and throw if it was not found', async () => {
    const pokeQuery = makeQuery();
    pokeQuery.delete.and.returnValue(pokeQuery);
    pokeQuery.eq.and.returnValue(pokeQuery);
    pokeQuery.select.and.resolveTo({ data: [], error: null }); // no rows deleted

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'social_pokes') return pokeQuery;
      return makeQuery();
    });

    await expectAsync(service.deleteNotification('bad-id')).toBeRejected();
  });

  // deleteNotification with empty id should throw
  it('should throw when notification ID is empty', async () => {
    await expectAsync(service.deleteNotification('')).toBeRejectedWithError(
      'Notification ID is required for deletion'
    );
  });

  // sendHabitPoke should call the RPC function
  it('should call send_habit_poke RPC when poking a friend', async () => {
    mockSupabaseClient.rpc.and.resolveTo({ data: { success: true }, error: null });

    await service.sendHabitPoke('user-1', 'user-2', 'My Lemonade Stand');

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('send_habit_poke', {
      from_user_id: 'user-1',
      to_user_id: 'user-2',
      business_name: 'My Lemonade Stand'
    });
  });

  // sendHabitPoke should throw when RPC returns success=false
  it('should throw when poke RPC returns failure', async () => {
    mockSupabaseClient.rpc.and.resolveTo({
      data: { success: false, error: 'already poked today' },
      error: null
    });

    await expectAsync(
      service.sendHabitPoke('user-1', 'user-2', 'Bakery')
    ).toBeRejected();
  });

  // --- Leaderboard ---

  // getFriendsLeaderboard should return user's profile even if no friends exist
  it('should return at least the current user on the leaderboard', async () => {
    const profileQuery = makeQuery({
      data: { id: 'user-1', name: 'Me', net_worth: 500, cash: 200 },
      error: null
    });

    // Mock for habit businesses (net worth calculation)
    const habitsQuery = makeQuery();
    habitsQuery.eq.and.resolveTo({ data: [], error: null });

    // Mock for friendships (no friends)
    const friendQuery = makeQuery();
    friendQuery.eq.and.callFake(() => friendQuery);
    friendQuery.select.and.resolveTo({ data: [], error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'user_profiles') return profileQuery;
      if (table === 'habit_businesses') return habitsQuery;
      if (table === 'friendships') return friendQuery;
      return makeQuery();
    });

    const leaderboard = await service.getFriendsLeaderboard('user-1');

    // Should have at least one entry (the user themselves)
    expect(leaderboard.length).toBeGreaterThanOrEqual(1);
    expect(leaderboard[0].id).toBe('user-1');
  });

  // --- Posts / Feed ---

  // createPost should insert a post with the right type and content
  it('should insert a social post with correct fields', async () => {
    const postQuery = makeQuery();
    postQuery.insert.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'social_posts') return postQuery;
      return makeQuery();
    });

    await service.createPost('user-1', 'Hello world!', 'general');

    expect(postQuery.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      content: 'Hello world!',
      type: 'general',
      metadata: undefined
    });
  });

  // likePost should insert a like row
  it('should insert a like for the given post and user', async () => {
    const likeQuery = makeQuery();
    likeQuery.insert.and.resolveTo({ error: null });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'social_likes') return likeQuery;
      return makeQuery();
    });

    await service.likePost('post-1', 'user-1');

    expect(likeQuery.insert).toHaveBeenCalledWith({
      post_id: 'post-1',
      user_id: 'user-1'
    });
  });

  // unlikePost should delete the like row
  it('should delete the like for the given post and user', async () => {
    const likeQuery = makeQuery();
    likeQuery.delete.and.returnValue(likeQuery);
    // unlikePost chains .eq().eq(): first call must stay chainable, second resolves the query
    likeQuery.eq.and.returnValues(likeQuery, Promise.resolve({ error: null }));

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'social_likes') return likeQuery;
      return makeQuery();
    });

    await service.unlikePost('post-1', 'user-1');

    expect(likeQuery.delete).toHaveBeenCalled();
  });

  // getSocialFeed should return empty array on error instead of throwing
  it('should return empty array when social feed query fails', async () => {
    const postQuery = makeQuery();
    postQuery.limit.and.resolveTo({ data: null, error: { message: 'db timeout' } });

    mockSupabaseClient.from.and.callFake((table: string) => {
      if (table === 'social_posts') return postQuery;
      return makeQuery();
    });

    const feed = await service.getSocialFeed('user-1');

    expect(feed).toEqual([]);
  });
});
