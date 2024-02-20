import React, { useState, useEffect } from "react";
import Layout from "../../../components/app/layout";
import Tooltip from "../../../components/app/tooltip";
import usePlatformAccounts from "../../../hooks/platformAccounts";
import AccountInfo from "../../../components/app/account-info";
import PlatformAccountModal from "../../../components/app/platform-account-modal";
import DeleteConfirmationModal from "../../../components/app/delete-confirmation-modal";
import { useRouter } from "next/router";


export default function Accounts() {
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [accountId, setAccountId] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const router = useRouter();

  const {
    fetchPlatforms,
    fetchPlatformAccounts,
    createPlatformAccount,
    deletePlatformAccount,
  } = usePlatformAccounts();

  const platformAccount = platformAccounts.find(({id}) => id === accountId);

  async function handleCreate(formData) {
    const data = {
      platformId: formData.platform.value,
      accountName: formData.accountName,
    };

    try {
      const resp = await createPlatformAccount(data);
      setPlatformAccounts([...platformAccounts, resp.platformAccount]);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete() {
    try {
      const resp = await deletePlatformAccount(accountId);
      if (resp.deleted) {
        const idx = platformAccounts.find(({ id }) => id === accountId);
        setPlatformAccounts([...platformAccounts.slice(0, idx), ...platformAccounts.slice(idx + 1)]);
      }
     
    } catch (e) {
      console.error(e);
    }
    setAccountId(0);
  }

  function handleDeleteConfirm(platformAccountId) {
    setAccountId(platformAccountId);
    setIsDeleteModalOpen(true);
  }

  async function loadPlatformAccounts() {
    try {
      const resp = await fetchPlatformAccounts();
      console.log("platformAccounts resp", resp);
      setPlatformAccounts(resp.platformAccounts);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadPlatforms() {
    try {
      const resp = await fetchPlatforms();
      setPlatforms(
        resp.platforms.map(({ id, name }) => ({ label: name, value: id }))
      );
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  useEffect(() => {
    loadPlatformAccounts();
    loadPlatforms();
  }, []);

  useEffect(() => {
    const { create } = router.query;
    if (platforms?.length && create === "true") {
      setIsCreateModalOpen(true);
    }
  }, [platforms]);

  return (
    <div>
      <Layout>
        <div className="h-full">
          <div className="py-4 h-full flex">
            <div className="ml-5 w-1/2 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4 px-5 mx-auto overflow-auto">
              <div className="text-center">
                <div className="pt-2 text-center relative">
                  <h2 className="mb-0 text-2xl self-center">Accounts</h2>
                </div>

                <hr className="w-full border-t border-gray-300 mx-auto" />
                <div className="flex justify-center items-center w-[90%] mx-auto">
                  <button
                    className="rounded-full bg-purple-800 text-white px-4 py-1"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Trading/Investing Account
                  </button>
                  <Tooltip
                    text={
                      "Create Trading/Investing accounts to organize your trade results & performance insights. (This will not connect your actual trading/investing accounts. It's just for organizing your trades & insights to help you perform better as a trader/investor)"
                    }
                  />
                </div>
              </div>
              <div className="w-full h-full text-left mt-4">
                {!platformAccounts.length ? (
                  <div>
                    <p>No accounts yet.</p>
                    <p className="text-red-600 font-bold">
                      An account is required for importing trades and seeing
                      performance insights
                    </p>
                  </div>
                ) : (
                  platformAccounts.map(({ id, accountName, platform: { name }}) => <AccountInfo className="mb-4" key={id} id={id} accountName={accountName} platform={name} onDelete={handleDeleteConfirm} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
      <PlatformAccountModal  isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} platformOptions={platforms} onSubmit={handleCreate} />
      <DeleteConfirmationModal header="Delete Trading/Investing Account?" body={`You will no longer see your Trades/Investments & Insights from your ${platformAccount?.platform.name} ${platformAccount?.accountName} account if you delete it`} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onSubmit={handleDelete}  />
    </div>
  );
}
