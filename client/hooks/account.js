import useData from "./data";

const CHANGE_PASSWORD = "changePassword";

export default function useAccount() {
  const { fetchUserData } = useData();

  function changePassword({ currentPassword, newPassword, confirmNewPassword }) {
    return fetchUserData(CHANGE_PASSWORD, "POST", { currentPassword, newPassword, confirmNewPassword });
  }

  return {
    changePassword
  };
}
