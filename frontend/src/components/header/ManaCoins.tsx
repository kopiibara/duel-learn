import { useEffect, useState } from "react";
import { Box, Stack, Tooltip } from "@mui/material";

const ManaCoins = () => {
  const [mana, setMana] = useState<number | null>(null);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    const fetchManaCoins = async () => {
      try {
        const response = await fetch("/mock-data/ManaCoins.json");
        const data = await response.json();
        setMana(data.mana);
        setCoins(data.coin);
      } catch (error) {
        console.error("Error fetching ManaCoins data:", error);
      }
    };

    fetchManaCoins();
  }, []);

  return (
    <Box>
      <Stack direction={"row"} spacing={2}>
        <Tooltip title="Coins" arrow>
          <Stack direction="row" alignItems="center" spacing={1}>
            <img src="/coin-icon.svg" alt="Coin Icon" width={32} height={32} />
            {coins !== null ? <span>{coins}</span> : <span>Loading...</span>}
          </Stack>
        </Tooltip>
        <Tooltip title="Mana" arrow>
          <Stack direction="row" alignItems="center" spacing={1}>
            <img src="/mana-icon.svg" alt="Mana Icon" width={32} height={32} />
            {mana !== null ? <span>{mana}</span> : <span>Loading...</span>}
          </Stack>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default ManaCoins;
