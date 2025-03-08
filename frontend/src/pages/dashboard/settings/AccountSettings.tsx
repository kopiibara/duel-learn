import sampleAvatar from "../../../assets/profile-picture/bunny-picture.png";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import useAccountSettings from "../../../hooks/useAccountSettings";
import ProfilePictureModal from "../../../components/ProfilePictureModal";
import useProfilePicture from "../../../hooks/useProfilePicture";
import DeleteAccountModal from "../../../components/DeleteAccountModal";
import { CircularProgress } from "@mui/material";
import { useUser } from "../../../contexts/UserContext";

export default function AccountSettings() {
  const { user } = useUser();
  const {
    formik,
    isEditing,
    isChangingPassword,
    isCreatingPassword,
    showPassword,
    showConfirmPassword,
    error,
    hasNoPassword,
    isLoading,
    handleEditClick,
    handleDiscardClick,
    handlePasswordChangeClick,
    handleCreatePasswordClick,
    togglePassword,
    toggleConfirmPassword,
    hasChanges,
    handleProfilePictureChange,
    isDeleteModalOpen,
    isDeletingAccount,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAccount,
    handleUsernameChange,
  } = useAccountSettings();

  const {
    isModalOpen,
    selectedPicture,
    availablePictures,
    openModal,
    closeModal,
    handlePictureSelect,
    handleSave,
  } = useProfilePicture(formik.values.display_picture || sampleAvatar);

  const handleProfilePictureSave = () => {
    if (!isEditing) return;
    const newPicture = handleSave();
    handleProfilePictureChange(newPicture);
  };

  return (
    <div className="h-auto w-full">
      <main className="px-8">
        <h1 className="text-2xl font-semibold mb-6">Account Settings</h1>
        <div className="flex items-start">
          <form onSubmit={formik.handleSubmit} className="bg-[#0D0A17] rounded-[1rem] p-12 space-y-8">
            {/* Profile Image Section */}
            {error.general && (
                  <div className="w-[850px] px-4 py-2 bg-red-100 text-red-600 rounded-[0.8rem] border border-red-300">
                    {error.general}
                  </div>
                )}  
            <div className="space-y-4">
              <label className="block text-[1.05rem] text-[#9F9BAE]">
                Profile Image
              </label>
              <div className="flex items-center gap-6">
                <img
                  src={formik.values.display_picture || sampleAvatar}
                  alt="Profile"
                  className={`w-[198px] h-[194.49px] rounded-lg ${
                    isEditing
                      ? "cursor-pointer hover:opacity-80"
                      : "cursor-not-allowed"
                  }`}
                  onClick={() => isEditing && openModal()}
                />
              </div>
            </div>

            {/* Username Section */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-[1.05rem] text-[#9F9BAE]"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                {...formik.getFieldProps("username")}
                onChange={handleUsernameChange}
                disabled={!isEditing}
                className="w-[850px] h-[47px] px-4 py-5 bg-[#3B354D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] focus:border-[#4D18E8] transition-colors"
                style={{ color: isEditing ? "white" : "#6F658D" }}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.username}</p>
              )}
            </div>

            {/* Email Section */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[1.05rem] text-[#9F9BAE]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="w-[850px] h-[47px] px-4 py-5 bg-[#3B354D] text-[#6F658D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] focus:border-[#4D18E8] transition-colors"
              />
            </div>

            {/* Password Section */}
            {hasNoPassword ? (
              !isCreatingPassword ? (
                isEditing && (
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-[1.05rem] text-[#9F9BAE]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleCreatePasswordClick}
                      className="w-[850px] h-[47px] px-4 bg-[#2a2435] text-[#6F658D] rounded-[0.8rem] hover:bg-[#3b354d] transition-colors"
                    >
                      Create Password
                    </button>
                  </div>
                )
              ) : (
                <>
                  {error.general && (
                    <div className="w-[850px] px-4 py-2 bg-red-100 text-red-600 rounded-[0.8rem] border border-red-300">
                      {error.general}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label
                      htmlFor="newpassword"
                      className="block text-[1.05rem] text-[#9F9BAE]"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newpassword"
                        {...formik.getFieldProps("newpassword")}
                        className="w-[850px] h-[47px] px-4 py-5 bg-[#3B354D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] focus:border-[#4D18E8] transition-colors"
                        style={{ color: isEditing ? "white" : "#6F658D" }}
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9BAE]"
                      >
                        {showPassword ? (
                          <VisibilityRoundedIcon />
                        ) : (
                          <VisibilityOffRoundedIcon />
                        )}
                      </button>
                    </div>
                    {formik.touched.newpassword && formik.errors.newpassword && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.newpassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[1.05rem] text-[#9F9BAE]"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        {...formik.getFieldProps("confirmPassword")}
                        className="w-[850px] h-[47px] px-4 py-5 bg-[#3B354D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] focus:border-[#4D18E8] transition-colors"
                        style={{ color: isEditing ? "white" : "#6F658D" }}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9BAE]"
                      >
                        {showConfirmPassword ? (
                          <VisibilityRoundedIcon />
                        ) : (
                          <VisibilityOffRoundedIcon />
                        )}
                      </button>
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )
            ) : !isChangingPassword ? (
              isEditing && (
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-[1.05rem] text-[#9F9BAE]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordChangeClick}
                    className="w-[850px] h-[47px] px-4 bg-[#2a2435] text-[#6F658D] rounded-[0.8rem] hover:bg-[#3b354d] transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              )
            ) : (
              <>
                
                <div className="space-y-2">
                  <label
                    htmlFor="newpassword"
                    className="block text-[1.05rem] text-[#9F9BAE]"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newpassword"
                      {...formik.getFieldProps("newpassword")}
                      className="w-[850px] h-[47px] px-4 py-5 bg-[#3B354D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] focus:border-[#4D18E8] transition-colors"
                      style={{ color: isEditing ? "white" : "#6F658D" }}
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9BAE]"
                    >
                      {showPassword ? (
                        <VisibilityRoundedIcon />
                      ) : (
                        <VisibilityOffRoundedIcon />
                      )}
                    </button>
                  </div>
                  {formik.touched.newpassword && formik.errors.newpassword && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.newpassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[1.05rem] text-[#9F9BAE]"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      {...formik.getFieldProps("confirmPassword")}
                      className="w-[850px] h-[47px] px-4 py-5 bg-[#3B354D] rounded-[0.8rem] focus:outline-none focus:ring-2 focus:ring-[#4D18E8] focus:border-[#4D18E8] transition-colors"
                      style={{ color: isEditing ? "white" : "#6F658D" }}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9BAE]"
                    >
                      {showConfirmPassword ? (
                        <VisibilityRoundedIcon />
                      ) : (
                        <VisibilityOffRoundedIcon />
                      )}
                    </button>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleDiscardClick}
                className="px-8 bg-[#2a2435] text-[#6F658D] rounded-[0.8rem] hover:bg-[#3B354D] transition-colors"
              >
                Discard
              </button>
              <button
                type={isEditing ? "submit" : "button"}
                onClick={!isEditing ? handleEditClick : undefined}
                className={`px-10 py-2 ${
                  isEditing ? "bg-[#381898]" : "bg-[#381898]"
                } text-white rounded-[0.8rem] hover:bg-[#4D18E8] transition-colors`}
                disabled={isEditing && !hasChanges()}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : isEditing ? (
                  "Save"
                ) : (
                  "Edit"
                )}
              </button>
            </div>

            {/* Delete Account Section */}
            <div className="bg-[#1a1625]/50 rounded-lg p-8 mt-8">
              <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
              <p className="text-gray-400 mb-6">
                This will delete all your data and cannot be undone.
              </p>
              <button
                type="button"
                onClick={openDeleteModal}
                className="w-[182.45px] h-[45px] bg-[#f13f42] text-white rounded-lg hover:bg-red-900 transition-colors"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      </main>

      <ProfilePictureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        pictures={availablePictures}
        selectedPicture={selectedPicture}
        onPictureSelect={handlePictureSelect}
        onSave={handleProfilePictureSave}
        isEditing={isEditing}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
      />
    </div>
  );
}
