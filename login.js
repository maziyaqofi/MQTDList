const form = document.getElementById("loginForm");

form.addEventListener("submit", function (e) {
  e.preventDefault(); // mencegah reload halaman

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  if (username === "User123" && password === "123456") {
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("username", username);

    if (remember) {
      localStorage.setItem("rememberUser", username);
    } else {
      localStorage.removeItem("rememberUser");
    }

    window.location.href = "dashboard.html";
  } else {
    alert("Username atau password salah!");
  }
});