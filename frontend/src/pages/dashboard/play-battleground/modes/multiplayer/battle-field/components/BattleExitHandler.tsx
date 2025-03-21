import { useEffect, useRef } from "react";
import axios from "axios";

interface BattleExitHandlerProps {
    lobbyCode: string;
    isHost: boolean;
    hostId: string;
    guestId: string;
    battleState: any;
    isEndingBattle: boolean;
    setIsEndingBattle: (isEnding: boolean) => void;
    showVictoryModal: boolean;
    handleLeaveBattle: () => Promise<void>;
}

/**
 * Component to handle various ways a user can exit a battle:
 * - Browser back button
 * - Page refresh
 * - URL change
 * - Browser/tab close
 */
export default function BattleExitHandler({
    lobbyCode,
    isHost,
    hostId,
    guestId,
    battleState,
    isEndingBattle,
    setIsEndingBattle,
    showVictoryModal,
    handleLeaveBattle
}: BattleExitHandlerProps) {
    // Setup event listeners for page navigation and refresh
    useEffect(() => {
        // Don't set up event listeners if victory modal is shown
        if (showVictoryModal) {
            // Remove any existing listeners
            window.onbeforeunload = null;
            return;
        }

        // Flag to track if the user is intentionally leaving
        let isIntentionallyLeaving = false;

        // Handle page reload or tab close
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Only show confirmation dialog if not already intentionally leaving
            // and not already ending battle
            if (!isIntentionallyLeaving && !isEndingBattle) {
                event.preventDefault();
                event.returnValue = "Are you sure you want to leave the battle? Your progress will be lost and the battle will end.";

                // Set a flag in sessionStorage to indicate user confirmed reload
                // This will be checked on page load to handle the reload case
                sessionStorage.setItem('battle_reload_confirmed', 'true');
                sessionStorage.setItem('battle_lobby_code', lobbyCode || '');
                sessionStorage.setItem('battle_is_host', isHost ? 'true' : 'false');
                sessionStorage.setItem('battle_host_id', hostId || '');
                sessionStorage.setItem('battle_guest_id', guestId || '');

                return event.returnValue;
            }
        };

        // Handle browser back button and URL changes
        const handlePopState = async (event: PopStateEvent) => {
            // Only handle if not already leaving intentionally or ending battle
            if (!isIntentionallyLeaving && !isEndingBattle) {
                // Prevent the navigation first
                event.preventDefault();
                window.history.pushState(null, '', window.location.pathname);

                // Show confirmation dialog
                const confirmLeave = window.confirm(
                    "Are you sure you want to leave the battle? Your progress will be lost and the battle will end."
                );

                if (confirmLeave) {
                    console.log("User confirmed leaving battle via popstate");
                    isIntentionallyLeaving = true;

                    // Remove the beforeunload handler to prevent additional confirmation dialog
                    window.removeEventListener('beforeunload', handleBeforeUnload);
                    window.onbeforeunload = null;

                    // Show the loading overlay
                    setIsEndingBattle(true);

                    try {
                        // Wait for the leave battle function to complete
                        await handleLeaveBattle();

                        // The handleLeaveBattle function already handles navigation
                    } catch (err) {
                        console.error("Error in handleLeaveBattle called from popstate:", err);
                        // Force redirect even if error occurs
                        window.location.replace('/dashboard/home');
                    }
                }
            } else {
                console.log("Ignoring popstate event - already leaving:", {
                    isIntentionallyLeaving,
                    isEndingBattle
                });
            }
        };

        // Handle direct URL changes
        const handleURLChange = async () => {
            // Only handle if not already leaving intentionally or ending battle
            if (!isIntentionallyLeaving && !isEndingBattle) {
                const currentPath = window.location.pathname;
                const battlePath = `/dashboard/pvp-battle/${lobbyCode}`;

                if (currentPath !== battlePath) {
                    console.log(`URL changed from ${battlePath} to ${currentPath}`);

                    // Force back to the battle path first to prevent immediate navigation
                    window.history.pushState(null, '', battlePath);

                    // User is trying to navigate away
                    const confirmLeave = window.confirm(
                        "Are you sure you want to leave the battle? Your progress will be lost and the battle will end."
                    );

                    if (confirmLeave) {
                        console.log("User confirmed leaving battle via URL change");
                        isIntentionallyLeaving = true;

                        // Remove the beforeunload handler to prevent additional confirmation dialog
                        window.removeEventListener('beforeunload', handleBeforeUnload);
                        window.onbeforeunload = null;

                        // Show the loading overlay
                        setIsEndingBattle(true);

                        try {
                            // Wait for the leave battle function to complete
                            await handleLeaveBattle();

                            // The handleLeaveBattle function already handles navigation
                        } catch (err) {
                            console.error("Error in handleLeaveBattle called from URL change:", err);
                            // Force redirect even if error occurs
                            window.location.replace('/dashboard/home');
                        }
                    }
                }
            } else {
                console.log("Ignoring URL change event - already leaving:", {
                    isIntentionallyLeaving,
                    isEndingBattle
                });
            }
        };

        // Special handler for actual navigation away (after confirmation)
        const handleUnload = () => {
            // Check if this is a reload case where we've already stored the data
            const reloadConfirmed = sessionStorage.getItem('battle_reload_confirmed') === 'true';

            // Only send the request if user hasn't confirmed through another handler
            // and we're not already in the process of ending the battle
            // and this is not a reload we're already handling
            if (!isIntentionallyLeaving && !isEndingBattle && !reloadConfirmed && battleState && (battleState.session_uuid || battleState.ID)) {
                try {
                    // Use synchronous approach for unload event
                    // This is a fallback in case the user closes the browser without confirmation
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end`, false); // Synchronous request
                    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

                    // Create the payload - include both session_uuid and session_id
                    const payload = JSON.stringify({
                        lobby_code: lobbyCode,
                        winner_id: isHost ? guestId : hostId,
                        battle_end_reason: 'Left The Game',
                        session_uuid: battleState.session_uuid,
                        session_id: battleState.ID // Include numeric ID as fallback
                    });

                    console.log('Sending sync XHR before unload with payload:', payload);
                    xhr.send(payload);

                    // Log the response (though this might not be visible in all browsers during unload)
                    console.log('XHR status:', xhr.status, xhr.statusText);
                } catch (e) {
                    console.error('Error in sync XHR during unload:', e);
                }
            }
        };

        // Register event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('hashchange', handleURLChange);

        // Push initial state to prevent back button on first click
        window.history.pushState(null, '', window.location.pathname);

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('hashchange', handleURLChange);
        };
    }, [lobbyCode, isHost, hostId, guestId, battleState, isEndingBattle, showVictoryModal, handleLeaveBattle, setIsEndingBattle]);

    // Check for battle reload flag when component mounts
    useEffect(() => {
        const reloadConfirmed = sessionStorage.getItem('battle_reload_confirmed') === 'true';

        if (reloadConfirmed) {
            console.log("Detected reload after confirmation, ending battle...");

            // Get battle data from sessionStorage
            const storedLobbyCode = sessionStorage.getItem('battle_lobby_code');
            const storedIsHost = sessionStorage.getItem('battle_is_host') === 'true';
            const storedHostId = sessionStorage.getItem('battle_host_id');
            const storedGuestId = sessionStorage.getItem('battle_guest_id');

            if (storedLobbyCode) {
                // Show loading state
                setIsEndingBattle(true);

                // Send request to end battle
                const payload = {
                    lobby_code: storedLobbyCode,
                    winner_id: storedIsHost ? storedGuestId : storedHostId,
                    battle_end_reason: 'Left The Game'
                };

                console.log("Sending battle end request after reload:", payload);

                axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/gameplay/battle/end`,
                    payload
                )
                    .then(response => {
                        console.log("Battle ended successfully after reload:", response.data);
                    })
                    .catch(error => {
                        console.error("Error ending battle after reload:", error);
                    })
                    .finally(() => {
                        // Clear the reload flags
                        sessionStorage.removeItem('battle_reload_confirmed');
                        sessionStorage.removeItem('battle_lobby_code');
                        sessionStorage.removeItem('battle_is_host');
                        sessionStorage.removeItem('battle_host_id');
                        sessionStorage.removeItem('battle_guest_id');

                        // Redirect to dashboard
                        window.location.replace('/dashboard/home');
                    });
            }
        }
    }, [setIsEndingBattle]);

    return null; // This component doesn't render anything
} 