import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Layout from "../components/layout-new";
import Loader from "../components/loader";
import useAuth from "../hooks/auth";

export default function Login() {
  const router = useRouter();
  const { loading, error: authError, user, requestMagicLink, magicLinkSent } = useAuth();

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors } = formState;

  async function onSubmit({ email }) {
    await requestMagicLink({ email });
  }

  if (authError) {
    console.log("authError", authError);
  }

  useEffect(() => {
    // redirect to home if already logged in
    if (user) {
      const returnUrl = router.query.returnUrl || "/";
      router.push(returnUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authError, user]);

  return (
    <Layout>
      <div className="container" style={{ height: "100vh" }}>
        {!loading ? (
          <div
            className="card-body"
            style={{
              margin: "0 auto",
              maxWidth: 400,
              border: "1px solid #c5c5c5",
              borderRadius: 10,
            }}
          >
            <h3>Magic Link</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  type="text"
                  {...register("email")}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                />
                <div className="invalid-feedback">{errors.email?.message}</div>
              </div>
              <button
                type="submit"
                disabled={formState.isSubmitting}
                className="bg-purple-800 text-white px-4 py-2 rounded-md cursor-pointer mt-4 w-full"
              >
                {formState.isSubmitting && (
                  <span className="spinner-border spinner-border-sm mr-1"></span>
                )}
                Request Magic Link
              </button>
              {authError && (
                <div className="alert alert-danger mt-3 mb-0">{authError}</div>
              )}

{magicLinkSent && (
                <div className="text-green-700 mt-3 mb-0">A Magic Link email is on the way. Check your inbox</div>
              )}
            </form>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </Layout>
  );
}
