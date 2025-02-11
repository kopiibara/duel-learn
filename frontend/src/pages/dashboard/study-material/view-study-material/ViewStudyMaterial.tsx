import { useState, useEffect } from "react";
import { Box, Stack, Typography, Button, Divider, Chip } from "@mui/material";
import DocumentHead from "../../../../components/DocumentHead";
import SummaryPage from "./SummaryPage";
import CardPage from "./CardPage";

interface Item {
  term: string;
  definition: string;
}
interface StudyMaterial {
  title: string;
  tags: string[];
  images: string[];
  total_items: string;
  created_by: string;
  total_views: number;
  created_at: string;
  items: Item[];
}
const ViewStudyMaterial = () => {
  const [selected, setSelected] = useState("Summary");
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(
    null
  );

  useEffect(() => {
    fetch("http://localhost:5001/api/get-study-material")
      .then((response) => response.json())
      .then((data: StudyMaterial[]) => {
        if (data.length > 0) {
          setStudyMaterial(data[0]); // Only set one study material
        }
      })
      .catch((error) =>
        console.error("Error fetching study material data:", error)
      );
  }, []);

  return (
    <Box className="h-screen w-full px-8">
      <DocumentHead title="View Study Material" />
      <Stack spacing={2.5}>
        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            {studyMaterial ? studyMaterial.title : "Loading..."}
          </Typography>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            sx={{
              borderRadius: "0.8rem",
              padding: "0.4rem 2rem",
              borderColor: "#E2DDF3",
              color: "#E2DDF3",
            }}
          >
            Play
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: "0.8rem",
              padding: "0.4rem 2rem",
              backgroundColor: "#4D18E8",
              color: "#E2DDF3",
            }}
          >
            Edit
          </Button>
        </Stack>

        {/* Date and Views */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            textAlign={"center"}
          >
            <img src="/edit-icon.svg" alt="edit" className="h-5" />
            <Typography variant="subtitle1">
              Created on{" "}
              <strong>
                {studyMaterial ? studyMaterial["created_at"] : "Loading..."}
              </strong>
            </Typography>
          </Stack>

          <Typography variant="subtitle2">&#x2022;</Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <img
              src="/sidebar-icons/profile-icon.svg"
              alt="profile"
              className="h-5"
            />
            <Typography variant="subtitle1">
              Studied by{" "}
              <strong>
                {studyMaterial ? studyMaterial["total_views"] : "Loading..."}{" "}
                People
              </strong>
            </Typography>
          </Stack>
        </Stack>

        {/* Tags */}
        <Stack spacing={2}>
          <Typography variant="subtitle1">Tags</Typography>
          <Stack direction="row" spacing={1}>
            {studyMaterial &&
              studyMaterial.tags.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  sx={{
                    backgroundColor: "#4D18E8",
                    color: "#E2DDF3",
                    padding: "0.4rem",
                  }}
                />
              ))}
          </Stack>
        </Stack>

        {/* Item Counter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" className="text-[#3B354D] font-bold">
            {studyMaterial && studyMaterial.items
              ? `${studyMaterial.items.length} ITEMS`
              : "0 ITEMS"}
          </Typography>
          <Divider className="bg-[#3B354D] flex-1" />
        </Stack>

        <Stack spacing={4}>
          {/* Navigation */}
          <Stack direction="row" spacing={1} className="flex items-center ">
            {["Summary", "Cards"].map((label) => (
              <Button
                key={label}
                variant="text"
                onClick={() => setSelected(label)}
                sx={{
                  color: selected === label ? "#E2DDF3" : "#3B354D",
                  padding: "0.6rem 2rem",
                  borderRadius: "0.8rem",
                  backgroundColor:
                    selected === label ? "#3B354D" : "transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#3B354D",
                    color: "#E2DDF3",
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Stack>

          {/* Content Switching */}
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
  );
};

export default ViewStudyMaterial;
