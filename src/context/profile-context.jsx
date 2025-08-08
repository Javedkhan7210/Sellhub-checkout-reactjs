import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("profileData");
    return saved ? JSON.parse(saved) : null;
  });

  const updateProfile = (newProfileData) => {
    setProfileData(newProfileData);
    localStorage.setItem('profileData', JSON.stringify(newProfileData));
  };

  const fetchProfile = async () => {
    const token = sessionStorage.getItem('seller_token');
    if (!token) return;

    try {
      const response = await fetch(
        'https://apipayment.sellhub.net/api/seller/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        },
      );

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      
      if (data?.error === 'Token has expired' || data?.error === "Wrong number of segments") {
        sessionStorage.removeItem('seller_token');
        return;
      }
      
      updateProfile(data?.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch profile data on mount if user is authenticated
  useEffect(() => {
    const token = sessionStorage.getItem('seller_token');
    if (token) {
      fetchProfile();
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}; 