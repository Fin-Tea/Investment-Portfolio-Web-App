import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Layout from "../../../components/app/layout";
import useAccount from "../../../hooks/account";
import Loader from "../../../components/loader";

export default function ChangePassword() {
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { changePassword } = useAccount();

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password required"),
    newPassword: Yup.string()
      .required("New password required")
      .min(8, "Password is too short - must be 8 chars minimum"),
    confirmNewPassword: Yup.string().oneOf(
      [Yup.ref("newPassword"), null],
      "Passwords must match"
    ).required("Password confirmation required"),
  });

  const formOptions = {
    resolver: yupResolver(validationSchema),
  };

  const { register, handleSubmit, formState, reset } =
    useForm(formOptions);
  const { errors } = formState;

  async function onSubmit(formData) {
    setLoading(true);
    const changePasswordResp = await changePassword(formData);

    if (changePasswordResp.passwordChanged) {
        setPasswordChanged(true);
        reset();
    } else if (changePasswordResp.error) {
        setError(changePasswordResp.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <Layout>
        <div className="h-full">
          <div className="py-4 h-full flex">
            <div className="ml-5 w-1/2 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4 px-5 mx-auto overflow-auto">
                
              <div className="text-center">
                <div className="pt-2 text-center relative">
                  <h2 className="mb-0 text-2xl self-center">Change Password</h2>
                </div>

                <hr className="w-full border-t border-gray-300 mx-auto" />
              </div>
              {!loading ? (<div>
              <div className="mt-4">
                <label className="text-sm ml">Current password*</label>
                <div className="flex items-top">
                  <input type="password"
                    className="border w-full rounded-md p-2"
                    {...register("currentPassword")}
                  />
                </div>
                <div className="text-red-600 text-xs">
                  {errors.currentPassword?.message}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm ml">New password*</label>
                <div className="flex items-top">
                  <input type="password"
                    className="border w-full rounded-md p-2"
                    {...register("newPassword")}
                  />
                </div>
                <div className="text-red-600 text-xs">
                  {errors.newPassword?.message}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm ml">Confirm new password*</label>
                <div className="flex items-top">
                  <input type="password"
                    className="border w-full rounded-md p-2"
                    {...register("confirmNewPassword")}
                  />
                </div>
                <div className="text-red-600 text-xs">
                  {errors.confirmNewPassword?.message}
                </div>
              </div>

              <div className="w-full mx-auto mt-4">
                  <button
                    className="w-full rounded-full bg-purple-800 text-white px-4 py-1 mb-2"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Change Password
                  </button>
                {passwordChanged && (<p className="text-green-600">Password changed successfully</p>)}
                {error && (<p className="text-orange-500">{`Something went wrong: ${error}`}</p>)}
                </div>
                </div>) : (<Loader />)}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
