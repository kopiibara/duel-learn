import { useState, useEffect } from "react";
import { Box, Stack, Typography, Button, Chip, Divider } from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import SummaryPage from "./SummaryPage";
import CardPage from "./CardPage";
import DocumentHead from "../../../../components/DocumentHead";
import PageTransition from "../../../../styles/PageTransition";

interface Item {
  term: string;
  definition: string;
  image?: File | null;
}

interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: number;
  created_by: string;
  total_views: number;
  created_at: string;
  items: Item[];
  study_material_id?: string;
}

const ViewStudyMaterial = () => {
  const { studyMaterialId } = useParams();
  const location = useLocation();
  const [selected, setSelected] = useState("Summary");
  const [title, setTitle] = useState(location.state?.title || "");
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(
    null
  );
  const [loading, setLoading] = useState(true);

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
          let items: Item[] = data.items || [];
          let tags: string[] = [];

          try {
            tags = Array.isArray(data.tags)
              ? data.tags
              : JSON.parse(data.tags || "[]");
          } catch (error) {
            console.error("Error parsing tags:", error);
            tags = [];
          }

          setStudyMaterial({
            title: data.title,
            tags,
            images: data.images || [],
            total_items: data.total_items || 0,
            created_by: data.created_by || "Unknown",
            total_views: data.total_views || 0,
            created_at: data.created_at || new Date().toISOString(),
            items,
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
  }, [studyMaterialId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PageTransition>
      <Box className="h-screen w-full px-8">
        <DocumentHead title={studyMaterial?.title + " | Duel Learn"} />
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h3" fontWeight="bold">
              {loading ? "Loading..." : studyMaterial?.title}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">
              Created on{" "}
              <strong>
                {loading
                  ? "Loading..."
                  : formatDate(studyMaterial?.created_at || "")}
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
          <Stack spacing={2}>
            <Typography variant="subtitle1">Tags</Typography>
            <Stack direction="row" spacing={1}>
              {studyMaterial?.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{ backgroundColor: "#4D18E8", color: "#E2DDF3" }}
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
                    color: selected === label ? "#E2DDF3" : "#3B354D",
                    backgroundColor:
                      selected === label ? "#3B354D" : "transparent",
                    "&:hover": { backgroundColor: "#3B354D", color: "#E2DDF3" },
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
      </Box>
    </PageTransition>
  );
};

export default ViewStudyMaterial;
