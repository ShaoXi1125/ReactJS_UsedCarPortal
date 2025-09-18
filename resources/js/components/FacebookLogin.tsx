import React, { useEffect } from "react";
import axios from "axios";

const FacebookLoginButton = () => {
  useEffect(() => {
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: "1290201542848906", // 你的 App ID
        cookie: true,
        xfbml: true,
        version: "v23.0",
      });
    };

    // 插入 SDK script
      (function (d: Document, s: string, id: string) {
    let js: HTMLScriptElement | null;
    let fjs = d.getElementsByTagName(s)[0];

    if (d.getElementById(id)) return;

    js = d.createElement(s) as HTMLScriptElement;
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";

    if (fjs && fjs.parentNode) {
      fjs.parentNode.insertBefore(js, fjs);
    } else {
      d.head?.appendChild(js); // ✅ fallback，避免 null 报错
    }
  })(document, "script", "facebook-jssdk");
}, []);

  const handleLogin = () => {
    (window as any).FB.login(
      (response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;

          // 🔥 把 accessToken 传到 Laravel API
          axios
            .post("http://127.0.0.1:8000/api/auth/facebook-login", {
              access_token: accessToken,
            })
            .then((res) => {
              console.log("Laravel 登录成功 ✅", res.data);
              alert("登录成功！");
            })
            .catch((err) => {
              console.error("后端验证失败 ❌", err);
              alert("登录失败");
            });
        } else {
          alert("用户取消登录");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white">
      Facebook 登录
    </button>
  );
};

export default FacebookLoginButton;
