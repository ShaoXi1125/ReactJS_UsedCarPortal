import React from "react";

const LoginWithGithub: React.FC = () => {
  const handleGithubLogin = () => {
    // 跳转到 Laravel 提供的 GitHub 登录入口
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
