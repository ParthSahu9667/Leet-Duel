import { useState, useEffect } from "react";
import { RankedUser } from "@/types/type";
import { compareUsers } from "../lib/api/compare";

export const useDashboardState = () => {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedResults = localStorage.getItem("leetduel_results");
    const savedNames = localStorage.getItem("leetduel_usernames");
    const savedHasSearched = localStorage.getItem("leetduel_has_searched");
    
    if (savedResults) {
      try {
        setUsers(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse saved results");
      }
    }

    if (savedNames) {
      try {
        setUsernames(JSON.parse(savedNames));
      } catch (e) {
        console.error("Failed to parse saved names");
      }
    }
    
    if (savedHasSearched === "true") {
      setHasSearched(true);
    }
    setIsLoaded(true);
  }, []);

  // Save usernames
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("leetduel_usernames", JSON.stringify(usernames));
    }
  }, [usernames, isLoaded]);

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
