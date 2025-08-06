/* eslint-disable react-refresh/only-export-components */
import axiosInstance from "~/utils/axiosInstance";
import { API_PATHS } from "~/utils/apiPaths";
import { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      navigate('/login')
      console.log("Không tìm thấy token")
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data.data.userProfile);
      } catch (error) {
        console.error("User not authenticated", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem("token", userData.token)
    setLoading(false)
  }


  const value = { user, loading, updateUser, clearUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;