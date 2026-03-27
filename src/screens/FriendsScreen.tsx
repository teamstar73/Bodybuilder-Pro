import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Users, ArrowRight, TrendingUp, Camera } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, FriendRequest, User } from '../types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function FriendsScreen() {
  const { 
    userId, 
    friends, 
    friendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend,
    searchUsers 
  } = useAppStore();

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<{uid: string, name: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendData, setFriendData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setIsSearching(true);
    const results = await searchUsers(searchEmail);
    // Filter out self and existing friends
    const filtered = results.filter(r => r.uid !== userId && !friends.some(f => f.uid === r.uid));
    setSearchResults(filtered);
    setIsSearching(false);
  };

  const viewFriendProgress = async (friend: Friend) => {
    setSelectedFriend(friend);
    // Fetch friend's basic data for the modal
    try {
      const friendDoc = await getDoc(doc(db, 'users', friend.uid));
      if (friendDoc.exists()) {
        setFriendData(friendDoc.data());
      }
    } catch (error) {
      console.error("Error fetching friend data:", error);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Friends</h1>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-2">Connect & Track Progress</p>
        </div>
        <Users className="text-accent" size={32} />
      </header>

      {/* Search Section */}
      <section className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Find Users</h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="email" 
            placeholder="Search by email..."
            className="w-full bg-surface-alt border border-border-light rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-accent transition-all"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <button 
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-black p-1.5 rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
          >
            <ArrowRight size={16} />
          </button>
        </form>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2 pt-2"
            >
              {searchResults.map(result => (
                <div key={result.uid} className="flex items-center justify-between p-3 bg-surface-alt rounded-xl border border-border-light">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center font-bold text-xs uppercase">
                      {result.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold">{result.name}</span>
                  </div>
                  <button 
                    onClick={() => { sendFriendRequest(result.uid); setSearchResults([]); setSearchEmail(''); }}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-accent text-black px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"
                  >
                    <UserPlus size={14} /> Add
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Requests Section */}
      {friendRequests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Pending Requests</h3>
          <div className="space-y-3">
            {friendRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">
                    {request.fromName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{request.fromName}</div>
                    <div className="text-[10px] text-text-muted uppercase font-medium">Wants to be friends</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptFriendRequest(request.id)}
                    className="p-2 bg-accent text-black rounded-xl hover:scale-105 transition-all"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => rejectFriendRequest(request.id)}
                    className="p-2 bg-surface-alt text-text-muted rounded-xl hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends List */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Your Friends ({friends.length})</h3>
        <div className="grid gap-3">
          {friends.map(friend => (
            <div 
              key={friend.uid} 
              className="group flex items-center justify-between p-4 bg-surface border border-border rounded-2xl hover:border-border-light transition-all cursor-pointer"
              onClick={() => viewFriendProgress(friend)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-alt border border-border-light flex items-center justify-center font-black text-text-faint group-hover:text-accent transition-colors">
                  {friend.name.charAt(0)}
                </div>
                <div>
                  <div className="text-base font-bold">{friend.name}</div>
                  <div className="text-[10px] text-text-muted uppercase font-medium">Added {new Date(friend.addedAt).toLocaleDateString('ja-JP')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <TrendingUp size={20} className="text-text-faint group-hover:text-accent transition-colors" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFriend(friend.uid); }}
                  className="p-2 text-text-faint hover:text-text-muted transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}

          {friends.length === 0 && (
            <div className="py-12 text-center bg-surface border border-border rounded-2xl">
              <Users className="mx-auto text-text-faint mb-2" size={32} />
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest">No friends added yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Friend Detail Modal */}
      <AnimatePresence>
        {selectedFriend && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFriend(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-t-[32px] sm:rounded-[32px] p-8 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-black text-accent">
                    {selectedFriend.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedFriend.name}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Friend's Progress</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="p-2 bg-surface-alt rounded-full text-text-muted hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {friendData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Current Weight</div>
                      <div className="text-xl font-black">{friendData.weight_kg} <span className="text-xs font-normal text-text-muted">kg</span></div>
                    </div>
                    <div className="bg-surface-alt p-4 rounded-2xl border border-border">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Body Fat</div>
                      <div className="text-xl font-black">{friendData.body_fat_pct}%</div>
                    </div>
                  </div>

                  <div className="bg-surface-alt p-5 rounded-2xl border border-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Phase</span>
                      <span className="text-xs font-black uppercase px-2 py-1 bg-accent text-black rounded-md">{friendData.phase}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Diet Type</span>
                      <span className="text-xs font-black uppercase text-white">{friendData.diet_type}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setSelectedFriend(null)}
                      className="w-full py-4 bg-surface-alt text-white font-black uppercase tracking-widest rounded-xl hover:bg-surface-high transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto" />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
