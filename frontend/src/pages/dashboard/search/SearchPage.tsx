import { Stack, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { StudyMaterial } from "../../../types/studyMaterialObject";
import { UserInfo } from "../../../types/userInfoObject";
import CardComponent from "../../../components/CardComponent";
import defaultPicture from "../../../assets/profile-picture/default-picture.svg";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "users", "materials"

  // New state for selected user and their materials
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userMaterials, setUserMaterials] = useState<StudyMaterial[]>([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  useEffect(() => {
    // Extract search query from URL
    const query = new URLSearchParams(location.search).get("query");
    const username = new URLSearchParams(location.search).get("user");

    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query);
    }

    // If there's a username in the URL, load that user's profile
    if (username) {
      fetchUserWithMaterials(username);
    }
  }, [location.search]);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    try {
      const response = await axios.get<{
        users: UserInfo[];
        study_materials: StudyMaterial[];
      }>(`http://localhost:5000/api/search/global/${query}`);

      setUsers(response.data.users);
      setStudyMaterials(response.data.study_materials);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setLoading(false);
  };

  // New function to fetch user profile with study materials
  const fetchUserWithMaterials = async (username: string) => {
    setLoadingUserData(true);
    try {
      console.log(`Fetching user materials for: ${username}`);
      const response = await axios.get<{
        user: UserInfo;
        study_materials: StudyMaterial[];
      }>(`http://localhost:5000/api/search/material-of-user/${username}`);

      console.log("API Response:", response.data);

      if (response.data && response.data.user) {
        setSelectedUser(response.data.user);

        // Transform the data to include all required fields for CardComponent
        const materials = response.data.study_materials.map((material) => ({
          ...material,
          images: [], // Add missing fields
          updatedAt: material.created_at,
          visibility: material.visibility,
          status: material.status,
          tags: material.tags,
          totalItems: material.total_items,
          created_by: material.created_by,
          created_by_id: material.created_by_id,
          created_at: material.created_at,
          updated_at: material.updated_at,
          totalViews: material.total_views,
          items: material.items.map((item) => ({
            ...item,
            images: [], // Add missing fields
            terms: item.term,
            definition: item.definition,
          })),
        }));

        setUserMaterials(materials);
        console.log("Transformed materials:", materials);
      } else {
        console.error("Invalid response format", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Show a user-friendly error message
      alert("Failed to load user data. Please try again.");
    } finally {
      setLoadingUserData(false);
    }
  };

  // Handle friend request
  const handleAddFriend = async (userId: string) => {
    try {
      // Implement your friend request logic here
      console.log("Friend request sent to:", userId);
      // You can add the API call to send friend request
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  // Handle view user profile and materials
  const handleViewUserProfile = (user: UserInfo) => {
    setSelectedUser(user);
    fetchUserWithMaterials(user.username);
    // Update URL without causing a full page reload
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("user", user.username);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  // Back to search results
  const handleBackToResults = () => {
    setSelectedUser(null);
    setUserMaterials([]);
    // Remove user param from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("user");
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  // Filter displayed results
  const getFilteredResults = () => {
    if (filter === "users") return { users, studyMaterials: [] };
    if (filter === "materials") return { users: [], studyMaterials };
    return { users, studyMaterials }; // "all"
  };

  const handleCardClick = async (studyMaterialId: string, title: string) => {
    try {
      await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/study-material/increment-views/${studyMaterialId}`,
        {
          method: "POST",
        }
      );

      navigate(`/dashboard/study-material/view/${studyMaterialId}`, {
        state: { title },
      });
    } catch (error) {
      console.error("Error updating total views:", error);
    }
  };

  const { users: filteredUsers, studyMaterials: filteredMaterials } =
    getFilteredResults();

  // If a specific user is selected, show their profile and materials
  if (selectedUser) {
    return (
      <Stack paddingX={4} spacing={2}>
        <button
          className="self-start flex items-center gap-2 pb-2 text-[#3B354C] hover:text-inherit transition-colors"
          onClick={handleBackToResults}
        >
          <ArrowBackIcon fontSize="small" /> Back to search results
        </button>

        {loadingUserData ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: "#8878C7" }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* User Profile */}
            <div className="flex items-center p-6 bg-[#3B354D] rounded-[0.8rem]">
              <img
                src={selectedUser.display_picture || defaultPicture}
                alt="Avatar"
                className="w-16 h-16 object-cover rounded-[5px] mr-6"
              />
              <div>
                <p className="text-[1.5rem] text-[#E2DDF3] font-medium">
                  {selectedUser.username}
                </p>
                <p className="text-[1rem] text-[#9F9BAE]">
                  Level {selectedUser.level || 1}
                </p>
              </div>
              <Box flex={1} />
              <button
                className="bg-[#52A647] rounded-[0.8rem] px-6 py-[0.4rem] h-fit text-[0.9rem]"
                onClick={() => handleAddFriend(selectedUser.firebase_uid)}
              >
                Add Friend
              </button>
            </div>

            {/* User's Study Materials */}
            <Stack spacing={2}>
              <p className="text-[#9F9BAE] font-semibold text-[2.5vh]">
                Study Materials by {selectedUser.username}
              </p>

              {userMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userMaterials.map((material) => (
                    <CardComponent
                      key={material.study_material_id}
                      title={material.title || ""}
                      tags={material.tags}
                      images={material.images || []}
                      totalItems={material.total_items || 0}
                      createdBy={material.created_by || ""}
                      createdById={material.created_by_id || ""}
                      createdAt={
                        material.created_at || new Date().toISOString()
                      }
                      updatedAt={
                        material.updated_at || new Date().toISOString()
                      }
                      visibility={material.visibility || 0}
                      status={material.status || "active"}
                      totalViews={material.total_views || 0}
                      items={material.items || []}
                      onClick={() =>
                        handleCardClick(
                          material.study_material_id,
                          material.title || ""
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="py-3 text-center text-[#9F9BAE]">
                  No study materials found for this user
                </p>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Stack paddingX={4} spacing={2}>
      <Stack spacing={1}>
        <p className="text-[#9F9BAE] font-semibold text-[2.3vh]">
          Matching Results for "{searchQuery}"
        </p>
        <Stack direction={"row"} spacing={0.5}>
          <button
            className={`rounded-[0.8rem] py-[0.5rem] px-[1rem] ${
              filter === "all"
                ? "bg-[#3B354C] text-[#E2DDF3]"
                : "bg-inherit text-[#3B354D]"
            } hover:text-[#E2DDF3] hover:bg-[#3B354C] transition-all duration-300 ease-in-out`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`rounded-[0.8rem] py-[0.5rem] px-[1rem] ${
              filter === "users"
                ? "bg-[#3B354C] text-[#E2DDF3]"
                : "bg-inherit text-[#3B354D]"
            } hover:text-[#E2DDF3] hover:bg-[#3B354C] transition-all duration-300 ease-in-out`}
            onClick={() => setFilter("users")}
          >
            Users
          </button>
          <button
            className={`rounded-[0.8rem] py-[0.5rem] px-[1rem] ${
              filter === "materials"
                ? "bg-[#3B354C] text-[#E2DDF3]"
                : "bg-inherit text-[#3B354D]"
            } hover:text-[#E2DDF3] hover:bg-[#3B354C] transition-all duration-300 ease-in-out`}
            onClick={() => setFilter("materials")}
          >
            Study Materials
          </button>
        </Stack>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: "#8878C7" }} />
        </Box>
      ) : (
        <>
          {(filter === "all" || filter === "users") &&
            filteredUsers.length > 0 && (
              <Stack spacing={2}>
                <p className="text-[#9F9BAE] font-semibold text-[2.5vh]">
                  Users
                </p>

                {filteredUsers.map((user) => (
                  <div
                    key={user.firebase_uid}
                    onClick={() => handleViewUserProfile(user)}
                    className="flex items-center p-6 bg-[#3B354D] border border-[#3B354D] rounded-[0.8rem] cursor-pointer hover:border-[#6F658D] transition-all duration-300 ease-in-out"
                  >
                    <img
                      src={user.display_picture || defaultPicture}
                      alt="Avatar"
                      className="w-auto h-18 object-cover rounded-[5px] mr-6 hover:scale-110 transition-all duration-300 cursor-pointer"
                    />
                    <div className="cursor-pointer">
                      <p className="text-[1.3rem] text-[#E2DDF3]">
                        {user.username}
                      </p>
                      <p className="text-[0.9rem] text-[#9F9BAE]">
                        Level {user.level || 1}
                      </p>
                    </div>
                    <Box flex={1} />
                    <button
                      className="bg-[#52A647] rounded-[0.8rem] px-6 py-[0.4rem] h-fit text-[0.9rem] hover:bg-[#478C3D] hover:scale-105 transition-all duration-300 ease-in-out"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent div's onClick from firing
                        handleAddFriend(user.firebase_uid);
                      }}
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </Stack>
            )}

          {(filter === "all" || filter === "materials") &&
            filteredMaterials.length > 0 && (
              <Stack spacing={2}>
                <p className="text-[#9F9BAE] font-semibold text-[2.5vh]">
                  Study Materials
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((material) => (
                    <CardComponent
                      key={material.study_material_id}
                      title={material.title}
                      tags={material.tags}
                      images={material.images}
                      totalItems={material.total_items}
                      createdBy={material.created_by}
                      createdById={material.created_by_id}
                      createdAt={material.created_at}
                      updatedAt={material.updated_at}
                      visibility={material.visibility}
                      status={material.status}
                      totalViews={material.total_views}
                      items={material.items}
                    />
                  ))}
                </div>
              </Stack>
            )}

          {!loading &&
            filteredUsers.length === 0 &&
            filteredMaterials.length === 0 && (
              <Box py={4} textAlign="center">
                <p className="text-[#9F9BAE] text-lg">
                  No results found for "{searchQuery}"
                </p>
              </Box>
            )}
        </>
      )}
    </Stack>
  );
};

export default SearchPage;
