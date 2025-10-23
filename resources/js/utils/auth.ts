export const getAuthToken = () => {
  try {
    const token = localStorage.getItem("token");
    
    // Basic validation
    if (!token || token === "undefined" || token === "null") {
      return null;
    }

    // Additional validation could be added here
    // For example, check if token is properly formatted
    if (typeof token !== 'string' || token.length < 10) {
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};