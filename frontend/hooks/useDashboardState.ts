import { useState, useEffect, useRef } from "react";
import { RankedUser } from "@/types/type";
import { compareUsers } from "../lib/api/compare";
import { useAuth } from "@/contexts/AuthContext";
import { getFriendsAPI, updateFriendsAPI } from "../lib/api/friend";

export const useDashboardState = () => {
  const { user, loading: authLoading } = useAuth();
  const [usernames, setUsernames] = useState<string[]>([]);
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const skipNextSave = useRef(false);

  // Load from backend or localStorage on mount/auth state change
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is evaluated

    const loadInitialData = async () => {
      skipNextSave.current = true; // Tell save effect to ignore the `user` dependence change
      let loadedNames: string[] = [];

      // Fetch from backend if authenticated, otherwise use local storage
      if (user) {
        try {
          loadedNames = await getFriendsAPI();
        } catch (e) {
          console.error("Failed to fetch friends from backend", e);
        }
      } else {
        const savedNames = localStorage.getItem("leetduel_usernames");
        if (savedNames) {
          try {
            loadedNames = JSON.parse(savedNames);
          } catch (e) {
            console.error("Failed to parse saved names");
          }
        }
      }

      // Re-assert before triggering state changes in case the other effect consumed it
      skipNextSave.current = true;
      setUsernames(loadedNames);

      const savedResults = localStorage.getItem("leetduel_results");
      const savedHasSearched = localStorage.getItem("leetduel_has_searched");
      
      if (savedResults) {
        try {
          setUsers(JSON.parse(savedResults));
        } catch (e) {
          console.error("Failed to parse saved results");
        }
      }
      
      if (savedHasSearched === "true") {
        setHasSearched(true);
      }
      
      setIsLoaded(true);
    };

    loadInitialData();
  }, [user, authLoading]);

  // Save usernames
  useEffect(() => {
    if (!isLoaded) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (user) {
      updateFriendsAPI(usernames).catch((err) => {
        console.error("Failed to sync usernames to backend", err);
      });
    } else {
      localStorage.setItem("leetduel_usernames", JSON.stringify(usernames));
    }
  }, [usernames, isLoaded, user]);

  // Save results
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("leetduel_results", JSON.stringify(users));
      localStorage.setItem("leetduel_has_searched", hasSearched ? "true" : "false");
    }
  }, [users, hasSearched, isLoaded]);

  const handleSearch = async (userList: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await compareUsers(userList);
      setUsers(data);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = (username: string) => {
    const updatedUsers = users.filter(u => u.username !== username);
    const updatedUsernames = usernames.filter(u => u !== username);
    
    setUsers(updatedUsers);
    setUsernames(updatedUsernames);
    
    if (updatedUsers.length === 0) {
      setHasSearched(false);
    }
  };

  return {
    usernames,
    setUsernames,
    users,
    isLoading,
    error,
    hasSearched,
    handleSearch,
    handleRemoveUser,
  };
};
