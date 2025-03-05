import { useState, useEffect } from "react";
import { Box, Stack, Typography, Button, Chip, Divider } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Item, StudyMaterial } from "../../../../types/studyMaterialObject";
import SummaryPage from "./SummaryPage";
import CardPage from "./CardPage";
import DocumentHead from "../../../../components/DocumentHead";
import PageTransition from "../../../../styles/PageTransition";
import PlayIcon from "/play-button.svg";
import EditIcon from "/edit-icon.svg";
import MoreIcon from "@mui/icons-material/MoreHorizRounded";
import MoreOptionPopover from "./MoreOptionPopover";
import { useUser } from "../../../../contexts/UserContext";

const ViewStudyMaterial = () => {
  const { user } = useUser();
  const { studyMaterialId } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Summary");
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!studyMaterialId) return;

    const fetchStudyMaterial = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/study-material/get-by-study-material-id/${studyMaterialId}`
        );
        const data = await response.json();
        console.log("API Response:", data);

        if (data && typeof data === "object" && "title" in data) {
          const items: Item[] = data.items || [];
          let tags: string[] = [];

          try {
            tags = Array.isArray(data.tags)
              ? data.tags
              : JSON.parse(data.tags || "[]");
          } catch (error) {
            console.error("Error parsing tags:", error);
            tags = [];
          }

          // Store the created_by_id from the API response
          const createdById = data.created_by_id || "";

          console.log("Created by ID:", createdById);
          console.log("Current user ID:", user?.firebase_uid);
          console.log("Is owner?", createdById === user?.firebase_uid);

          setStudyMaterial({
            title: data.title,
            tags,
            images: data.images || [],
            total_items: data.total_items || 0,
            created_by: data.created_by || "Unknown",
            created_by_id: createdById,
            total_views: data.total_views || 0,
            updated_at: data.updated_at || new Date().toISOString(),
            items,
            study_material_id: data.study_material_id || studyMaterialId || "",
            visibility: data.visibility || 0,
          });
        } else {
          console.error("Invalid response format:", data);
        }
      } catch (error) {
        console.error("Error fetching study material:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyMaterial();
  }, [studyMaterialId, user?.firebase_uid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditClick = () => {
    if (!studyMaterial) return;

    // Transform items to match the format expected by CreateStudyMaterial
    const transformedItems = studyMaterial.items.map((item, index) => ({
      id: index, // Using index as id
      term: item.term || "",
      definition: item.definition || "",
      image: item.image || null,
    }));

    // Navigate to create page with study material data
    navigate("/dashboard/study-material/create", {
      state: {
        editMode: true,
        studyMaterialId: studyMaterial.study_material_id,
        title: studyMaterial.title,
        tags: studyMaterial.tags,
        items: transformedItems,
      },
    });
  };

  return (
    <PageTransition>
      <Box className="h-screen w-full px-8">
        <DocumentHead title={studyMaterial?.title + " | Duel Learn"} />
        <Stack spacing={2.5}>
          <Stack direction={"row"}>
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight="bold">
                {loading ? "Loading..." : studyMaterial?.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2">
                  Created on{" "}
                  <strong>
                    {loading
                      ? "Loading..."
                      : formatDate(studyMaterial?.updated_at || "")}
                  </strong>
                </Typography>
                <Typography variant="subtitle2">•</Typography>
                <Typography variant="subtitle2">
                  Studied by{" "}
                  <strong>
                    {loading ? "Loading..." : studyMaterial?.total_views} People
                  </strong>
                </Typography>
              </Stack>
            </Stack>
            <Box flex={1} />
            <Stack direction={"row"} spacing={1} paddingTop={1}>
              <Button
                variant="contained"
                sx={{
                  alignItems: "center",
                  backgroundColor: "#4D18E8",
                  color: "#E2DDF3",
                  height: "fit-content",
                  borderRadius: "0.8rem",
                  padding: "0.5rem 2rem",
                  fontSize: "0.8rem",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <img src={PlayIcon} alt="" className="h-[0.9rem] w-auto mr-2" />
                Play
              </Button>
              {studyMaterial?.created_by_id === user?.firebase_uid && (
                <Button
                  variant="outlined"
                  onClick={handleEditClick}
                  sx={{
                    alignItems: "center",
                    borderColor: "#E2DDF3",
                    color: "#E2DDF3",
                    height: "fit-content",
                    borderRadius: "0.8rem",
                    padding: "0.5rem 2rem",
                    fontSize: "0.8rem",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <img
                    src={EditIcon}
                    alt=""
                    className="h-[0.9rem] w-auto mr-2"
                  />
                  Edit
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={handleClick}
                sx={{
                  alignItems: "center",
                  borderColor: "#E2DDF3",
                  color: "#E2DDF3",
                  height: "fit-content",
                  borderRadius: "0.8rem",
                  padding: "0.4rem 1rem",
                  fontSize: "0.9rem",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <MoreIcon />
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1">Tags</Typography>
            <Stack direction="row" spacing={1}>
              {studyMaterial?.tags?.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#4D18E8",
                    color: "#E2DDF3",
                    borderRadius: "0.8rem",
                    width: "fit-content",
                    height: "fit-content",
                    padding: "0.5rem 0.5rem",
                    fontSize: "0.9rem",
                  }}
                />
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="subtitle1"
              className="text-[#3B354D] font-bold"
            >
              {loading
                ? "Loading..."
                : `${studyMaterial?.total_items || 0} ITEMS`}
            </Typography>
            <Divider className="bg-[#3B354D] flex-1" />
          </Stack>
          <Stack spacing={4}>
            <Stack direction="row" spacing={1} className="flex items-center">
              {["Summary", "Cards"].map((label) => (
                <Button
                  key={label}
                  variant="text"
                  onClick={() => setSelected(label)}
                  sx={{
                    borderRadius: "0.8rem",
                    padding: "0.5rem 1rem",
                    transition: "all 0.3s ease-in-out",
                    color: selected === label ? "#E2DDF3" : "#3B354D",
                    backgroundColor:
                      selected === label ? "#3B354D" : "transparent",
                    "&:hover": {
                      backgroundColor: "#3B354D",
                      color: "#E2DDF3",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Stack>
            <Box mt={2}>
              {selected === "Summary" ? (
                <SummaryPage studyMaterial={studyMaterial} />
              ) : (
                <CardPage studyMaterial={studyMaterial} />
              )}
            </Box>
          </Stack>
        </Stack>
        <MoreOptionPopover
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          studyMaterialId={studyMaterialId || ""}
          isOwner={studyMaterial?.created_by_id === user?.firebase_uid}
        />
      </Box>
    </PageTransition>
  );
};

export default ViewStudyMaterial;
