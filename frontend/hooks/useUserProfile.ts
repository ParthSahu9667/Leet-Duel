import { useState, useEffect } from "react";
import { ExpandedUserProfile } from "../types/type";
import { fetchLeetCodeProfile } from "../lib/api/profile";

export const useUserProfile = (username: string) => {
  const [user, setUser] = useState<ExpandedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchLeetCodeProfile(username)
      .then((data) => {
        if (active) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username]);

  return { user, loading };
};
