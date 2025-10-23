import React from "react";

const LoginWithGithub: React.FC = () => {
  React.useEffect(() => {
    // 检查URL中是否有token参数
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    
    if (token) {
      // 存储token
      localStorage.setItem('auth_token', token);
      // 清除URL参数
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGithubLogin = () => {
    window.location.href = "http://127.0.0.1:8000/auth/github";
  };

  return (
    <button
      onClick={handleGithubLogin}
      style={{
        backgroundColor: "#24292e",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
      }}
    >
      <i className="fab fa-github" style={{ marginRight: "8px" }}></i>
      Login with GitHub
    </button>
  );
};

export default LoginWithGithub;
