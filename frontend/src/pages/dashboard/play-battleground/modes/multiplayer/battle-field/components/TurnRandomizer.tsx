// After successfully updating the battle session with the selected turn
try {
  // Initialize battle rounds
  const roundsResponse = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/initialize-rounds`,
    {
      session_uuid: battleState?.session_uuid,
      total_items: studyMaterialInfo.data.total_items
    }
  );

  if (roundsResponse.data.success) {
    console.log("Initialized battle rounds with total_items:", studyMaterialInfo.data.total_items);

    // Initialize battle scores
    const scoresResponse = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/initialize-scores`,
      {
        session_uuid: battleState?.session_uuid,
        host_id: hostId,
        guest_id: guestId
      }
    );

    if (scoresResponse.data.success) {
      console.log("Initialized battle scores with default health values");
    } else {
      console.error("Failed to initialize battle scores:", scoresResponse.data.message);
    }
  } else {
    console.error("Failed to initialize battle rounds:", roundsResponse.data.message);
  }
} catch (error) {
  console.error("Error initializing battle data:", error);
} 