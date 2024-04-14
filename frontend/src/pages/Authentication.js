import { json, redirect } from "react-router-dom";
import AuthForm from "../components/AuthForm";

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export async function authAction({ request }) {
  const queryParam = new URL(request.url).searchParams;
  const mode = queryParam.get("mode") || "login";
  const formData = await request.formData();

  if (mode !== "login" && mode !== "signup") {
    throw json(
      { isError: true, message: "Wrong mode selected" },
      { status: 422 }
    );
  }

  const userData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const res = await fetch("http://localhost:8080/" + mode, {
    method: "POST",
    body: JSON.stringify(userData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(res);
  if (res.status === 401 || res.status === 422) {
    return res;
  }
  if (!res.ok) {
    throw json({ isError: true, message: `Error in ${mode}` }, { status: 500 });
  }
  const data = await res.json();
  const token = data.token;
  localStorage.setItem("token", token);
  let expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  localStorage.setItem("expiration", expiration.toISOString());
  return redirect("/");
}
